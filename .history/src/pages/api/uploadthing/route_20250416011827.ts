import { createNextRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "../../../api/uploadthing/core";

// Export routes for Next.js API routes
export const { GET, POST } = createNextRouteHandler({
  router: ourFileRouter,
});
