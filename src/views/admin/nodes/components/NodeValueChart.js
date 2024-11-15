import {
  Flex,
  Table,
  Progress,
  Icon,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Button,
  Box,
  Grid,
  SimpleGrid,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useMediaQuery
} from "@chakra-ui/react";

import {
  MdBarChart,
  MdStars,
  MdHome,
  MdComputer,
  MdDashboard,
  MdInventory,
  MdAnchor,
  MdArrowCircleLeft,
  MdOutlineCalendarToday,
} from "react-icons/md";

import { AccountContext } from "../../../../AccountContext";
import moment from "moment";
import axios from "axios";
import { Line } from "react-chartjs-2";
import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  useGlobalFilter,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";

// Custom components
import Card from "components/card/Card";
//import Menu from "components/menu/MainMenu";
import Loading from "components/effects/Loading.js";
// Assets
import { MdCheckCircle, MdCancel, MdOutlineError } from "react-icons/md";
import NodeValueChart from "views/admin/nodes/components/NodeValueChart";
const config = {
  headers: {
    "X-API-Key": process.env.REACT_APP_OTHUB_KEY,
  },
};

export default function NodeTable(props) {
  const { blockchain, setBlockchain } = useContext(AccountContext);
  const { network, setNetwork } = useContext(AccountContext);
  const { node_id, node_d, price } = props;
  const textColorSecondary = useColorModeValue("secondaryGray.600", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const [inputValue, setInputValue] = useState("");
  const [node_data, setNodeData] = useState("");
  const [isLoading, setisLoading] = useState(false);
  const { open_node_page, setOpenNodePage } = useContext(AccountContext);
  const tracColor = useColorModeValue("brand.900", "white");
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  let secondaryText = useColorModeValue("gray.700", "white");
  let menuBg = useColorModeValue("white", "navy.800");
  const shadow = useColorModeValue(
    "14px 17px 40px 4px rgba(112, 144, 176, 0.18)",
    "14px 17px 40px 4px rgba(112, 144, 176, 0.06)"
  );

  const [small] = useMediaQuery("(min-width: 765px)");
  const [medium] = useMediaQuery("(min-width: 1024px)");

  const height = medium ? "130px" : small ? "200px" : "130px";
  const width = medium ? "100%" : small ? "100%" : "100%";

  let explorer_url = "https://dkg.origintrail.io";

  if (network === "DKG Testnet") {
    explorer_url = "https://dkg-testnet.origintrail.io";
  }

  useEffect(() => {
    async function fetchData() {
      try {
        // let data = {
        //     timeframe: "1000",
        //     frequency: "daily",
        //     network: network,
        //     blockchain: blockchain,
        //     nodeName: node_name,
        //     grouped: "no",
        //   };

        //   let response = await axios.post(
        //     `${process.env.REACT_APP_API_HOST}/nodes/stats`,
        //     data,
        //     config
        //   );

        setNodeData(node_d);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    setInputValue("All-Time");
    fetchData();
  }, [node_data]);

  const changeFrequency = async (timeframe) => {
    try {
      setisLoading(true);
      setInputValue(timeframe);
      let data = {
        frequency: "daily",
        timeframe: "1000",
        blockchain: blockchain,
        nodeName: node_d[0].tokenName,
        grouped: "no",
      };
      const response = await axios.post(
        `${process.env.REACT_APP_API_HOST}/nodes/stats`,
        data,
        config
      );

      setNodeData(response.data.result);
      setisLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  const formattedData = {
    datasets: [],
  };

  if (node_data) {
    let format = "DD MMM YY";
    if (inputValue === "24h") {
      format = "HH:00";
    }
    if (inputValue === "7d") {
      format = "ddd HH:00";
    }
    if (inputValue === "30d") {
      format = "DD MMM YY";
    }
    if (inputValue === "6m") {
      format = "DD MMM YY";
    }

    const uniqueDates = new Set();
    const formattedDates = [];

    node_data
      .filter((item) => {
        const formattedDate = moment(item.date).format(format);
        // Check if the formatted date is unique
        if (!uniqueDates.has(formattedDate)) {
          uniqueDates.add(formattedDate);
          formattedDates.push(formattedDate);
          return true;
        }
        return false;
      })
      .map((item) => moment(item.date).format(format));

    formattedData.labels =
      inputValue === "24h" || inputValue === "7d"
        ? formattedDates
        : formattedDates.sort(
            (a, b) => moment(a, format).toDate() - moment(b, format).toDate()
          );

    let currentValues = [];
    let futureValues = [];

    for (const item of node_data) {
      currentValues.push(item.shareValueCurrent);
      futureValues.push(item.shareValueFuture);
    }

    let currentValues_obj = {
      label: `Current`,
      data: currentValues,
      fill: false,
      borderColor: "#11047A",
      backgroundColor: "#11047A",
      tension: 0.4,
      borderWidth: 5,
    };
    formattedData.datasets.push(currentValues_obj);

    let futureValues_obj = {
      label: `Prospective value if all epochs complete`,
      data: futureValues,
      fill: false,
      borderColor: "#E2E8F0",
      backgroundColor: "#E2E8F0",
      tension: 0.4,
      borderWidth: 5,
    };
    formattedData.datasets.push(futureValues_obj);
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
      x: {
        stacked: false,
        title: {
          display: true,
          text: "Datetime (UTC)", // Add your X-axis label here
          color: "#11047A", // Label color
          font: {
            size: 12, // Label font size
            weight: "bold"
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
      y: {
        stacked: false,
        title: {
          display: false,
          text: "U S D", // Add your X-axis label here
          color: "#11047A", // Label color
          font: {
            size: 12, // Label font size
            weight: "bold"
          },
        },
        ticks: {
          callback: function (value, index, values) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + "M";
            } else if (value >= 1000) {
              return (value / 1000).toFixed(1) + "K";
            } else {
              return "$" + value.toFixed(3);
            }
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
    <Flex justify="space-between" ps="0px" pe="20px" pt="5px">
      <Flex align="center" w="100%" alignItems="self-start">
        {/* <Menu>
          <MenuButton
            fontSize="sm"
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
                onClick={(e) => changeFrequency("monthly", "1000", "All-Time")}
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
        </Menu> */}
      </Flex>
      
      <Box minH="100%" minW="100%" mt="auto">
      <Text
              color={textColor}
              fontSize="22px"
              fontWeight="700"
              lineHeight="100%"
            >
              Share Value
            </Text>
        <Line
            height={height}
            //width={width}
            data={formattedData}
            options={options}
          />
      </Box>
    </Flex>
  );
}
