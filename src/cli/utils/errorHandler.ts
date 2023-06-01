import { logger } from "./index.js";

export const errorHandler = async (err: any) => {
  logger.error("Aborting cli...");

  if (err instanceof Error) {
    logger.error(err);
  } else {
    logger.error(
      "An unknown error has occurred. Please open an issue on github with the below:"
    );
    logger.default(err);
  }
  process.exit(1);
};
