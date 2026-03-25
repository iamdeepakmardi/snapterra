import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";

const uploadUrl = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/uploadthing`
  : "/api/uploadthing";

// Mocking the backend router type to prevent Vercel build from compiling the backend folder
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const UploadButton = generateUploadButton<any>({ url: uploadUrl });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const UploadDropzone = generateUploadDropzone<any>({ url: uploadUrl });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const { useUploadThing } = generateReactHelpers<any>({ url: uploadUrl });
