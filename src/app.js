import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "18kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Route ---

import authRouter from "./routes/auth.routes.js";

app.use("/api/v1/auth", authRouter);

export default app;
