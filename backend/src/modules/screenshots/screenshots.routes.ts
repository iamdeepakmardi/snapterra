import { Router } from "express";
import { createRouteHandler } from "uploadthing/express";
import { getScreenshots, createScreenshot, deleteScreenshot, removeTag } from "./screenshots.controller";
import { authProtect } from "../../middleware/auth.middleware";

const router = Router();

// Protected routes
router.use(authProtect);

router.get("/", getScreenshots);
router.post("/", createScreenshot);
router.delete("/:id", deleteScreenshot);
router.delete("/:id/tags/:tagName", removeTag);

export default router;
