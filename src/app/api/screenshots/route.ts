import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  try {
    const result = await query(
      `SELECT s.*, STRING_AGG(t.name, ',') as tags 
       FROM screenshots s
       LEFT JOIN screenshot_tags st ON s.id = st.screenshot_id
       LEFT JOIN tags t ON st.tag_id = t.id
       WHERE s.user_id = $1 
       GROUP BY s.id
       ORDER BY s.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching screenshots: ", error);
    return NextResponse.json({ error: "Failed to fetch screenshots" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, filename, tags } = await request.json();

    const screenshotRes = await query(
      "INSERT INTO screenshots (user_id, filename, title) VALUES ($1, $2, $3) RETURNING id",
      [userId, filename, title],
    );
    const screenshotId = screenshotRes.rows[0].id;

    if (tags && typeof tags === "string") {
      const tagList = tags
        .split(",")
        .map((t: string) => t.trim().toLowerCase())
        .filter(Boolean);

      for (const tagName of tagList) {
        const tagRes = await query("SELECT id FROM tags WHERE name = $1", [tagName]);
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

        await query(
          "INSERT INTO screenshot_tags (screenshot_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [screenshotId, tagId],
        );
      }
    }

    return NextResponse.json({ id: screenshotId, message: "Screenshot saved with tags" }, { status: 201 });
  } catch (error) {
    console.error("Error creating screenshot: ", error);
    return NextResponse.json({ error: "Failed to create screenshot" }, { status: 500 });
  }
}
