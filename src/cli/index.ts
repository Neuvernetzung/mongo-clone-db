#!/usr/bin/env node

import minimist from "minimist";
import { errorHandler, logger } from "./utils";
import { parseArgs } from "./utils/parseArgs";
import { input, checkbox } from "@inquirer/prompts";
import connectDB from "./utils/connectDb";
import { Listr } from "listr2";

const cliOpts: minimist.Opts = {
  string: ["s", "t"],
  alias: {
    s: "source",
    t: "target",
  },
};

const main = async () => {
  const args = parseArgs(cliOpts);

  logger.start("Mongo Clone started.");

  const source =
    args.source || (await input({ message: "Enter the SOURCE URL." }));

  const target =
    args.target || (await input({ message: "Enter the TARGET URL." }));

  const sourceConnection = connectDB(source);

  const targetConnection = connectDB(target);

  if (!sourceConnection)
    throw Error("No connection to the SOURCE could be established.");

  if (!targetConnection)
    throw Error("No connection to the TARGET could be established.");

  const collections = (
    await sourceConnection.db().listCollections().toArray()
  ).map((collection) => collection.name);

  if (!collections || collections.length === 0)
    throw Error(
      "The source database is empty or an error has occurred with the connection."
    );

  const chosenCollections = await checkbox({
    message: "Choose database collections to clone.",
    choices: collections.sort().map((collection) => ({
      name: collection,
      value: collection,
      checked: true,
    })),
  });

  const collectionsWithCount = await Promise.all(
    chosenCollections.map(async (collection) => ({
      name: collection,
      count: await sourceConnection
        .db()
        .collection(collection)
        .countDocuments(),
    }))
  );

  const list = new Listr(
    collectionsWithCount.map((collection) => {
      return {
        title: `Transfering ${collection.name} - ${collection.count} Items`,
        task: async (_, task) => {
          const sourceCollection = sourceConnection
            .db()
            .collection(collection.name);

          const targetCollection = targetConnection
            .db()
            .collection(collection.name);

          await targetCollection.insertMany(
            await sourceCollection.find().toArray(),
            {
              ordered: false,
            }
          );
        },
        skip: collection.count === 0,
      };
    })
  );

  await list.run();

  logger.finished("Mongo clone finished.");

  process.exit(0);
};

main().catch(errorHandler);
