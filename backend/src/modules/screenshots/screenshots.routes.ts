import { Router } from "express";
import { createRouteHandler } from "uploadthing/express";
import { getScreenshots, createScreenshot, deleteScreenshot } from "./screenshots.controller";
import { authProtect } from "../../middleware/auth.middleware";

const router = Router();

// Protected routes
router.use(authProtect);

router.get("/", getScreenshots);
router.post("/", createScreenshot);
router.delete("/:id", deleteScreenshot);

export default router;
