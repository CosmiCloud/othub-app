// Chakra imports
// Chakra imports
import {
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Text,
  Spinner,
  Stack,
  Icon
} from "@chakra-ui/react";
// Custom components
import Card from "components/card/Card.js";
// Custom icons
import React from "react";
import Loading from "components/effects/Loading.js";
import { MdArrowUpward, MdArrowDownward } from "react-icons/md";

export default function Default(props) {
  const { startContent, endContent, name, growth, value } = props;
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "secondaryGray.600";
  const tracColor = useColorModeValue("brand.900", "white");

  return (
    <Card py='15px' boxShadow="md">
      <Flex
        my='auto'
        h='100%'
        align={{ base: "center", xl: "start" }}
        justify={{ base: "center", xl: "center" }}>
        {startContent}

        <Stat my='auto' ms={startContent ? "18px" : "0px"}>
          <StatLabel
            lineHeight='100%'
            color={textColorSecondary}
            fontSize={{
              base: "sm",
            }}>
            {name}
          </StatLabel>
          <StatNumber
            color={textColor}
            fontSize={{
              base: "2xl",
            }}>
            {value ? value : <Spinner
                    thickness="2px"
                    speed="0.65s"
                    emptyColor="gray.200"
                    color={tracColor}
                    size="md"
                  />}
          </StatNumber>
          {growth ? (
            <Flex align='center'>
              <Text color={growth.charAt(0) === "-" ? 'red.500' : 'green.500'} fontSize='xs' fontWeight='700' me='5px'>
                {growth.charAt(0) === "-" ? <Icon as={MdArrowDownward} color="red.500" w="15px" h="15px" /> : <Icon as={MdArrowUpward} color="green.500" w="15px" h="15px" />}{growth}
              </Text>
              <Text color='secondaryGray.600' fontSize='xs' fontWeight='400'>
                since last month
              </Text>
            </Flex>
          ) : null}
        </Stat>
        <Flex ms='auto' w='max-content'>
          {endContent}
        </Flex>
      </Flex>
    </Card>
  );
}
