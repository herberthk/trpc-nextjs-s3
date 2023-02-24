import { Flex, Loader } from "@mantine/core";

const Loading = () => {
  return (
    <Flex
      justify="center"
      align="center"
      sx={{
        width: "100%",
        height: "80vh",
      }}
    >
      <Loader size="xl" />;
    </Flex>
  );
};

export default Loading;
