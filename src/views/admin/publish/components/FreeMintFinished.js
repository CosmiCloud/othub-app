import React, { useState, useEffect } from "react";
import { Box, Text, useColorModeValue, Button, Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import AssetImage from "../../../../../src/assets/img/Knowledge-Asset.jpg";
import axios from "axios";

const config = {
    headers: {
      "X-API-Key": process.env.REACT_APP_OTHUB_KEY,
      Authorization: localStorage.getItem("token"),
    },
  };

const MotionBox = motion(Box);

const handleCreateAnother = () => {
  window.location.href = `${process.env.REACT_APP_WEB_HOST}/publish`; // Replace with your desired URL
};

const handleExploreAsset = (ual) => {
  window.location.href = `${process.env.REACT_APP_WEB_HOST}/explore?ual=${ual}`; // Replace with your desired URL
};

const FreeMintFinished = ({ txn_info, txn_id, epochs }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const tracColor = useColorModeValue("brand.900", "white");
  const segments = txn_info.ual.split(":");
  const argsString =
    segments.length === 3 ? segments[2] : segments[2] + segments[3];
  const args = argsString.split("/");

  useEffect(() => {
    // Show the text after a short delay
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 500); // Adjust delay as needed

    return () => clearTimeout(timeout);
  }, []);

  useEffect(async () => {
    if(txn_id){
        const request_data = {
            txn_id: txn_id,
            ual: txn_info.ual,
            epochs: epochs,
          };
    
        await axios.post(
            `${process.env.REACT_APP_API_HOST}/txns/complete`,
            request_data,
            config
          );
    }

    return;
  }, [txn_id]);

  useEffect(() => {
    if (isVisible) {
      // Show confetti after the MotionBox transition ends
      const confettiTimeout = setTimeout(() => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 10000); // Stop confetti after 3 seconds
      }, 2000); // Adjust timing based on MotionBox transition duration

      return () => clearTimeout(confettiTimeout);
    }
  }, [isVisible]);

  return (
    txn_info.ual &&
    args && (
      <Box
        width="100%"
        height="450px" // Set this to the desired height or use another value
        overflow="hidden"
        display="flex"
        justifyContent="center"
        alignItems="center"
        position="relative"
      >
        <MotionBox
          initial={{ y: -500, opacity: 100 }}
          animate={{ y: isVisible ? 0 : -500, opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 2 }}
          id="box"
          width="100%"
          height="100%" // Ensure it takes the full height of the parent container
          display="flex"
          flexDirection="column" // Stack the children vertically
          justifyContent="center"
          alignItems="center"
        >
          <Box width="175px" height="250px" boxShadow="lg" borderRadius="md">
            <Flex p={4}>
              {txn_info.blockchain === "otp:2043" ||
              txn_info.blockchain === "otp:20430" ? (
                <img
                  src={`${process.env.REACT_APP_API_HOST}/images?src=neuro_logo.svg`}
                  style={{ maxWidth: "20px", maxHeight: "20px" }}
                />
              ) : txn_info.blockchain === "gnosis:100" ||
                txn_info.blockchain === "gnosis:10200" ? (
                <img
                  src={`${process.env.REACT_APP_API_HOST}/images?src=gnosis_logo.svg`}
                  style={{ maxWidth: "20px", maxHeight: "20px" }}
                />
              ) : txn_info.blockchain === "base:8453" ||
              txn_info.blockchain === "base:84532" ? (
                <img
                  src={`${process.env.REACT_APP_API_HOST}/images?src=base_logo.svg`}
                  style={{ maxWidth: "20px", maxHeight: "20px" }}
                />
              ) : (
                ""
              )}
            </Flex>
            <Flex justifyContent="center">
              <img
                src={AssetImage}
                style={{ maxWidth: "100px", maxHeight: "100px" }}
              ></img>
            </Flex>
            <Text p={4} fontWeight="bold" fontSize="md" color={tracColor}>
              Token {args[2]}
            </Text>
            <Flex justifyContent="right" mr="20px">
              <Button
                onClick={() => handleExploreAsset()}
                variant="darkBrand"
                color="white"
                fontSize="sm"
                boxShadow="md"
              >
                Explore
              </Button>
            </Flex>
          </Box>
          <Flex mt="40px">
            <Button
              onClick={() => handleCreateAnother(txn_info.ual)}
              borderColor={tracColor}
              backgroundColor="#FFFFFF"
              color={tracColor}
              boxShadow="md"
              border="1px"
              width="175px"
              borderRadius="5px"
            >
              Create Another
            </Button>
          </Flex>
        </MotionBox>
        {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} colors={["#11047A"]}/>}
      </Box>
    )
  );
};

export default FreeMintFinished;
