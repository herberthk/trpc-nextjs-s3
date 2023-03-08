import Chat from "../models/Chat";
import { AddMsgParams, DeleteMsgParams } from "../schema/msg.schema";
import AWS from "aws-sdk";
import { randomUUID } from "crypto";

const S3 = new AWS.S3({
  region: "eu-west-2",
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  signatureVersion: "v4",
});

type ReturnType = {
  uploadUrl: string;
  Key?: string;
};

export type MsgResponse = {
  id: string;
  url?: string;
  message: string;
  pd: string;
};

type MsgParams = {
  cursor?: string | null;
};

// Get signed url and key to upload to S3
const getSignedUrl = async (type?: string): Promise<ReturnType> => {
  const Key = `${randomUUID()}.${type}`;

  const s3Params = {
    Bucket: process.env.BUCKET_NAME,
    Key,
    Expires: 108000,
    ContentType: type,
  };

  const uploadUrl = await S3.getSignedUrl("putObject", s3Params);
  return {
    Key,
    uploadUrl,
  };
};

//Encode cursor to base64 to make it secure
const toCursorHash = (s: string) => Buffer.from(s).toString("base64");

//Decode cursor from base64 back to string
const fromCursorHash = (s: string) =>
  Buffer.from(s, "base64").toString("ascii");

// Get chat messages
export const getMessages = async ({
  input: { cursor },
}: {
  input: MsgParams;
}) => {
  try {
    const limit = 8;

    let chats;
    if (cursor) {
      chats = await Chat.find({
        pd: { $lt: new Date(fromCursorHash(cursor)) },
      })
        .sort({ pd: -1 })
        .limit(limit + 1);
    } else {
      chats = await Chat.find({})
        .sort({ pd: -1 })
        .limit(limit + 1);
    }

    const allChats: MsgResponse[] = await Promise.all(
      chats.map(async (chat) => {
        // The chat message has a photo image
        if (chat.imageKey) {
          return {
            url: await S3.getSignedUrlPromise("getObject", {
              Bucket: process.env.BUCKET_NAME,
              Key: chat.imageKey,
            }),
            id: chat._id,
            message: chat.message,
            pd: chat.pd.toISOString(),
          };
        } else {
          return {
            id: chat._id,
            message: chat.message,
            pd: chat.pd.toISOString(),
          };
        }
      })
    );

    // There still other messages available
    let hasNext = allChats.length > limit;
    // The real chat messages
    let edges = hasNext ? allChats.slice(0, -1) : allChats;
    return {
      edges,
      pageInfo: {
        hasNext,
        cursor: edges.length
          ? toCursorHash(edges[edges.length - 1].pd.toString())
          : "",
      },
    };
  } catch (error) {
    console.error("Error getting messages", error);
  }
};

export const addMessage = async ({
  input: { imageType, hasImage, message },
}: {
  input: AddMsgParams;
}) => {
  // The user has not Posted a message with photo image
  if (!hasImage) {
    try {
      const chat = Chat.build({ message, pd: new Date() });
      await chat.save();
      return {
        success: true,
        message: "Post created",
      };
    } catch (error) {
      console.error("Error adding message", error);
    }
  } else {
    try {
      //Get Upload url and key to to upload to S3
      const { Key, uploadUrl } = await getSignedUrl(imageType);

      const chat = Chat.build({
        message,
        pd: new Date(),
        imageKey: Key,
      });
      await chat.save();

      return {
        success: true,
        uploadUrl,
      };
    } catch (error) {
      console.error("Error adding message", error);
    }
  }
};

export const deleteMessage = async ({
  input: { id },
}: {
  input: DeleteMsgParams;
}) => {
  try {
    const chat = await Chat.findOne({ _id: id });
    // The message to be deleted contains image so we need to delete image from S3 before deleting the message
    if (chat?.imageKey) {
      await S3.deleteObject({
        Bucket: process.env.BUCKET_NAME,
        Key: chat?.imageKey,
      });
    }
    // The we delete the message
    await Chat.deleteOne({ _id: id });
    return {
      success: true,
      message: "Deleted",
    };
  } catch (error) {
    console.error("Error deleting message", error);
  }
};
