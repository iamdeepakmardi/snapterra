import type { Response } from "express";
import { query } from "../../config/db";
import type { AuthRequest } from "../../middleware/auth.middleware";

export const getScreenshots = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT s.*, STRING_AGG(t.name, ',') as tags 
       FROM screenshots s
       LEFT JOIN screenshot_tags st ON s.id = st.screenshot_id
       LEFT JOIN tags t ON st.tag_id = t.id
       WHERE s.user_id = $1 
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
      [req.userId],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching screenshots: ", error);
    res.status(500).json({ error: "Failed to fetch screenshots" });
  }
};

export const createScreenshot = async (req: AuthRequest, res: Response) => {
  const { title, filename, tags } = req.body;
  try {
    // 1. Insert the screenshot
    const screenshotRes = await query(
      "INSERT INTO screenshots (user_id, filename, title) VALUES ($1, $2, $3) RETURNING id",
      [req.userId, filename, title],
    );
    const screenshotId = screenshotRes.rows[0].id;

    // 2. Handle tags if provided
    if (tags && typeof tags === "string") {
      const tagList = tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      for (const tagName of tagList) {
        // Upsert tag
        let tagRes = await query("SELECT id FROM tags WHERE name = $1", [
          tagName,
        ]);
        let tagId;

        if (tagRes.rowCount === 0) {
          const newTagRes = await query(
            "INSERT INTO tags (name) VALUES ($1) RETURNING id",
            [tagName],
          );
          tagId = newTagRes.rows[0].id;
        } else {
          tagId = tagRes.rows[0].id;
        }

        // Link tag to screenshot
        await query(
          "INSERT INTO screenshot_tags (screenshot_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [screenshotId, tagId],
        );
      }
    }

    res
      .status(201)
      .json({ id: screenshotId, message: "Screenshot saved with tags" });
  } catch (error) {
    console.error("Error creating screenshot: ", error);
    res.status(500).json({ error: "Failed to create screenshot" });
  }
};

export const deleteScreenshot = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query(
      "DELETE FROM screenshots WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Screenshot not found" });
    }

    res.json({ message: "Screenshot deleted successfully" });
  } catch (error) {
    console.error("Error deleting screenshot: ", error);
    res.status(500).json({ error: "Failed to delete screenshot" });
  }
};
