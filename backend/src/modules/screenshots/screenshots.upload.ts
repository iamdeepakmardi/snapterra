import { createUploadthing, type FileRouter } from "uploadthing/express";
import { verifyToken } from "../../utils/auth";
import { query } from "../../config/db";
import { z } from "zod";

const f = createUploadthing();

export const screenshotUploadRouter = {
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
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) throw new Error("Unauthorized");

      const userId = verifyToken(token);
      if (!userId) throw new Error("Invalid token");

      console.log("Middleware successfully verified user:", userId);
      return {
        userId: Number(userId),
        title: input.title,
        tags: input.tags,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(">>> UPLOAD COMPLETE CALLBACK TRIGGERED <<<");
      console.log("Saving for UserID:", metadata.userId);
      console.log("Title:", metadata.title);
      console.log("File URL:", file.ufsUrl);

      try {
        const finalTitle = metadata.title || file.name;
        // TODO: can parse metadata.tags here

        const res = await query(
          "INSERT INTO screenshots (user_id, filename, title) VALUES ($1, $2, $3) RETURNING *",
          [metadata.userId, file.ufsUrl, finalTitle],
        );

        console.log("DATABASE SUCCESS: Saved row ID:", res.rows[0].id);
      } catch (error) {
        console.error("DATABASE ERROR in onUploadComplete:", error);
      }
    }),
} satisfies FileRouter;

export type ScreenshotFileRouter = typeof screenshotUploadRouter;
