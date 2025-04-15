import { useState } from "react";
import { UploadButton as UTUploadButton } from "@uploadthing/react";
import { Paperclip, X, FileText, Loader2 } from "lucide-react";
import { Button } from "./button";
import { toast } from "sonner";

export interface UploadedFile {
  fileName: string;
  fileUrl: string;
}

interface UploadButtonProps {
  onUploadComplete: (files: UploadedFile[]) => void;
  existingFiles?: UploadedFile[];
  onFileRemove?: (index: number) => void;
}

export function UploadButton({
  onUploadComplete,
  existingFiles = [],
  onFileRemove,
}: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="space-y-4 w-full">
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          <div className="space-y-2">
            {existingFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm">{file.fileName}</span>
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 block hover:underline">
                      View
                    </a>
                  </div>
                </div>
                {onFileRemove && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onFileRemove(index)}
                    className="h-6 w-6">
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* @ts-expect-error - Ignore type errors for simplicity */}
        <UTUploadButton
          endpoint="documentUploader"
          onUploadBegin={() => {
            setIsUploading(true);
          }}
          onClientUploadComplete={(res) => {
            setIsUploading(false);

            // Transform the response to match our expected format
            const uploadedFiles = res.map((file) => ({
              fileName: file.name,
              fileUrl: file.url,
            }));

            onUploadComplete(uploadedFiles);
            toast.success("Files uploaded successfully");
          }}
          onUploadError={(error) => {
            setIsUploading(false);
            toast.error(`Error uploading: ${error.message}`);
          }}
          className="ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90 ut-button:rounded-md ut-button:px-4 ut-button:py-2 ut-button:font-medium ut-button:text-sm ut-button:transition-colors ut-allowed-content:hidden"
          content={{
            allowedContent: (
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                <span>Upload documents</span>
              </div>
            ),
            button({ isUploading }) {
              return (
                <div className="flex items-center gap-2">
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Paperclip className="h-4 w-4" />
                  )}
                  <span>
                    {isUploading ? "Uploading..." : "Upload documents"}
                  </span>
                </div>
              );
            },
          }}
        />

        {isUploading && (
          <div className="ml-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 inline mr-1 animate-spin" />{" "}
            Uploading...
          </div>
        )}
      </div>
    </div>
  );
}
