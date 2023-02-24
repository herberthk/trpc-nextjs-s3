import { Card, Image, Text, Box, ActionIcon } from "@mantine/core";
import { useState, FC, useCallback, memo } from "react";
import { inferProcedureInput } from "@trpc/server";
import TimeAgo from "react-timeago";

import { trpc } from "../utils/trpc";
import { MdOutlineClose } from "react-icons/md";
import { AppRouter } from "~/server/routers/_app";
import { toast } from "react-toastify";

interface Props {
  message: string;
  image?: string;
  id: string;
  date: string;
}
const Message: FC<Props> = ({ date, message, image, id }) => {
  const [loading, setLoading] = useState(false);

  const utils = trpc.useContext();
  const handleDelete = trpc.msg.delete.useMutation({
    onMutate: async (ops) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await utils.msg.list.cancel();
      // Snapshot the previous value
      const previousMessages = await utils.msg.list.getData();

      // There is currently no clear fix for this bug. It happens when setting a callback function to setData()
      // There is no documentation for setData() of trpc however setQueryData() react query equivalent's first argument is the queryKey which is not available with trpc.
      // This question is not resolved https://stackoverflow.com/questions/74679725/trpc-throws-an-error-in-setdata-usecontext-wrapper-of-tanstack-query-after-i-u
      // This issue https://github.com/trpc/trpc/issues/3123 seems to have a pull request which was merged but unfortunately did not resolve the problem.
      // @ts-ignore
      await utils.msg.list.setData("", (old) =>
        old?.edges.filter((m) => m.id !== ops.id)
      );

      // Return a context object with the snapshotted value
      return { previousMessages };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: async (err, newMsg, context) => {
      await utils.msg.list.setData({}, context?.previousMessages);
    },

    // Always refetch after error or success:
    onSettled: async () => {
      await utils.msg.list.invalidate();
    },
    // onSuccess: async () => {
    //   await utils.msg.list.invalidate();
    // },
  });

  type Input = inferProcedureInput<AppRouter["msg"]["delete"]>;

  const deleteMsg = useCallback(async () => {
    const input: Input = {
      id,
    };
    setLoading(true);
    try {
      await handleDelete.mutateAsync(input);
      toast.success("Success, deleted", {
        closeOnClick: true,
        progress: undefined,
      });
    } catch (error) {
      toast.error("Something went wrong", {
        closeOnClick: true,
        progress: undefined,
      });
      console.error("error", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <Box className="chat-message">
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Text size="lg" fz="lg" sx={{ paddingBottom: "10px" }}>
          {message}
        </Text>
        {image && (
          <Card.Section>
            <Image src={image} height={160} alt="" />
          </Card.Section>
        )}
      </Card>

      <Text sx={{ marginLeft: "10px", marginTop: "4px" }} fz="sm">
        <TimeAgo date={date} />
      </Text>
      <ActionIcon
        variant="outline"
        disabled={loading}
        radius="xl"
        className="close-button"
        onClick={deleteMsg}
        title="Delete chat message"
      >
        <MdOutlineClose size={16} />
      </ActionIcon>
    </Box>
  );
};

export default memo(Message);
