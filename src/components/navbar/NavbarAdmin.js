import {
  Avatar,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorModeValue,
} from "@chakra-ui/react";
import PropTypes from "prop-types";
import React, { useState, useEffect, useContext } from "react";
import AdminNavbarLinks from "components/navbar/NavbarLinksAdmin";
import axios from "axios";
import { AccountContext } from "../../AccountContext";
import NetworkDrop from "./networkDrop";
import BlockchainDrop from "./blockchainDrop";
import routes from "routes.js";
import { SidebarResponsive } from "components/sidebar/Sidebar";

const config = {
  headers: {
    "X-API-Key": process.env.REACT_APP_OTHUB_KEY,
  },
};

export default function AdminNavbar(props) {
  const { secondary, message, brandText } = props;
  const [scrolled, setScrolled] = useState(false);
  const { syncData, setSyncData } = useContext(AccountContext);
  const { syncStatus, setSyncStatus } = useContext(AccountContext);
  const {
    setBlockchain,
    network, 
    setNetwork
  } = useContext(AccountContext);
  let mainText = useColorModeValue("navy.700", "white");
  let secondaryText = useColorModeValue("gray.700", "white");
  let navbarPosition = "fixed";
  let navbarFilter = "none";
  let navbarBackdrop = "blur(20px)";
  let navbarShadow = "none";
  let navbarBg = useColorModeValue(
    "rgba(244, 247, 254, 0.2)",
    "rgba(11,20,55,0.5)"
  );
  let navbarBorder = "transparent";
  let secondaryMargin = "0px";
  let paddingX = "15px";
  let gap = "0px";
  let menuBg = useColorModeValue("white", "navy.800");
  const shadow = useColorModeValue(
    "14px 17px 40px 4px rgba(112, 144, 176, 0.18)",
    "14px 17px 40px 4px rgba(112, 144, 176, 0.06)"
  );
  const tracColor = useColorModeValue("brand.900", "white");

  // useEffect(() => {
  //   window.addEventListener("scroll", changeNavbar);

  //   return () => {
  //     window.removeEventListener("scroll", changeNavbar);
  //   };
  // });

  const changeNavbar = () => {
    if (window.scrollY > 1) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        let response = await axios.post(
          `${process.env.REACT_APP_API_HOST}/misc/sync_status`,
          {},
          config
        );

        setSyncData(response.data.sync);

        for (const record of response.data.sync) {
          if (record.status === false) {
            setSyncStatus(false);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  return (
    <Box
      position={navbarPosition}
      boxShadow={navbarShadow}
      bg={navbarBg}
      borderColor={navbarBorder}
      filter={navbarFilter}
      backdropFilter={navbarBackdrop}
      backgroundPosition="center"
      backgroundSize="cover"
      borderRadius="16px"
      borderWidth="1.5px"
      borderStyle="solid"
      transitionDelay="0s, 0s, 0s, 0s"
      transitionDuration=" 0.25s, 0.25s, 0.25s, 0s"
      transition-property="box-shadow, background-color, filter, border"
      transitionTimingFunction="linear, linear, linear, linear"
      alignItems={{ xl: "center" }}
      display="flex"
      minH="75px"
      justifyContent={{ xl: "center" }}
      lineHeight="25.6px"
      mx="auto"
      mt={secondaryMargin}
      pb="8px"
      right={{ base: "12px", md: "30px", lg: "30px", xl: "30px" }}
      px={{
        sm: paddingX,
        md: "10px",
      }}
      ps={{
        xl: "12px",
      }}
      pt="8px"
      top={{ base: "12px", md: "16px", lg: "20px", xl: "20px" }}
      w={{
        base: "calc(100vw - 6%)",
        md: "calc(100vw - 8%)",
        lg: "calc(100vw - 6%)",
        xl: "calc(100vw - 350px)",
        "2xl": "calc(100vw - 365px)",
      }}
      zIndex="101"
    >
      <Flex
        w="100%"
        flexDirection={{
          sm: "column",
          md: "column",
          lg: "column",
          xl: "row",
        }}
        alignItems={{ xl: "center" }}
        mb={gap}
      >
        <Box mb={{ sm: "8px", md: "0px" }}>
          <Breadcrumb>
            <BreadcrumbItem color={secondaryText} fontSize="sm" mb="5px">
              <BreadcrumbLink href="#" color={secondaryText}>
                OTHub
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem color={secondaryText} fontSize="sm" mb="5px">
              <BreadcrumbLink href="#" color={secondaryText}>
                {brandText}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <Flex justifyContent="flex-end" w="100%">
            <SidebarResponsive routes={routes}/>
            </Flex>
          </Breadcrumb>
          <Link
            color={tracColor}
            href="#"
            bg="inherit"
            borderRadius="inherit"
            fontWeight="bold"
            fontSize={
              window.matchMedia("(max-width: 1600px)").matches ? "20px" : "34px"
            }
            _hover={{ color: { mainText } }}
            _active={{
              bg: "inherit",
              transform: "none",
              borderColor: "transparent",
            }}
            _focus={{
              boxShadow: "none",
            }}
          >
            {brandText}
          </Link>
        </Box>
        {secondary.network_select && (
          <Box ms="auto" w={{ sm: "100%", md: "unset" }}>
            <Flex
              w={{ sm: "100%", md: "auto" }}
              alignItems="center"
              flexDirection="row"
              bg={menuBg}
              flexWrap={secondary ? { base: "wrap", md: "nowrap" } : "unset"}
              p="10px"
              borderRadius="30px"
              boxShadow="md"
              mb="5px"
            >
              <NetworkDrop network={setNetwork} />

              {network && secondary.blockchain_select && (
                <BlockchainDrop network={network} blockchain={setBlockchain} />
              )}

              {syncStatus === false && (
                <Menu>
                  <MenuButton p="0px">
                    <Avatar
                      _hover={{ cursor: "pointer" }}
                      color="white"
                      bgColor="#ff0000"
                      name="!"
                      size="lg"
                      w="40px"
                      h="40px"
                      src=""
                      ml={{sm :"10px", md:"0px"}}
                      mr={{sm :"0px", md:"0px"}}
                      boxShadow={shadow}
                    />
                  </MenuButton>
                  <MenuList
                    boxShadow={shadow}
                    p="0px"
                    mt="10px"
                    borderRadius="20px"
                    bg={menuBg}
                    border="none"
                  >
                    {syncData.map((record) => (
                      <Flex flexDirection="column" p="10px" key={record.blockchain}>
                        <MenuItem
                          _hover={{ bg: "none" }}
                          _focus={{ bg: "none" }}
                          borderRadius="8px"
                          px="14px"
                        >
                          {record.status === false && (
                            <span>{`${record.blockchain} last sync'd: ${record.last_sync}`}</span>
                          )}
                        </MenuItem>
                      </Flex>
                    ))}
                  </MenuList>
                </Menu>
              )}
              {/* <SidebarResponsive routes={routes}/> */}
            </Flex>
          </Box>
        )}

        <Box ms="auto" w={{ sm: "100%", md: "unset" }}>
          <AdminNavbarLinks
            onOpen={props.onOpen}
            logoText={props.logoText}
            secondary={props.secondary}
            fixed={props.fixed}
            scrolled={scrolled}
            mt="5px"
          />
        </Box>
      </Flex>
    </Box>
  );
}

AdminNavbar.propTypes = {
  brandText: PropTypes.string,
  secondary: PropTypes.object,
  fixed: PropTypes.bool,
  onOpen: PropTypes.func,
};
