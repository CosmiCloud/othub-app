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
  Input,
  Avatar,
  Tooltip,
  Box
} from "@chakra-ui/react";
import { AccountContext } from "../../../../AccountContext";
import axios from "axios";
import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  useGlobalFilter,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";

import { MdStars, MdSearch } from "react-icons/md";

// Custom components
import Card from "components/card/Card";
import Menu from "components/menu/MainMenu";
import Loading from "components/effects/Loading.js";
// Assets
import { MdCheckCircle, MdCancel, MdOutlineError } from "react-icons/md";
import NodePage from "views/admin/nodes/components/NodePage";
import {
  columnsDataCheck,
  columnsDataComplex,
} from "views/admin/nodes/variables/nodeTableColumns";
const config = {
  headers: {
    "X-API-Key": process.env.REACT_APP_OTHUB_KEY,
  },
};

export default function NodeTable(props) {
  const { blockchain, setBlockchain } = useContext(AccountContext);
  const { network, setNetwork } = useContext(AccountContext);
  const { columnsData, tableData, node_data, price } = props;
  const columns = useMemo(() => columnsDataComplex, [columnsDataComplex]);
  let data = useMemo(() => node_data, [node_data]);
  const { open_node_page, setOpenNodePage } = useContext(AccountContext);
  let [rankCounter, setRankCounter] = useState(1);
  const [node_profiles, setNodeProfiles] = useState(null);

  let tableInstance = useTable(
    {
      columns,
      data,
      initialState: {
        sortBy: [
          {
            id: "nodeStake", // ID of the column to sort by
            desc: true, // Sort in descending order to display the highest number first
          },
        ],
        pageSize: 500, // Set the desired page size
      },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  let {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    initialState,
  } = tableInstance;
  initialState.pageSize = 500;

  const tracColor = useColorModeValue("brand.900", "white");
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  let explorer_url = "https://dkg.origintrail.io";

  if (network === "DKG Testnet") {
    explorer_url = "https://dkg-testnet.origintrail.io";
  }

  const queryParameters = new URLSearchParams(window.location.search);
  const node_name = queryParameters.get("node");

  function formatNumberWithSpaces(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  useEffect(() => {
    async function fetchData() {
      try {
        let data = {};

        let response = await axios.post(
          `${process.env.REACT_APP_API_HOST}/nodes/profile`,
          data,
          config
        );

        setNodeProfiles(response.data.result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  const checkLogo = (node_id, chain_id) => {
    if (!node_profiles) return null;

    const foundObject = node_profiles.find(
      (obj) => obj.node_id === node_id && obj.chain_id === chain_id
    );

    return foundObject ? foundObject.node_logo : null;
  };

  const searchNode = (nod) => {
    let filteredData = node_data.filter((node) => node.tokenName === nod);

    console.log(filteredData)
    if (filteredData.length > 0) {
      setOpenNodePage([filteredData[0].nodeId, filteredData[0].chainId]);
    }
  };

  if (open_node_page) {
    return <NodePage node_name={open_node_page} price={price} />;
  }

  return (
    data &&
    !open_node_page && (
      <Card
        direction="column"
        w="100%"
        h="800px"
        px="0px"
        overflowX={{ sm: "scroll", lg: "hidden" }}
        boxShadow="md"
      >
        <Flex
          px="16px"
          justify="space-between"
          mb="10px"
          ml="auto"
          maxW="300px"
        >
          <Icon
            transition="0.2s linear"
            w="30px"
            h="30px"
            mr="5px"
            as={MdSearch}
            color={tracColor}
            _hover={{ cursor: "pointer" }}
            _active={{ borderColor: tracColor }}
            _focus={{ bg: "none" }}
            onClick={() => {
              const inputValue = document.getElementById("nodeInput").value;
              searchNode(inputValue);
            }}
          />
          <Input
            h="30px"
            focusBorderColor={tracColor}
            id="nodeInput"
            placeholder="Seach for a node..."
          ></Input>
        </Flex>
        <Table {...getTableProps()} variant="simple" color="gray.500" mb="24px">
          <Thead>
            {headerGroups.map((headerGroup, index) => (
              <Tr {...headerGroup.getHeaderGroupProps()} key={index}>
                {headerGroup.headers.map((column, index) => (
                  <Th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    pe="10px"
                    key={index}
                    borderColor={borderColor}
                  >
                    <Flex
                      justify="space-between"
                      align="center"
                      fontSize={{ sm: "10px", lg: "12px" }}
                      color="gray.400"
                    >
                      {column.Header !== "UAL" &&
                        column.Header !== "BLOCKCHAIN" &&
                        column.Header !== "NODEID" &&
                        column.render("Header")}
                    </Flex>
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody {...getTableBodyProps()}>
            {page.map((row, index) => {
              prepareRow(row);

              let chain_id = row.cells
                .filter((cell) => cell.column.Header === "BLOCKCHAIN")
                .map((cell) => cell.value);

              let node_id = row.cells
                .filter((cell) => cell.column.Header === "NODEID")
                .map((cell) => cell.value);

              let currentRank = rankCounter++;

              let official_node = 0;
              if (
                (chain_id[0] === 100 &&
                  (node_id[0] === 26 ||
                    node_id[0] === 27 ||
                    node_id[0] === 28 ||
                    node_id[0] === 37)) ||
                (chain_id[0] === 10200 && node_id[0] === 6) ||
                (chain_id[0] === 2043 &&
                  (node_id[0] === 139 ||
                    node_id[0] === 182 ||
                    node_id[0] === 185 ||
                    node_id[0] === 186)) ||
                (chain_id[0] === 20430 && node_id[0] === 98) ||
                (chain_id[0] === 8453 &&
                  (node_id[0] === 28 ||
                    node_id[0] === 26 ||
                    node_id[0] === 25 ||
                    node_id[0] === 27)) ||
                (chain_id[0] === 84532 && node_id[0] === 21)
              ) {
                official_node = 1;
              }

              return (
                <Tr {...row.getRowProps()} key={index}>
                  {row.cells.map((cell, index) => {
                    let data = "";

                    if (cell.column.Header === "BLOCKCHAIN") {
                      const logoSrc = checkLogo(node_id[0], chain_id[0]);
                      data = (
                        <Flex align="center">
                          <Flex
                            align="center"
                            justify="center"
                            h="29px"
                            w="29px"
                            borderRadius="30px"
                            me="7px"
                          >
                            <Text
                              color={textColor}
                              fontSize="md"
                              fontWeight="700"
                              mr="10px"
                              ml="10px"
                            >
                              {currentRank}
                            </Text>
                            <Avatar
                              boxShadow="md"
                              backgroundColor="#FFFFFF"
                              src={
                                logoSrc
                                  ? `${process.env.REACT_APP_API_HOST}/images?src=${logoSrc}`
                                  : cell.value === 2043 || cell.value === 20430
                                  ? `${process.env.REACT_APP_API_HOST}/images?src=neuro_logo.svg`
                                  : cell.value === 100 || cell.value === 10200
                                  ? `${process.env.REACT_APP_API_HOST}/images?src=gnosis_logo.svg`
                                  : cell.value === 8453 || cell.value === 84532
                                  ? `${process.env.REACT_APP_API_HOST}/images?src=base_logo.svg`
                                  : ""
                              }
                              w="35px"
                              h="35px"
                            />
                          </Flex>
                        </Flex>
                      );
                    } else if (cell.column.Header === "TIMESTAMP") {
                      data = (
                        <Text color={textColor} fontSize="md" fontWeight="700">
                          {cell.value}
                        </Text>
                      );
                    } else if (cell.column.Header === "NODE TOKEN") {
                      const logoSrc = checkLogo(node_id, chain_id);
                      data = (
                        <Flex color={textColor} fontSize="md" fontWeight="700">
                          {official_node === 1 && (
                            <Tooltip
                              label="Official OTHub Node"
                              fontSize="md"
                              placement="top"
                            >
                              <Box>
                                <Icon
                                  transition="0.2s linear"
                                  w="30px"
                                  h="30px"
                                  mr="5px"
                                  as={MdStars}
                                  color={tracColor}
                                  _hover={{ cursor: "pointer" }}
                                  _active={{ borderColor: tracColor }}
                                  _focus={{ bg: "none" }}
                                />
                              </Box>
                            </Tooltip>
                          )}
                          <Text
                            color={textColor}
                            fontSize="md"
                            fontWeight="700"
                            onClick={() => setOpenNodePage([node_id, chain_id])}
                            _hover={{ cursor: "pointer" }}
                            maxW="200px"
                            mt="auto"
                            mb="auto"
                          >
                            {cell.value}
                          </Text>
                        </Flex>
                      );
                    } else if (cell.column.Header === "OPERATOR") {
                      data = (
                        <Text color={textColor} fontSize="md" fontWeight="700">
                          {cell.value}
                        </Text>
                      );
                    } else if (cell.column.Header === "VALUE") {
                      data = (
                        <Text
                          color={textColor}
                          fontSize="md"
                          fontWeight="700"
                          maxW="150px"
                        >
                          {`$${(cell.value * price).toFixed(2)} (${Number(
                            cell.value
                          ).toFixed(3)} TRAC)`}
                        </Text>
                      );
                    } else if (cell.column.Header === "PROSPECTIVE VALUE") {
                      data = (
                        <Text color={textColor} fontSize="md" fontWeight="700">
                          {`$${(cell.value * price).toFixed(2)} (${Number(
                            cell.value
                          ).toFixed(3)} TRAC)`}
                        </Text>
                      );
                    } else if (cell.column.Header === "FEE") {
                      data = (
                        <Text color={textColor} fontSize="md" fontWeight="700">
                          {`${cell.value}%`}
                        </Text>
                      );
                    } else if (cell.column.Header === "ASK") {
                      data = (
                        <Text color={textColor} fontSize="md" fontWeight="700">
                          {cell.value}
                        </Text>
                      );
                    } else if (cell.column.Header === "24H PUBS") {
                      data = (
                        <Text color={textColor} fontSize="md" fontWeight="700">
                          {`${cell.value}`}
                        </Text>
                      );
                    } else if (cell.column.Header === "24H EARNINGS") {
                      data = (
                        <Text color={textColor} fontSize="md" fontWeight="700">
                          {`${cell.value.toFixed(2)} TRAC`}
                        </Text>
                      );
                    } else if (cell.column.Header === "MARKETCAP") {
                      data = (
                        <Text color={textColor} fontSize="md" fontWeight="700">
                          {`$${formatNumberWithSpaces(
                            (cell.value * price).toFixed(2)
                          )}`}
                        </Text>
                      );
                    } else if (cell.column.Header === "LAST 7 DAYS") {
                      data = (
                        <Text color={textColor} fontSize="md" fontWeight="700">
                          {cell.value}
                        </Text>
                      );
                    }
                    return (
                      <Td
                        {...cell.getCellProps()}
                        key={index}
                        fontSize={{ sm: "14px" }}
                        maxH="30px !important"
                        py="8px"
                        minW={{ sm: "150px", md: "200px", lg: "auto" }}
                        borderColor="transparent"
                      >
                        {data}
                      </Td>
                    );
                  })}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Card>
    )
  );
}
