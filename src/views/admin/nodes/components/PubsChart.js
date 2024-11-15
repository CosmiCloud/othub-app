// Chakra imports
import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorModeValue,
  useMediaQuery,
} from "@chakra-ui/react";
// Custom components
import Card from "components/card/Card.js";
import React, { useState, useEffect, useContext } from "react";
import { IoCheckmarkCircle } from "react-icons/io5";
import { MdBarChart, MdOutlineCalendarToday } from "react-icons/md";
// Assets
import { RiArrowUpSFill } from "react-icons/ri";
import { AccountContext } from "../../../../AccountContext";
import moment from "moment";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import "chartjs-adapter-date-fns";
import "chartjs-plugin-annotation";
import Loading from "components/effects/Loading.js";

Chart.register(...registerables);

const config = {
  headers: {
    "X-API-Key": process.env.REACT_APP_OTHUB_KEY,
  },
};

export default function CumEarnings(props) {
  const { ...rest } = props;
  // Chakra Color Mode

  let menuBg = useColorModeValue("white", "navy.800");
  const shadow = useColorModeValue(
    "14px 17px 40px 4px rgba(112, 144, 176, 0.18)",
    "14px 17px 40px 4px rgba(112, 144, 176, 0.06)"
  );
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = useColorModeValue("secondaryGray.600", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const iconColor = useColorModeValue("brand.500", "white");
  const bgButton = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const bgHover = useColorModeValue(
    { bg: "secondaryGray.400" },
    { bg: "whiteAlpha.50" }
  );
  const bgFocus = useColorModeValue(
    { bg: "secondaryGray.300" },
    { bg: "whiteAlpha.100" }
  );

  const [small] = useMediaQuery("(min-width: 765px)");
  const [medium] = useMediaQuery("(min-width: 1024px)");

  const height = medium ? "50%" : small ? "100%" : "100%";
  const width = medium ? "100%" : small ? "100%" : "100%";

  const [inputValue, setInputValue] = useState("");
  const [button, setButtonSelect] = useState("");
  const [isLoading, setisLoading] = useState(false);
  const [monthly_nodes, setMonthlyNodes] = useState(null);
  const [last_nodes, setLastNodes] = useState(null);
  const [latest_nodes, setLatestNodes] = useState(null);
  const { blockchain, setBlockchain } = useContext(AccountContext);
  const { network, setNetwork } = useContext(AccountContext);
  const ethBox = useColorModeValue("white", "navy.800");
  let data;
  let response;
  let latest_stake = 0;
  let latest_rewards = 0;
  let last_stake = 0;
  let last_rewards = 0;

  useEffect(() => {
    async function fetchData() {
      try {
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    setMonthlyNodes(props.monthly_nodes);
    setLastNodes(props.last_nodes);
    setLatestNodes(props.latest_nodes);
    setInputValue("All-Time");
    fetchData();
  }, []);

  const formattedData = {
    datasets: [],
  };

  const changeFrequency = async (frequency, button_select, button_text) => {
    try {
      setInputValue(button_text);
      setButtonSelect(button_select);
      setMonthlyNodes(null);

      data = {
        frequency: frequency,
        timeframe: button_select,
        network: network,
        blockchain: latest_nodes.chainName,
        nodeName: latest_nodes.tokenName,
        grouped: "no",
      };
      response = await axios.post(
        `${process.env.REACT_APP_API_HOST}/nodes/stats`,
        data,
        config
      );

      setMonthlyNodes(response.data.result[0].data);

      data = {
        network: network,
        blockchain: latest_nodes.chainName,
        nodeName: latest_nodes.tokenName,
        frequency:
          button_select === "24"
            ? "last24h"
            : button_select === "168"
            ? "last7d"
            : button_select === "30"
            ? "last30d"
            : button_select === "160"
            ? "last6m"
            : button_select === "12"
            ? "last1y"
            : "latest",
      };
      response = await axios.post(
        `${process.env.REACT_APP_API_HOST}/nodes/stats`,
        data,
        config
      );

      setLastNodes(response.data.result[0].data[0]);
    } catch (e) {
      console.log(e);
    }
  };

  if (monthly_nodes) {
    let format = "MMM YY";
    if (button === "24") {
      format = "HH:00";
    }
    if (button === "168") {
      format = "ddd HH:00";
    }
    if (button === "30") {
      format = "DD MMM YY";
    }
    if (button === "160") {
      format = "DD MMM YY";
    }

    const uniqueDates = new Set();
    const formattedDates = [];

    monthly_nodes
      .filter((item) => {
        const formattedDate = moment(
          button === "24" || button === "168" ? item.datetime : item.date
        ).format(format);
        // Check if the formatted date is unique
        if (!uniqueDates.has(formattedDate)) {
          uniqueDates.add(formattedDate);
          formattedDates.push(formattedDate);
          return true;
        }
        return false;
      })
      .map((item) =>
        moment(
          button === "24" || button === "168" ? item.datetime : item.date
        ).format(format)
      );

    formattedData.labels =
      button === "24" || button === "168"
        ? formattedDates
        : formattedDates.sort(
            (a, b) => moment(a, format).toDate() - moment(b, format).toDate()
          );

    let final_pubs = [];
    for (const date of formattedData.labels) {
      let pubs = 0;
      for (const item of monthly_nodes) {
        if (
          moment(
            button === "24" || button === "168" ? item.datetime : item.date
          ).format(format) === date
        ) {
          pubs = item.pubsCommited + pubs;
        }
      }
      final_pubs.push(pubs);
    }

    let pubs_obj = {
      label: "Assets",
      data: final_pubs,
      fill: false,
      borderColor: "#11047A",
      backgroundColor: "#11047A",
      type: "bar",
    };

    formattedData.datasets.push(pubs_obj);
  } else {
    return (
      <Card
        justifyContent="center"
        align="center"
        direction="column"
        w="100%"
        mb="0px"
        boxShadow="md"
        {...rest}
      >
        <Flex flexDirection="column" me="20px" mt="28px">
          <Flex w="100%" flexDirection={{ base: "column", lg: "row" }}>
            <Box minH="260px" minW="75%" mx="auto">
              <Loading />
            </Box>
          </Flex>
        </Flex>
      </Card>
    );
  }

  const options = {
    elements: {
      point: {
        radius: 0,
        hoverRadius: 6, // Increase the radius on hover
        hoverBackgroundColor: "white",
        hoverBorderWidth: 3,
        cursor: "crosshair",
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        stacked: true,
        title: {
          display: false,
          text: "TRAC",
          color: "#11047A",
          font: {
            size: 12,
          },
        },
        ticks: {
          callback: function (value, index, values) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + "M";
            } else if (value >= 1000) {
              return (value / 1000).toFixed(1) + "K";
            } else {
              return value;
            }
          },
          color: "#11047A",
        },
        grid: {
          display: false, // hide grid lines
          borderWidth: 0,
        },
        borderWidth: 0, // remove y axis border
        axis: {
          display: false, // hide y axis line
        },
      },
      x: {
        beginAtZero: false,
        stacked: true,
        title: {
          display: true,
          text: "Date (UTC)",
          color: "#11047A",
          font: {
            size: 12,
          },
        },
        grid: {
          display: false, // hide grid lines
          borderWidth: 0,
        },
        axis: {
          display: false, // hide x axis line
        },
        ticks: {
          color: "#11047A",
        },
      },
    },
    plugins: {
      legend: {
        display: true, // hide legend
      },
      tooltip: {
        mode: "nearest",
        intersect: false,
        callbacks: {
          label: function (context) {
            let label = "";
            const datasets = context.chart.data.datasets;
            const tooltipData = context.chart.tooltip;
            if (tooltipData) {
              const index = tooltipData.dataPoints[0].dataIndex;
              datasets.forEach((dataset, i) => {
                if (dataset.data[index]) {
                  return (label += `${dataset.label}: ${dataset.data[
                    index
                  ].toFixed(2)} `);
                }
              });
            }
          },
        },
      },
    },
    // Custom cursor styling
    hover: {
      mode: "nearest", // Set hover mode to nearest
      intersect: false,
      axis: "x",
      animationDuration: 0,
      onHover: function (_, chartElement) {
        // Log to check if the onHover function is triggered
        console.log("Hover event:", chartElement);

        // Change cursor to crosshair when hovering over the chart
        const chart = chartElement.chart;
        if (chart) {
          chart.canvas.style.cursor = chartElement ? "crosshair" : "default";
        }
      },
      // Additional hover configuration if needed
    },
  };

  return (
    <Card
      justifyContent="center"
      align="center"
      direction="column"
      w="100%"
      mb="0px"
      boxShadow="md"
      {...rest}
    >
      <Flex justify="space-between" ps="0px" pe="20px" pt="5px">
        <Flex align="center" w="100%">
          <Menu>
            <MenuButton
              fontSize="md"
              fontWeight="500"
              borderRadius="7px"
              marginRight="20px"
              px="24px"
              py="7px"
              bg={boxBg}
              color={textColorSecondary}
            >
              <Icon as={MdOutlineCalendarToday} color={"#fffff"} me="4px" />
              {inputValue}
            </MenuButton>
            <MenuList
              boxShadow={shadow}
              p="0px"
              mt="-10px"
              borderRadius="5px"
              bg={menuBg}
              border="none"
            >
              <Flex flexDirection="column" p="3px" key={1}>
                <MenuItem
                  _hover={{
                    bg: "none",
                    bgColor: textColorSecondary,
                    color: "#ffffff",
                  }}
                  _focus={{ bg: "none" }}
                  borderRadius="5px"
                  px="14px"
                  onClick={(e) =>
                    changeFrequency("monthly", "1000", "All-Time")
                  }
                  color={textColorSecondary}
                  fontSize="16px"
                  fontWeight="bold"
                >
                  All-Time
                </MenuItem>
                <MenuItem
                  _hover={{
                    bg: "none",
                    bgColor: textColorSecondary,
                    color: "#ffffff",
                  }}
                  _focus={{ bg: "none" }}
                  borderRadius="5px"
                  px="14px"
                  onClick={(e) => changeFrequency("hourly", "24", "Last Day")}
                  color={textColorSecondary}
                  fontSize="16px"
                  fontWeight="bold"
                >
                  Last Day
                </MenuItem>
                <MenuItem
                  _hover={{
                    bg: "none",
                    bgColor: textColorSecondary,
                    color: "#ffffff",
                  }}
                  _focus={{ bg: "none" }}
                  borderRadius="5px"
                  px="14px"
                  onClick={(e) => changeFrequency("hourly", "168", "Last Week")}
                  color={textColorSecondary}
                  fontSize="16px"
                  fontWeight="bold"
                >
                  Last Week
                </MenuItem>
                <MenuItem
                  _hover={{
                    bg: "none",
                    bgColor: textColorSecondary,
                    color: "#ffffff",
                  }}
                  _focus={{ bg: "none" }}
                  borderRadius="5px"
                  px="14px"
                  onClick={(e) => changeFrequency("daily", "30", "Last Month")}
                  color={textColorSecondary}
                  fontSize="16px"
                  fontWeight="bold"
                >
                  Last Month
                </MenuItem>
                <MenuItem
                  _hover={{
                    bg: "none",
                    bgColor: textColorSecondary,
                    color: "#ffffff",
                  }}
                  _focus={{ bg: "none" }}
                  borderRadius="5px"
                  px="14px"
                  onClick={(e) =>
                    changeFrequency("daily", "182", "Last 6 Months")
                  }
                  color={textColorSecondary}
                  fontSize="16px"
                  fontWeight="bold"
                >
                  Last 6 Months
                </MenuItem>
                <MenuItem
                  _hover={{
                    bg: "none",
                    bgColor: textColorSecondary,
                    color: "#ffffff",
                  }}
                  _focus={{ bg: "none" }}
                  borderRadius="5px"
                  px="14px"
                  onClick={(e) => changeFrequency("monthly", "12", "Last Year")}
                  color={textColorSecondary}
                  fontSize="16px"
                  fontWeight="bold"
                >
                  Last Year
                </MenuItem>
              </Flex>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
      <Flex w="100%" flexDirection={{ base: "column", lg: "row" }}>
        <Flex flexDirection="column" me="20px" mt="28px">
          <Text
            color={textColor}
            fontSize="34px"
            textAlign="start"
            fontWeight="700"
            lineHeight="100%"
          >
            {button && last_nodes.pubsCommited >= 1000000
              ? (last_nodes.pubsCommited / 1000000).toFixed(2) + "M"
              : last_nodes.pubsCommited >= 1000
              ? (last_nodes.pubsCommited / 1000).toFixed(2) + "K"
              : last_nodes.pubsCommited.toFixed(2)}
          </Text>
          <Flex align="center" mb="20px">
            <Text
              color="secondaryGray.600"
              fontSize="sm"
              fontWeight="500"
              mt="4px"
              me="12px"
            >
              Assets
            </Text>
            <Flex align="center">
              <Icon as={RiArrowUpSFill} color="green.500" me="2px" mt="2px" />
              <Text color="green.500" fontSize="sm" fontWeight="700">
                {`%${(
                  (last_nodes.pubsCommited / latest_nodes.pubsCommited) *
                  100
                ).toFixed(1)}`}
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Box minH="260px" minW="80%">
          <Text
            color={textColor}
            fontSize={{ base: "md", md: "md", lg: "lg", xl: "24px" }}
            mt="-40px"
            pb="20px"
            textAlign="right"
            fontWeight="700"
            lineHeight="100%"
          >
            Committed Assets
          </Text>
          <Line
            height={height}
            width={width}
            data={formattedData}
            options={options}
          />
        </Box>
      </Flex>
    </Card>
  );
}
