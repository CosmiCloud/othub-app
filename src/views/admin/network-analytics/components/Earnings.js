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
  Tooltip
} from "@chakra-ui/react";
// Custom components
import Card from "components/card/Card.js";
import React, { useState, useEffect, useContext } from "react";
import { IoCheckmarkCircle } from "react-icons/io5";
import { MdInfoOutline, MdOutlineCalendarToday } from "react-icons/md";
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

function formatNumberWithSpaces(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function CumEarnings(props) {
  const { ...rest } = props;
  // Chakra Color Mode

  let menuBg = useColorModeValue("white", "navy.800");
  const shadow = useColorModeValue(
    "14px 17px 40px 4px rgba(112, 144, 176, 0.18)",
    "14px 17px 40px 4px rgba(112, 144, 176, 0.06)"
  );
  const tracColor = useColorModeValue("brand.900", "white");
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
  const [assetData, setAssetData] = useState(null);
  const [last_nodes, setLastNodes] = useState(null);
  const [latest_nodes, setLatestNodes] = useState(null);
  const { blockchain, setBlockchain } = useContext(AccountContext);
  const { network, setNetwork } = useContext(AccountContext);
  const ethBox = useColorModeValue("white", "navy.800");
  let data;
  let response;
  let latest_stake = 0;
  let latest_rewards = 0;
  let latest_earnings = 0;
  let last_stake = 0;
  let last_rewards = 0;
  let last_earnings = 0;

  useEffect(() => {
    async function fetchData() {
      try {
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    setAssetData(props.monthly_nodes);
    setLastNodes(props.last_nodes);
    setLatestNodes(props.latest_nodes);
    setInputValue("All-Time");
    fetchData();
  }, [props]);

  const formattedData = {
    datasets: [],
  };

  const changeFrequency = async (frequency, button_select, button_text) => {
    try {
      setAssetData(null);
      setInputValue(button_text);
      setButtonSelect(button_select);
      data = {
        frequency: frequency,
        timeframe: button_select,
        network: network,
        blockchain: blockchain,
        grouped: "yes"
      };
      response = await axios.post(
        `${process.env.REACT_APP_API_HOST}/nodes/stats`,
        data,
        config
      );

      setAssetData(response.data.result);

      data = {
        network: network,
        blockchain: blockchain,
        frequency: button_select === "24" ? ("last24h") : button_select === "168" ? ("last7d") : button_select === "30" ? ("last30d") : button_select === "160" ? ("last6m") : button_select === "12" ? ("last1y") : "latest",
      };
      response = await axios.post(
        `${process.env.REACT_APP_API_HOST}/nodes/stats`,
        data,
        config
      );

      setLastNodes(response.data.result);
    } catch (e) {
      console.log(e);
    }
  };

  if (latest_nodes) {
    for (const node of latest_nodes[0].data) {
      latest_stake = latest_stake + node.nodeStake;
      latest_rewards = latest_rewards + node.cumulativePayouts;
      latest_earnings = latest_earnings + node.estimatedEarnings;
    }
  }

  if (last_nodes) {
    for (const node of last_nodes[0].data) {
      last_stake = last_stake + node.nodeStake;
      last_rewards = last_rewards + node.cumulativePayouts;
      last_earnings = last_earnings + node.estimatedEarnings;
    }
  }

  if (assetData) {
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

    for (const chain of assetData) {
      chain.data
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
    }

    formattedData.labels =
      button === "24" || button === "168"
        ? formattedDates
        : formattedDates.sort(
            (a, b) => moment(a, format).toDate() - moment(b, format).toDate()
          );

    let chain_color;
    let border_color;
    for (const chain of assetData) {
      let earnings = [];
      let cum_earnings = [];
      if (chain.blockchain_name === "Total") {
        continue;
      }

      for (const obj of formattedData.labels) {
        let containsDate = chain.data.some(
          (item) =>
            moment(
              button === "24" || button === "168" ? item.datetime : item.date
            ).format(format) === obj
        );
        if (containsDate) {
          for (const item of chain.data) {
            if (
              moment(
                button === "24" || button === "168" ? item.datetime : item.date
              ).format(format) === obj
            ) {
              earnings.push(item.estimatedEarnings1stEpochOnly);
              cum_earnings.push(item.estimatedEarnings1stEpochOnly + item.estimatedEarnings2plusEpochs)
            }
          }
        } else {
          earnings.push(null);
          cum_earnings.push(null);
        }
      }

      if (
        chain.blockchain_name === "NeuroWeb Mainnet" ||
        chain.blockchain_name === "NeuroWeb Testnet"
      ) {
        chain_color = "#b37af8";
        border_color = "#b37af8";
      }

      if (
        chain.blockchain_name === "Gnosis Mainnet" ||
        chain.blockchain_name === "Chiado Testnet"
      ) {
        chain_color = "#f8b27a";
        border_color = "#f8b27a";
      }

      if (
        chain.blockchain_name === "Base Mainnet" ||
        chain.blockchain_name === "Base Testnet"
      ) {
        chain_color = "#7abff8";
        border_color = "#7abff8";
      }

      let earnings_obj = {
        label: `${chain.blockchain_name}`,
        data: earnings,
        fill: false,
        borderColor: chain_color,
        backgroundColor: border_color,
        tension: 0.4,
        borderWidth: 0,
        type: chain.blockchain_name !== "Total" ? "bar" : "line",
        stacked: chain.blockchain_name !== "Total" ? false : true,
        yAxisID: "bar-y-axis"
      };
      formattedData.datasets.push(earnings_obj);

      // let cumEarnings_obj = {
      //   label: `${chain.blockchain_name} All Epochs`,
      //   data: cum_earnings,
      //   fill: false,
      //   borderColor: chain_color,
      //   backgroundColor: border_color,
      //   tension: 0.4,
      //   borderWidth: 0,
      //   type: "line",
      //   yAxisID: "line-y-axis"
      // };
      // formattedData.datasets.unshift(cumEarnings_obj);
    }
  } else {
    return (
      <Card
        justifyContent="center"
        align="center"
        direction="column"
        w="100%"
        mb="0px"
        {...rest}
        boxShadow="md"
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
      bar: {
        borderRadius: 5, // Adjust the value for the desired roundness
        hoverBorderColor: "#f9f9f9",
        hoverBackgroundColor: "#f9f9f9",
      },
    },
    scales: {
      "bar-y-axis": {
        beginAtZero: false,
        stacked: true,
        display: true,
        position: "right",
        title: {
          display: false,
          text: "TRAC",
          color: "#6344df",
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
          color: "#A3AED0",
        },
        grid: {
          display: false, // hide grid lines
          borderWidth: 0,
        },
        borderWidth: 0, // remove y axis border
      },
      x: {
        beginAtZero: false,
        stacked: true,
        title: {
          display: false,
          text: "Date (UTC)",
          color: "#6344df",
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
          color: "#A3AED0",
        },
      },
    },
    interaction: {
      mode: 'index',    // Group hover interaction by index
      intersect: false, // Hover interaction across datasets, not just directly over bars
    },
    hover: {
      mode: 'index',    // Highlight all bars for the same index on hover
      intersect: false, // Allow hovering over the index, not just a single dataset
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',    // Tooltip will show data for all datasets at the same index
        intersect: false, // Show tooltips for all datasets at the hovered index
        usePointStyle: true,
        callbacks: {
          label: function (context) {
            const tooltipData = context.chart.tooltip.dataPoints;
            const datasetIndex = context.datasetIndex;
  
            // Ensure tooltipData is defined before proceeding
            if (tooltipData && tooltipData.some) {
              // Only show label if the dataset is part of the current hover interaction
              const datasetInHover = tooltipData.some(
                (tooltipItem) => tooltipItem.datasetIndex === datasetIndex
              );
  
              if (datasetInHover) {
                const dataset = context.chart.data.datasets[datasetIndex];
                const value = dataset.data[context.dataIndex]; // Gets the value for the hovered index
                if (value !== null && value !== undefined) {
                  return `${dataset.label.slice(0, -8)}: ${formatNumberWithSpaces(value.toFixed(0))}`;
                }
              }
            }
            return null; // If not part of hover or tooltipData not found, return nothing
          },
          labelPointStyle: function (context) {
            return {
              pointStyle: 'circle',
              rotation: 0,
            };
          },
          labelColor: function (context) {
            const tooltipData = context.chart.tooltip.dataPoints;
            const datasetIndex = context.datasetIndex;
  
            // Ensure tooltipData is defined before proceeding
            if (tooltipData && tooltipData.some) {
              // Only return color if the dataset is part of the current hover interaction
              const datasetInHover = tooltipData.some(
                (tooltipItem) => tooltipItem.datasetIndex === datasetIndex
              );
  
              if (datasetInHover) {
                const dataset = context.chart.data.datasets[datasetIndex];
                return {
                  backgroundColor: dataset.borderColor || dataset.backgroundColor,
                  borderColor: dataset.borderColor || dataset.backgroundColor,
                  borderWidth: 2,
                  borderRadius: 2,
                };
              }
            }
  
            // Return transparent if tooltipData is not populated or dataset is not part of hover
            return {
              backgroundColor: 'transparent',
              borderColor: 'transparent',
              borderWidth: 0,
            };
          },
        },
      },
    },
  };

  return (
    <Card
      justifyContent="center"
      align="center"
      direction="column"
      w="100%"
      mb="0px"
      {...rest}
      boxShadow="md"
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
                    bgColor: `${textColorSecondary} !important`,
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
                    bgColor: `${textColorSecondary} !important`,
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
                    bgColor: `${textColorSecondary} !important`,
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
                    bgColor: `${textColorSecondary} !important`,
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
                    bgColor: `${textColorSecondary} !important`,
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
                    bgColor: `${textColorSecondary} !important`,
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
            color="#11047A"
            fontSize="34px"
            textAlign="start"
            fontWeight="700"
            lineHeight="100%"
          >
            {button === ""
              ? latest_earnings >= 1000000
                ? (latest_earnings / 1000000).toFixed(2) + "M"
                : latest_earnings >= 1000
                ? (latest_earnings / 1000).toFixed(2) + "K"
                : latest_earnings.toFixed(2)
              : last_earnings >= 1000000
              ? (last_earnings / 1000000).toFixed(2) + "M"
              : last_earnings >= 1000
              ? (last_earnings / 1000).toFixed(2) + "K"
              : last_earnings.toFixed(2)}
          </Text>
          <Flex align="center" mb="20px">
            <Text
              color="secondaryGray.600"
              fontSize="lg"
              fontWeight="500"
              mt="4px"
              me="12px"
            >
              Trac
            </Text>
            <Flex align="center">
              <Icon as={RiArrowUpSFill} color="green.500" me="2px" mt="2px" />
              <Text color="green.500" fontSize="lg" fontWeight="700">
                {`${((last_earnings / latest_earnings) * 100).toFixed(1)}%`}
              </Text>
              <Tooltip
                label={`Percent of total value of selected timeframe / total value all time`}
                fontSize="md"
                placement="right"
              >
                <Box>
                  <Icon
                    transition="0.2s linear"
                    w="15px"
                    h="15px"
                    ml="0px"
                    as={MdInfoOutline}
                    color={tracColor}
                    _hover={{ cursor: "pointer" }}
                    _active={{ borderColor: tracColor }}
                    _focus={{ bg: "none" }}
                  />
                </Box>
              </Tooltip>
            </Flex>
          </Flex>
          <Flex flexDirection="column">
            <Flex>
              <Box
                bg="#b37af8"
                borderRadius="full"
                width="20px"
                height="20px"
                mr="5px"
              />
              <Text color="#11047A" fontWeight="bold">
                NeuroWeb
              </Text>
            </Flex>
            <Flex>
              <Box
                bg="#f8b27a"
                borderRadius="full"
                width="20px"
                height="20px"
                mr="5px"
              />
              <Text color="#11047A" fontWeight="bold">
                Gnosis
              </Text>
            </Flex>
            <Flex>
              <Box
                bg="#7abff8"
                borderRadius="full"
                width="20px"
                height="20px"
                mr="5px"
              />
              <Text color="#11047A" fontWeight="bold">
                Base
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Box minH="260px" minW="75%" mt="auto">
          <Text
            color={textColor}
            fontSize={{base: "md", md: "md", lg: "lg", xl: "24px"}}
            mt="-40px"
            pb="20px"
            textAlign="right"
            fontWeight="700"
            lineHeight="100%"
          >
            Nodes Earnings 1st Epoch
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
