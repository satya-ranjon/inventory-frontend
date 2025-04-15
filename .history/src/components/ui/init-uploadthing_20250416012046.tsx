import { useEffect } from "react";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { ACCEPTED_FILE_TYPES } from "../../lib/uploadthing";

// Initialize Uploadthing client
let clientAcceptSetup = false;

export function InitUploadThing() {
  useEffect(() => {
    if (clientAcceptSetup) return;

    generateClientDropzoneAccept(ACCEPTED_FILE_TYPES);

    clientAcceptSetup = true;
  }, []);

  return null;
}
