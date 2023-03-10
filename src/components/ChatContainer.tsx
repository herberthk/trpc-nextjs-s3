import Messages from "./Messages";
import { Button, Center, Flex, Loader, TextInput } from "@mantine/core";
import { MdOutlineAttachFile } from "react-icons/md";
import { inferProcedureInput } from "@trpc/server";
import { trpc } from "~/utils/trpc";
import {
  useState,
  KeyboardEvent,
  useRef,
  ChangeEvent,
  useCallback,
} from "react";
import { AppRouter } from "~/server/routers/_app";
import { MsgResponse } from "~/server/controllers/msg.controller";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import Preview from "./Preview";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "~/utils/constants";
import { uploadToS3 } from "~/utils/helpers";

const ChatContainer = () => {
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");
  const [triggerScroll, setScroll] = useState<boolean>(false);
  const utils = trpc.useContext();
  const addPost = trpc.msg.add.useMutation({
    onMutate: async (newMessage) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await utils.msg.list.cancel();
      // Snapshot the previous value
      const previousMessages = await utils.msg.list.getData();

      // Optimistically update to the new value
      let updatedMessage: MsgResponse;
      // Image sent along the message
      if (!newMessage.hasImage) {
        updatedMessage = {
          message: newMessage.message,
          pd: new Date().toISOString(),
          id: uuidv4(),
        };
      } else {
        if (!photo) {
          return;
        }
        // Image sent along with the message
        updatedMessage = {
          message: newMessage.message,
          pd: new Date().toISOString(),
          id: uuidv4(),
          url: URL.createObjectURL(photo),
        };
      }
      // There is currently no clear fix for this bug. It happens when setting a callback function to setData()
      // There is no documentation for setData() of trpc however setQueryData() react query equivalent's first argument is the queryKey which is not available with trpc.
      // This question is not resolved https://stackoverflow.com/questions/74679725/trpc-throws-an-error-in-setdata-usecontext-wrapper-of-tanstack-query-after-i-u
      // This issue https://github.com/trpc/trpc/issues/3123 seems to have a pull request which was merged but unfortunately did not resolve the problem.
      // @ts-ignore
      await utils.msg.list.setData("", (old) => {
        if (!old) return;
        return [...old.edges, updatedMessage];
      });

      // Return a context object with the snapshot value
      return { previousMessages };
    },
    onSuccess: async (data): Promise<void> => {
      await uploadToS3(photo, photo?.type, data?.uploadUrl);
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: async (err, newMsg, context) => {
      await utils.msg.list.setData({}, context?.previousMessages);
    },

    // Always refetch after error or success:
    onSettled: async () => {
      // Remove from the rest of functions
      setPhoto(null);
      await utils.msg.list.invalidate();
    },
  });

  const inputRef = useRef<HTMLInputElement>(null);
  type Input = inferProcedureInput<AppRouter["msg"]["add"]>;

  const sendMessage = async () => {
    const input: Input = {
      hasImage,
      message,
      imageType: photo?.type,
    };
    setLoading(true);
    setSubmitted(true);
    setScroll(false);
    try {
      await addPost.mutateAsync(input);
      setPreviewSrc("");
      setMessage("");
      setHasImage(false);
      // setEncodedImage(null);
      toast.success("Success", {
        closeOnClick: true,
        progress: undefined,
      });
    } catch (error) {
      console.error("error", error);
      toast.error("Something went wrong", {
        closeOnClick: true,
        progress: undefined,
      });
    } finally {
      setLoading(false);
      setMessage("");
      setHasImage(false);
      setSubmitted(false);
      setScroll(true);
    }
  };

  // Fires When user presses enter Key without shift key to send message
  const onKeyUp = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const onChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(e.target.files[0].type)) {
      toast.error("upload valid image", {
        closeOnClick: true,
        progress: undefined,
      });
      toast.info("Uploaded image should be of type png, jpg, gif or", {
        closeOnClick: true,
        progress: undefined,
      });
      e.target.value = "";
      return;
    }
    // File size should not exceed 500kb
    if (e.target.files[0].size > MAX_FILE_SIZE) {
      toast.error("Uploaded image is too large", {
        closeOnClick: true,
        progress: undefined,
      });
      toast.info("Uploaded image shouldn't exceed 500kb", {
        closeOnClick: true,
        progress: undefined,
      });
      e.target.value = "";
      return;
    }
    // We have the image uploaded with message
    setHasImage(true);
    // We set the uploaded image/photo to be available to other functions
    setPhoto(e.target.files[0]);

    // We get the image to preview
    const src = URL.createObjectURL(e.target.files[0]);
    setPreviewSrc(src);
    e.target.value = "";
  }, []);

  const removePreviewImage = useCallback(() => {
    // Remove preview image
    setPreviewSrc("");
    // Remove from the rest of functions
    setPhoto(null);
    // Send without image
    setHasImage(false);
  }, []);

  const handleClick = () => inputRef.current?.click();

  return (
    <Flex direction="column" sx={{ position: "relative" }}>
      <Messages triggerScroll={triggerScroll} />

      <Center
        sx={{
          visibility: loading ? "visible" : "hidden",
          position: "absolute",
          left: "44%",
          bottom: "3.67rem",
        }}
      >
        <Loader size="xl" variant="dots" />
      </Center>
      {previewSrc && (
        <div
          style={{
            position: "absolute",
            bottom: "4.7rem",
            left: "40%",
          }}
        >
          <Preview
            loading={loading}
            src={previewSrc}
            removePreviewImage={removePreviewImage}
          />
        </div>
      )}

      <Flex
        justify="space-between"
        gap="xs"
        sx={{ backgroundColor: "#fff", padding: "10px" }}
      >
        <TextInput
          value={!submitted ? message : ""}
          onChange={(e) => setMessage(e.target.value)}
          size="lg"
          sx={{ width: "100%" }}
          placeholder="Enter message..."
          onKeyUp={onKeyUp}
        />
        <Flex justify="space-between" gap="xs">
          <input
            type="file"
            accept="image/*"
            ref={inputRef}
            className="file"
            onChange={onChange}
          />
          <Button
            size="lg"
            variant="light"
            onClick={handleClick}
            style={{ border: "1px solid #000", backgroundColor: "#fff" }}
          >
            <MdOutlineAttachFile
              style={{ transform: "rotate(45deg)", marginRight: "12px" }}
              size={37}
            />
          </Button>
          <Button
            onClick={sendMessage}
            disabled={loading || !message}
            size="lg"
          >
            SEND
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ChatContainer;
