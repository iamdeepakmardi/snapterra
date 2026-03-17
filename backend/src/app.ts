import express from "express";
import cors from "cors";
import "dotenv/config";
import { createRouteHandler } from "uploadthing/express";
import authRoutes from "./modules/auth/auth.routes";
import screenshotRoutes from "./modules/screenshots/screenshots.routes";
import { screenshotUploadRouter } from "./modules/screenshots/screenshots.upload";

const app = express();

app.use(cors());

// Global Request Logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// UploadThing route (placed before express.json() if needed, but definitely for visibility)
app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: screenshotUploadRouter,
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/screenshots", screenshotRoutes);

export default app;
