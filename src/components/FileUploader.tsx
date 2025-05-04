
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
}

const FileUploader = ({ 
  onFileSelected, 
  accept = ".pdf", 
  maxSize = 10 
}: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };
  
  const validateAndProcessFile = (file: File) => {
    // Check file type
    if (!file.type.includes("pdf")) {
      toast.error("Please upload a valid PDF file");
      return;
    }
    
    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSize) {
      toast.error(`File size exceeds ${maxSize}MB limit`);
      return;
    }
    
    // Process valid file
    onFileSelected(file);
    toast.success("File uploaded successfully");
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };
  
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div 
      className={cn(
        "drop-area",
        isDragging && "active"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center">
        <div className="mb-6 w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
          <Upload className="w-10 h-10 text-pdf-primary" />
        </div>
        
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          Upload your PDF file
        </h3>
        
        <p className="text-gray-500 mb-4 text-center">
          Drop your file here, or click to browse
        </p>
        
        <Button
          onClick={handleBrowseClick}
          className="bg-pdf-primary hover:bg-blue-700"
        >
          Choose File
        </Button>
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
        />
        
        <p className="text-xs text-gray-400 mt-4 text-center">
          Max file size: {maxSize}MB
        </p>
      </div>
    </div>
  );
};

export default FileUploader;
