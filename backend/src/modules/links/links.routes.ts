import { Router } from "express";
import { getLinks, createLink, deleteLink, removeTagFromLink } from "./links.controller";
import { authProtect } from "../../middleware/auth.middleware";

const router = Router();

// Protected routes (need login)
router.use(authProtect);

router.get("/", getLinks);
router.post("/", createLink);
router.delete("/:id", deleteLink);
router.delete("/:id/tags/:tagName", removeTagFromLink);

export default router;
