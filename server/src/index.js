import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { authRoutes } from "./routes/authRoutes.js";
import { chatRoutes } from "./routes/chatRoutes.js";

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.set("trust proxy", 1);

const authLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 50 });
app.use("/auth", authLimiter, authRoutes);
app.use("/api", chatRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on :${port}`));
