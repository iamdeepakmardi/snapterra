import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";

import type { ScreenshotFileRouter } from "../../../backend/src/modules/screenshots/screenshots.upload";

export const UploadButton = generateUploadButton<ScreenshotFileRouter>();
export const UploadDropzone = generateUploadDropzone<ScreenshotFileRouter>();
export const { useUploadThing } = generateReactHelpers<ScreenshotFileRouter>();
