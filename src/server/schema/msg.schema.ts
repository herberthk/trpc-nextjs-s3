import { boolean, object, string, TypeOf } from "zod";
import { ImageType } from "~/utils/constants";

const addMsgParams = object({
  message: string(),
  hasImage: boolean(),
  imageType: ImageType,
}).partial({
  hasImage: true,
  imageType: true,
});

const deleteMsgParams = object({
  id: string(),
});

export type AddMsgParams = TypeOf<typeof addMsgParams>;
export type DeleteMsgParams = TypeOf<typeof deleteMsgParams>;
