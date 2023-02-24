import { boolean, object, string, TypeOf } from "zod";

const addMsgParams = object({
  message: string(),
  hasImage: boolean(),
  image: string().nullish(),
});

const deleteMsgParams = object({
  id: string(),
});

export type AddMsgParams = TypeOf<typeof addMsgParams>;
export type DeleteMsgParams = TypeOf<typeof deleteMsgParams>;
