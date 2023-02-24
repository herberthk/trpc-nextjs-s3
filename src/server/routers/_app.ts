import { publicProcedure } from "../trpc";
import msgRouter from "./msg.route";
import { router } from "../trpc";

export const appRouter = router({
  msg: msgRouter,
  // This is not required but to check if everything is working
  healthycheck: publicProcedure.query(() => "yay!"),
});

export type AppRouter = typeof appRouter;
