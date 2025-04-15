import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "../api/uploadthing/core";

// Generate the React helpers from the file router
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();

// Export constants for accepted file types and sizes
export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
];

export const MAX_FILE_SIZE = 1024 * 1024 * 10; // 10MB
