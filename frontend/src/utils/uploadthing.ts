/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";

const uploadUrl = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/uploadthing`
  : "/api/uploadthing";

// Mocking the backend router type to prevent Vercel build from compiling the backend folder
export const UploadButton = generateUploadButton<any>({ url: uploadUrl });
export const UploadDropzone = generateUploadDropzone<any>({ url: uploadUrl });
export const { useUploadThing } = generateReactHelpers<any>({ url: uploadUrl });
