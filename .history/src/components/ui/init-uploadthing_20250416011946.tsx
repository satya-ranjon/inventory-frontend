import { useEffect } from "react";
import { generateClientDropzoneAccept } from "uploadthing/client";

// Initialize Uploadthing client
let clientAcceptSetup = false;

export function InitUploadThing() {
  useEffect(() => {
    if (clientAcceptSetup) return;

    generateClientDropzoneAccept({
      pdf: { maxFileSize: "8MB" },
      image: { maxFileSize: "4MB", maxFileCount: 3 },
      "application/msword": { maxFileSize: "4MB" },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        { maxFileSize: "4MB" },
      "application/vnd.ms-excel": { maxFileSize: "4MB" },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
        maxFileSize: "4MB",
      },
    });

    clientAcceptSetup = true;
  }, []);

  return null;
}
