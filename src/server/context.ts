import { inferAsyncReturnType } from "@trpc/server";
import { NextApiRequest, NextApiResponse } from "next";

interface CreateContextOptions {
  // session: Session | null
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
export async function createContextInner(_opts: CreateContextOptions) {
  return {};
}

export function createContext({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) {
  return {
    req,
    res,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
