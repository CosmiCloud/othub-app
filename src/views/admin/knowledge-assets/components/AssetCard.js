// Chakra imports
import {
  AvatarGroup,
  Avatar,
  Box,
  Button,
  Flex,
  Icon,
  Image,
  Link,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
// Custom components
import Card from "components/card/Card.js";
// Assets
import React, { useState, useEffect, useContext } from "react";
import {
  IoThumbsDown,
  IoThumbsDownOutline,
  IoThumbsUp,
  IoThumbsUpOutline,
  IoCopyOutline,
  IoDownloadOutline,
} from "react-icons/io5";
import AssetPage from "views/admin/knowledge-assets/components/AssetPage";
import { AccountContext } from "../../../../AccountContext";
import axios from "axios";

const config = {
  headers: {
    "X-API-Key": process.env.REACT_APP_OTHUB_KEY,
  },
};

export default function NFT(props) {
  const {
    img,
    name,
    author,
    bidders,
    download,
    chain_id,
    block_ts_hour,
    epochs_number,
    epoch_length_days,
    index,
    recent_assets,
    block_ts,
    chainName,
    UAL,
    sentiment,
  } = props;
  const [like, setLike] = useState(false);
  const [dislike, setDislike] = useState(false);
  const [asset_page, openAssetPage] = useState(false);
  const textColor = useColorModeValue("navy.700", "white");
  const textColorBid = useColorModeValue("brand.500", "white");
  const { open_asset_page, setOpenAssetPage } = useContext(AccountContext);
  const [downloading, setDownloading] = useState(false);
  const { network, setNetwork } = useContext(AccountContext);

  useEffect(() => {
    async function fetchData() {
      try {
      } catch (e) {
        console.error("Error fetching data:", e);
      }
    }
    fetchData();
  }, []);

  // const closeNodePage = () => {
  //   window.history.replaceState(
  //     {},
  //     document.title,
  //     window.location.origin + window.location.pathname
  //   );
  //   setOpenNodePage(false);
  // };

  const downloadAsset = async (ual) => {
    try {
      let settings = {
        network: network,
        blockchain:
          chainName === "NeuroWeb Testnet"
            ? "otp:20430"
            : chainName === "NeuroWeb Mainnet"
            ? "otp:2043"
            : chainName === "Chiado Testnet"
            ? "gnosis:10200"
            : chainName === "Gnosis Mainnet"
            ? "gnosis:100"
            : "",
        ual: ual,
      };
      let response = await axios.post(
        `${process.env.REACT_APP_API_HOST}/dkg/get`,
        settings,
        config
      );

      // Create a blob from the response data
      const blob = new Blob([JSON.stringify(response.data.assertion)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${ual}.json`;

      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
    } catch (error) {
      console.log("Failed to copy link to clipboard:", error);
    }
  };

  return (
    !open_asset_page && (
      <Card p="20px" boxShadow="md">
        <Flex direction={{ base: "column" }} justify="center">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box display="flex" alignItems="center">
              {!downloading && (
                <Button
                  bg="none"
                  _hover={{ bg: "whiteAlpha.900" }}
                  _active={{ bg: "white" }}
                  _focus={{ bg: "white" }}
                  p="0px !important"
                  borderRadius="50%"
                  minW="36px"
                  onClick={() => {
                    downloadAsset(UAL);
                    setDownloading(true);
                  }}
                >
                  <Icon
                    transition="0.2s linear"
                    w="30px"
                    h="30px"
                    as={IoDownloadOutline}
                    color="#11047A"
                    alt="Download"
                  />
                </Button>
              )}
            </Box>
            {chain_id === 2043 || chain_id === 20430 ? (
              <img
                src={`${process.env.REACT_APP_API_HOST}/images?src=neuro_logo.svg`}
                style={{ maxWidth: "25px", maxHeight: "25px" }}
              />
            ) : chain_id === 100 || chain_id === 10200 ? (
              <img
                src={`${process.env.REACT_APP_API_HOST}/images?src=gnosis_logo.svg`}
                style={{ maxWidth: "25px", maxHeight: "25px" }}
              />
            ) : (
              ""
            )}
          </Box>
          <Box
            mb={{ base: "20px", "2xl": "20px" }}
            position="relative"
            mt="-20px"
          >
            <Flex
              justify="center"
              align="center"
              h="150px"
              mt="0px"
              mb="-20px"
              style={{ borderRadius: "20px" }}
            >
              <img
                title="NFT Preview"
                src={img}
                width="120px"
                height="120px"
              ></img>
            </Flex>
          </Box>
          <Flex flexDirection="column" justify="space-between" h="100%">
            <Flex
              justify="space-between"
              direction={{
                base: "row",
                md: "column",
                lg: "row",
                xl: "column",
                "2xl": "row",
              }}
              mb="auto"
            >
              <Flex direction="column">
                <Text
                  color="#11047A"
                  fontSize={{
                    base: "xl",
                    md: "lg",
                    lg: "lg",
                    xl: "lg",
                    "2xl": "md",
                    "3xl": "lg",
                  }}
                  mb="5px"
                  fontWeight="bold"
                  me="14px"
                >
                  Token {name}
                </Text>
                <Text
                  color={textColor}
                  fontSize={{
                    base: "sm",
                  }}
                  fontWeight="400"
                  me="14px"
                >
                  By {author.slice(0, 15)}...
                </Text>
                <Text
                  color="secondaryGray.600"
                  fontSize={{
                    base: "sm",
                  }}
                  fontWeight="400"
                  me="14px"
                >
                  At {block_ts}
                </Text>
              </Flex>
            </Flex>
            <Flex
              align="start"
              justify="space-between"
              direction={{
                base: "row",
                md: "column",
                lg: "row",
                xl: "column",
                "2xl": "row",
              }}
              mt="25px"
            >
              <Flex direction="column" ml="10px" mt="10px">
                <Flex align="center">
                  <Icon
                    transition="0.2s linear"
                    w="20px"
                    h="20px"
                    as={like ? IoThumbsUp : IoThumbsUpOutline}
                    color="#11047A"
                  />
                  <Text
                    fontWeight="700"
                    fontSize="sm"
                    color="#11047A"
                    mr="20px"
                  >
                    {sentiment ? JSON.parse(sentiment)[0] : 0}
                  </Text>
                  <Icon
                    transition="0.2s linear"
                    w="20px"
                    h="20px"
                    as={dislike ? IoThumbsDown : IoThumbsDownOutline}
                    color="#11047A"
                  />
                  <Text fontWeight="700" fontSize="sm" color="#11047A">
                    {sentiment ? JSON.parse(sentiment)[1] : 0}
                  </Text>
                </Flex>
              </Flex>
              <Button
                variant="darkBrand"
                color="white"
                fontSize="sm"
                fontWeight="500"
                borderRadius="70px"
                px="24px"
                py="5px"
                onClick={() => setOpenAssetPage(recent_assets[index])}
                boxShadow="md"
              >
                Details
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Card>
    )
  );
}
