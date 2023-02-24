import { Flex, Text } from "@mantine/core";

function Nodata() {
  return (
    <Flex
      justify="center"
      align="center"
      sx={{
        width: "100%",
        height: "80vh",
      }}
    >
      <Text size="xl" fz="xl">
        No message available
      </Text>
    </Flex>
  );
}

export default Nodata;
