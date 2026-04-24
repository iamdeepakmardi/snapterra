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
      `SELECT l.*, STRING_AGG(t.name, ',') as tags 
       FROM links l
       LEFT JOIN link_tags lt ON l.id = lt.link_id
       LEFT JOIN tags t ON lt.tag_id = t.id
       WHERE l.user_id = $1 
       GROUP BY l.id
       ORDER BY l.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching links: ", error);
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, url, tags } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const linkRes = await query(
      "INSERT INTO links (user_id, url, title) VALUES ($1, $2, $3) RETURNING id",
      [userId, url, title],
    );
    const linkId = linkRes.rows[0].id;

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
          "INSERT INTO link_tags (link_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [linkId, tagId],
        );
      }
    }

    return NextResponse.json({ id: linkId, message: "Link saved with tags" }, { status: 201 });
  } catch (error) {
    console.error("Error creating link: ", error);
    return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
  }
}
