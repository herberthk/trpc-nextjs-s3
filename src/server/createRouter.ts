import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { connectDB } from "./config/config";
import { Context } from "./context";

// Connect to mongodb
(async () => await connectDB())();

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
});
