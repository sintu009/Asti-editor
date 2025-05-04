
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Image, Trash, Upload } from "lucide-react";
import { toast } from "sonner";
import { removeImageBackground, fileToBase64, initializeModel } from "@/lib/image-utils";

interface ImageUploaderProps {
  onImageSelected: (imageUrl: string) => void;
  onCancel: () => void;
}

const ImageUploader = ({ onImageSelected, onCancel }: ImageUploaderProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [isModelInitializing, setIsModelInitializing] = useState(false);
  
  // Initialize model when component loads
  useState(() => {
    const initModel = async () => {
      try {
        setIsModelInitializing(true);
        await initializeModel();
      } catch (error) {
        console.error("Error pre-initializing background removal model:", error);
      } finally {
        setIsModelInitializing(false);
      }
    };
    
    // Initialize the model asynchronously
    initModel();
  });
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should be less than 5MB");
      return;
    }
    
    setSelectedImage(file);
    
    try {
      // Convert to base64 for preview
      const base64 = await fileToBase64(file);
      setPreviewUrl(base64);
      setIsProcessed(false);
    } catch (error) {
      console.error("Error creating preview:", error);
      toast.error("Failed to load image preview");
    }
  };
  
  const handleRemoveBackground = async () => {
    if (!selectedImage) return;
    
    try {
      setIsRemoving(true);
      setIsProcessed(false);
      const imageWithoutBg = await removeImageBackground(selectedImage);
      setPreviewUrl(imageWithoutBg);
      setIsProcessed(true);
    } catch (error) {
      console.error("Error removing background:", error);
      toast.error("Failed to remove background. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  };
  
  const handleInsert = () => {
    if (previewUrl) {
      onImageSelected(previewUrl);
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-md shadow-md border border-gray-200 max-w-md w-full">
      <h3 className="text-lg font-medium mb-3">Add Image</h3>
      
      {previewUrl ? (
        <div className="mb-4">
          <div className="relative border rounded-md overflow-hidden" style={{ minHeight: "200px" }}>
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-auto object-contain"
              style={{ maxHeight: "300px" }}
            />
            <Button 
              variant="destructive" 
              size="icon"
              className="absolute top-2 right-2 bg-white bg-opacity-70 text-red-500 hover:bg-white hover:bg-opacity-100"
              onClick={() => {
                setSelectedImage(null);
                setPreviewUrl(null);
                setIsProcessed(false);
                if (previewUrl.startsWith('blob:')) {
                  URL.revokeObjectURL(previewUrl);
                }
              }}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-4 border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center cursor-pointer"
             onClick={() => document.getElementById('image-input')?.click()}>
          <Image className="w-10 h-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 mb-1">Click to upload an image</p>
          <p className="text-xs text-gray-400">JPG, PNG, GIF up to 5MB</p>
          <input 
            id="image-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
      
      {previewUrl && (
        <div className="flex gap-2 mb-4">
          <Button
            variant={isProcessed ? "secondary" : "outline"}
            className="flex-1"
            onClick={handleRemoveBackground}
            disabled={isRemoving || isModelInitializing}
          >
            {isRemoving 
              ? "Removing..." 
              : isModelInitializing 
                ? "Initializing AI..." 
                : isProcessed 
                  ? "Background Removed" 
                  : "Remove Background"
            }
          </Button>
          
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              document.getElementById('image-input')?.click();
            }}
          >
            <Upload className="w-4 h-4 mr-1" />
            Change
          </Button>
        </div>
      )}
      
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          size="sm" 
          onClick={handleInsert} 
          disabled={!previewUrl}
        >
          Insert Image
        </Button>
      </div>
    </div>
  );
};

export default ImageUploader;
