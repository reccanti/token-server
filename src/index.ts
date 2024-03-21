import express from "express";
import cors from "cors";
import morgan from "morgan";
import { inspect } from "util";

import { Tokens } from "./Tokens";

const tokens = new Tokens();

const app = express();
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

app.post("/figma", async (req, res) => {
  // if the tokens haven't been created yet, create them and return the
  // appropriate response
  if (!tokens.tokens) {
    console.log("creating...");
    const pluginVersion = req.body.version;
    const updatedAt = req.body.updatedAt;

    await tokens.create({ pluginVersion, updatedAt });
    const metadata = tokens.metadata;

    return await res.status(201).json({
      created: true,
      version: metadata.pluginVersion,
      updatedAt: metadata.updatedAt,
    });
  }
  // otherwise, return the current values
  else {
    console.log("fetching initial...");

    const values = tokens.tokens;
    const metadata = tokens.metadata;
    return await res.status(200).json({
      created: false,
      version: metadata.pluginVersion,
      updatedAt: metadata.updatedAt,
      values,
    });
  }
});

app.get("/figma", async (req, res) => {
  console.log("getting...");

  const values = tokens.tokens;
  const metadata = tokens.metadata;
  return await res.status(200).json({
    created: false,
    version: metadata.pluginVersion,
    updatedAt: metadata.updatedAt,
    values,
  });
});

app.put("/figma", async (req, res) => {
  console.log("updating...");

  const pluginVersion = req.body.version;
  const updatedAt = req.body.updatedAt;
  const newValues = req.body.values;

  await tokens.update(newValues, { pluginVersion, updatedAt });
  const metadata = tokens.metadata;

  return await res.status(200).json({
    version: metadata.pluginVersion,
    updatedAt: metadata.updatedAt,
    values: tokens.tokens,
  });
});

// app.all("/figma", () => {
//   console.log("hit!");
// });

console.log("listening on port 8000");
app.listen(8000);
