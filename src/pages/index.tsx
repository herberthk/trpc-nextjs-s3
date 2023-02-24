/**
 * This is a Next.js page.
 */
import { Container } from "@mantine/core";
import ChatContainer from "~/components/ChatContainer";

export default function IndexPage() {
  return (
    <Container
      size="sm"
      sx={{
        marginTop: "2rem",
        paddingTop: "1rem",
        display: "flex",
        flexDirection: "column",
        //
      }}
    >
      <ChatContainer />
    </Container>
  );
}
