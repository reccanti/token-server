import express from "express";
import cors from "cors";
import morgan from "morgan";

import { Tokens } from "./TokenModel";
import { TokenFileHandler } from "./TokenFileHandler";
import { Metadata } from "./TokenModel";

import StyleDictionary from "style-dictionary";
import { registerTransforms } from "@tokens-studio/sd-transforms";
import { resolve } from "path";

async function start() {
  await registerTransforms(StyleDictionary);

  // const sd = StyleDictionary.extend({
  //   source: [resolve(__dirname, "../tokens/**/*.json")],
  //   platforms: {
  //     css: {
  //       transformGroup: "tokens-studio",
  //       buildPath: "build/css/",
  //       files: [
  //         {
  //           destination: "variables.css",
  //           format: "css/variables",
  //         },
  //       ],
  //     },
  //   },
  // });

  // create a file handler and watch for changes
  const fileHandler = new TokenFileHandler();
  await fileHandler.initializeFileStructure();
  let tokens = await fileHandler.loadTokensFromFiles();
  fileHandler.on("themesChanged", (updatedTokens) => {
    tokens = updatedTokens;
    // console.log(sd.exportPlatform("css"));
  });

  const app = express();
  app.use(cors());
  app.use(morgan("combined"));
  app.use(express.json());

  app.post("/figma", async (req, res) => {
    return await res.status(200).json({
      created: false,
      version: tokens.metadata.pluginVersion,
      updatedAt: tokens.metadata.updatedAt,
      values: tokens.tokens,
    });
  });

  app.get("/figma", async (req, res) => {
    return await res.status(200).json({
      created: false,
      version: tokens.metadata.pluginVersion,
      updatedAt: tokens.metadata.updatedAt,
      values: tokens.tokens,
    });
  });

  app.put("/figma", async (req, res) => {
    const pluginVersion = req.body.version;
    const updatedAt = req.body.updatedAt;
    const newValues = req.body.values;

    const metadata: Metadata = {
      pluginVersion,
      updatedAt,
    };

    const updatedTokens = new Tokens(newValues, metadata);
    await fileHandler.saveTokensToFiles(updatedTokens);
    const savedTokens = await fileHandler.loadTokensFromFiles();

    return await res.status(200).json({
      version: savedTokens.metadata.pluginVersion,
      updatedAt: savedTokens.metadata.updatedAt,
      values: savedTokens.tokens,
    });
  });

  console.log("listening on port 8000");
  app.listen(8000);
}
start();
