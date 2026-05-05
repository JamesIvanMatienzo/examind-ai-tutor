import cors from "cors";
import express from "express";
import { env } from "./lib/env.js";
import { practiceRouter } from "./routes/practice.js";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN.split(",").map((value) => value.trim()),
  }),
);
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/practice", practiceRouter);

app.listen(env.PORT, () => {
  console.log(`Examind backend listening on http://localhost:${env.PORT}`);
});

