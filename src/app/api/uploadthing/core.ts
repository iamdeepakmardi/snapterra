import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getUserIdFromRequest } from "@/lib/auth";
import { query } from "@/lib/db";
import { z } from "zod";

const f = createUploadthing();

export const ourFileRouter = {
  screenshotUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(
      z.object({
        title: z.string().optional(),
        tags: z.string().optional(),
      }),
    )
    .middleware(async ({ req, input }) => {
      const userId = await getUserIdFromRequest();
      if (!userId) throw new Error("Unauthorized");

      return {
        userId: Number(userId),
        title: input.title,
        tags: input.tags,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        const finalTitle = metadata.title || file.name;
        
        const res = await query(
          "INSERT INTO screenshots (user_id, filename, title) VALUES ($1, $2, $3) RETURNING id",
          [metadata.userId, file.ufsUrl, finalTitle],
        );

        // Handle tags if provided
        if (metadata.tags && typeof metadata.tags === "string") {
            const tagList = metadata.tags
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
                [res.rows[0].id, tagId],
              );
            }
          }

        console.log("DATABASE SUCCESS: Saved row ID:", res.rows[0].id);
      } catch (error) {
        console.error("DATABASE ERROR in onUploadComplete:", error);
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
