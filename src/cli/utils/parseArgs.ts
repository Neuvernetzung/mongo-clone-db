import minimist from "minimist";
import { formatZodErrors } from "./formatZodErrors";
import { z } from "zod";

export const parseArgs = (args: minimist.Opts) => {
  const originalArgs = minimist(process.argv.slice(2), args);

  const zArgs = z.object({
    source: z.string().url().optional(),
    target: z.string().url().optional(),
  });

  const parsedArgs = zArgs.safeParse(originalArgs);

  if (!parsedArgs?.success) {
    throw new Error(formatZodErrors(parsedArgs.error.issues));
  }

  return parsedArgs.data;
};
