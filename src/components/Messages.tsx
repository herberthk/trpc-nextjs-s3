import { Center, Flex, Loader, Text } from "@mantine/core";
import Message from "./Message";
import { trpc } from "../utils/trpc";
import Nodata from "./Nodata";
import InfiniteScroll from "react-infinite-scroll-component";
import React, { FC, useEffect, useRef, useState } from "react";
import Loading from "./Loading";

type Props = {
  triggerScroll: boolean;
};
const Messages: FC<Props> = ({ triggerScroll }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hasNext, setHasNext] = useState(false);
  const scrollBottom = () => ref.current?.scrollTo(0, ref.current.scrollHeight);

  useEffect(() => {
    if (triggerScroll) {
      scrollBottom();
    }
  }, [triggerScroll]);
  const messageQuery = trpc.msg.list.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastpage) => lastpage?.pageInfo.cursor,

      onSuccess: ({ pages }) => {
        const next = pages.map((p) => p!.pageInfo.hasNext);
        setHasNext(next[next.length - 1]);
      },
    }
  );
  if (messageQuery.isLoading) {
    return <Loading />;
  }
  if (!messageQuery.data?.pages.map((p) => p?.edges).length) {
    return <Nodata />;
  }

  return (
    <Flex
      ref={ref}
      className="scroller"
      id="scrollableDiv"
      sx={{
        height: "83vh",
        backgroundColor: "hsl(204deg 8% 83%);",
        padding: "10px",
        overflowY: "auto",
      }}
      direction="column-reverse"
    >
      <InfiniteScroll
        dataLength={messageQuery.data.pages.map((p) => p?.edges).length}
        scrollableTarget="scrollableDiv"
        next={() => messageQuery.fetchNextPage()}
        hasMore={hasNext}
        loader={
          <Center sx={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}>
            <Loader variant="bars" />
          </Center>
        }
        endMessage={
          <Center sx={{ marginTop: "1rem", marginBottom: "1rem" }}>
            <Text fz="xl" size="xl">
              You have seen it all
            </Text>
          </Center>
        }
        inverse={true}
        style={{ display: "flex", flexDirection: "column-reverse" }}
      >
        {messageQuery.data.pages.map((page) => {
          return page?.edges.map(({ id, message, pd, url }) => (
            <Message
              key={id.toString()}
              date={pd}
              message={message}
              image={url}
              id={id.toString()}
            />
          ));
        })}
      </InfiniteScroll>
    </Flex>
  );
};

export default Messages;
