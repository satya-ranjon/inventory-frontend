import apiClient from "../lib/api-client";

interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    fileName: string;
    fileUrl: string;
  };
}

export const uploadService = {
  async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    try {
      // Create FormData object to send file
      const formData = new FormData();
      formData.append("file", file);

      // Configure axios request with progress tracking
      const response = await apiClient.post("/uploads", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  },

  // For this implementation, we'll simulate a successful upload
  // In a real app, this would be handled by your API server
  async simulateUpload(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (onProgress) {
          onProgress(progress);
        }

        if (progress >= 100) {
          clearInterval(interval);
          resolve({
            success: true,
            message: "File uploaded successfully",
            data: {
              fileName: file.name,
              fileUrl: `https://storage.example.com/documents/${file.name}`,
            },
          });
        }
      }, 300);
    });
  },
};
