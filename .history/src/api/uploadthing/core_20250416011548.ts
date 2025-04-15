import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with its own config
  documentUploader: f({
    pdf: { maxFileSize: "10MB" },
    image: { maxFileSize: "5MB", maxFileCount: 3 },
    "application/msword": { maxFileSize: "5MB" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "5MB",
    },
    "application/vnd.ms-excel": { maxFileSize: "5MB" },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      maxFileSize: "5MB",
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // This code runs on your server before upload
      // You can authenticate, validate permissions, etc.

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: "user123" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete:", file.url);

      // Now you can use the file URL in your app
      return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
