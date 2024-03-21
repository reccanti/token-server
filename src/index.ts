import express from "express";
import cors from "cors";
import morgan from "morgan";
import { inspect } from "util";

const app = express();
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

let version;
let updatedAt;

app.post("/figma", async (req, res) => {
  console.log("posting...");
  console.log(req.body);
  console.log(req.query);
  // console.log(req.header);
  console.log(req.path);
  console.log(req.body);
  version = req.body.version;
  updatedAt = req.body.updatedAt;
  return await res.status(201).json({
    created: true,
    version,
    updatedAt,
  });
});

app.get("/figma", async (req, res) => {
  console.log("getting...");
  console.log(req.body);
  console.log(req.query);
  // console.log(req.header);
  console.log(req.path);
  // console.log(req.formData)
  // console.log(res.json());
  // console.log(req.method);
  return await res.status(200).json({
    version,
    updatedAt,
    values: {},
  });
});

// app.get("/figma/:tokenSet", (req, res) => {
//   console.log(req);
//   console.log("getting set....");
// });

app.put("/figma", async (req, res) => {
  console.log("putting...");
  console.log(inspect(req.body, true, 10, true));
  version = req.body.version;
  updatedAt = req.body.updatedAt;
  return await res.status(200).json({
    version,
    updatedAt,
    values: {},
  });
});

app.all("/figma", (req, res) => {
  console.log(req.method);
});

// app.all("/figma", () => {
//   console.log("hit!");
// });

console.log("listening on port 8000");
app.listen(8000);
