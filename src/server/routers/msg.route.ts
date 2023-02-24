import { t } from "../createRouter";
import {
  addMessage,
  deleteMessage,
  getMessages,
} from "../controllers/msg.controller";
import { boolean, string, z } from "zod";

const msgRouter = t.router({
  list: t.procedure
    .input(
      z.object({
        cursor: z.string().nullish(),
      })
    )
    .query(({ input }) => getMessages({ input })),
  add: t.procedure
    .input(
      z.object({
        message: string(),
        hasImage: boolean(),
        image: z.string().nullish(),
      })
    )
    .mutation(({ input }) => addMessage({ input })),
  delete: t.procedure
    .input(z.object({ id: string() }))
    .mutation(({ input }) => deleteMessage({ input })),
});

export default msgRouter;
