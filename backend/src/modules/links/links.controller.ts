import type { Response } from "express";
import { query } from "../../config/db";
import type { AuthRequest } from "../../middleware/auth.middleware";

// Get Links
export const getLinks = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT l.*, STRING_AGG(t.name, ',') as tags 
       FROM links l
       LEFT JOIN link_tags lt ON l.id = lt.link_id
       LEFT JOIN tags t ON lt.tag_id = t.id
       WHERE l.user_id = $1 
       GROUP BY l.id
       ORDER BY l.created_at DESC`,
      [req.userId],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching links: ", error);
    res.status(500).json({ error: "Failed to fetch links" });
  }
};

// Create Links
export const createLink = async (req: AuthRequest, res: Response) => {
  const { title, url, tags } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // Insert the link
    const linkRes = await query(
      "INSERT INTO links (user_id, url, title) VALUES ($1, $2, $3) RETURNING id",
      [req.userId, url, title],
    );
    const linkId = linkRes.rows[0].id;

    // Handle tags if provided
    if (tags && typeof tags === "string") {
      const tagList = tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      for (const tagName of tagList) {
        // Upsert tag
        // This reuses the same tags table
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

        // Link tag to the newly created link
        await query(
          "INSERT INTO link_tags (link_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [linkId, tagId],
        );
      }
    }

    res.status(201).json({ id: linkId, message: "Link saved with tags" });
  } catch (error) {
    console.error("Error creating link: ", error);
    res.status(500).json({ error: "Failed to create link" });
  }
};

// Remove Tags
export const removeTagFromLink = async (req: AuthRequest, res: Response) => {
  const { id, tagName } = req.params;
  try {
    // Get tag ID
    const tagRes = await query("SELECT id FROM tags WHERE name = $1", [
      tagName,
    ]);
    if (tagRes.rowCount === 0) {
      return res.status(404).json({ error: "Tag not found" });
    }
    const tagId = tagRes.rows[0].id;

    // Remove the link in link_tags
    await query("DELETE FROM link_tags WHERE link_id = $1 AND tag_id = $2", [
      id,
      tagId,
    ]);

    res.json({ message: "Tag removed from link" });
  } catch (error) {
    console.error("Error removing tag: ", error);
    res.status(500).json({ error: "Failed to remove tag" });
  }
};

// Delete Links
export const deleteLink = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query(
      "DELETE FROM links WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.userId],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Link not found or unauthorized" });
    }

    res.json({ message: "Link deleted successfully" });
  } catch (error) {
    console.error("Error deleting link: ", error);
    res.status(500).json({ error: "Failed to delete link" });
  }
};
