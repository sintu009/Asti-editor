import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Trash,
  Image as ImageIcon,
  Pencil,
  Layers,
  File,
  ZoomIn,
  ZoomOut,
  Loader2,
} from "lucide-react";
import * as pdfjs from "pdfjs-dist";
import { PDFDocumentProxy } from "pdfjs-dist";
import { PDFDocumentInfo, generateEditedPDF } from "@/lib/pdf-utils";
import PDFPage, { PDFTextElement, PDFImageElement } from "./PDFPage";
import TextEditor from "./TextEditor";
import ImageUploader from "./ImageUploader";
import { v4 as uuidv4 } from "uuid";

interface PDFViewerProps {
  file: File;
  pdfInfo: PDFDocumentInfo;
  onClose: () => void;
}

type EditingMode = "view" | "text" | "image";

const PDFViewer = ({ file, pdfInfo, onClose }: PDFViewerProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMode, setEditingMode] = useState<EditingMode>("view");
  const [textElements, setTextElements] = useState<PDFTextElement[]>([]);
  const [imageElements, setImageElements] = useState<PDFImageElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null
  );
  const [editorPosition, setEditorPosition] = useState({ x: 100, y: 100 });
  const [isDownloading, setIsDownloading] = useState(false);

  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPdfDocument = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const document = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        setPdfDocument(document);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading PDF document:", error);
        toast.error("Failed to load PDF. Please try again.");
      }
    };

    loadPdfDocument();

    return () => {
      if (pdfDocument) {
        pdfDocument.destroy();
      }
    };
  }, [file]);

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < pdfInfo.pageCount) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    // Prevent default behavior to avoid page navigation/refresh
    e.preventDefault();

    try {
      setIsDownloading(true);

      // Generate a new PDF with all edits
      const editedPdfBlob = await generateEditedPDF(
        file,
        textElements,
        imageElements
      );

      // Create a download link for the edited PDF
      const downloadUrl = URL.createObjectURL(editedPdfBlob);

      // Use the download attribute for clean downloads without page navigation
      const link = document.createElement("a");
      link.href = downloadUrl;

      // Use original filename but add "-edited" suffix
      const fileName = file.name.replace(/\.pdf$/i, "-edited.pdf");
      link.download = fileName;
      link.target = "_blank"; // Open in new tab

      // Properly handle the download to avoid page refreshes
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        // Clean up after a delay to ensure download starts
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
      }, 100);

      toast.success("Edited PDF downloaded successfully!");
    } catch (error) {
      console.error("Error downloading edited PDF:", error);
      toast.error("Failed to download edited PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleViewerClick = (e: React.MouseEvent) => {
    // Only handle clicks when in text or image mode
    if (editingMode === "view") return;

    if (viewerRef.current) {
      const rect = viewerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setEditorPosition({ x, y });

      // If in text mode, we'll open the text editor
      if (editingMode === "text") {
        setSelectedElementId(null); // New text
      }
    }
  };

  const handleAddText = (text: string, options: any) => {
    if (selectedElementId) {
      // Edit existing text element
      setTextElements((prev) =>
        prev.map((element) =>
          element.id === selectedElementId
            ? { ...element, text, options }
            : element
        )
      );
    } else {
      // Add new text element
      const newTextElement: PDFTextElement = {
        id: uuidv4(),
        page: currentPage,
        x: editorPosition.x,
        y: editorPosition.y,
        text,
        options,
      };
      setTextElements((prev) => [...prev, newTextElement]);
    }
  };

  const handleAddImage = (imageUrl: string) => {
    setImageElements((prev) => [
      ...prev,
      {
        id: uuidv4(),
        src: imageUrl,
        x: editorPosition.x,
        y: editorPosition.y,
        width: 200,
        height: 200,
      },
    ]);

    setEditingMode("view");
  };

  const handleElementClick = (id: string) => {
    setSelectedElementId(id);

    // Find the element type
    const textElement = textElements.find((elem) => elem.id === id);
    if (textElement) {
      setEditingMode("text");
      return;
    }

    const imageElement = imageElements.find((elem) => elem.id === id);
    if (imageElement) {
      // For images, we might want additional options like resize
      // For now, we'll just select it
      return;
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedElementId) return;

    setTextElements((prev) =>
      prev.filter((elem) => elem.id !== selectedElementId)
    );
    setImageElements((prev) =>
      prev.filter((elem) => elem.id !== selectedElementId)
    );

    setSelectedElementId(null);
    toast.success("Element deleted");
  };

  const cancelEditing = () => {
    setEditingMode("view");
    setSelectedElementId(null);
  };

  const handleTextElementsChange = (updatedElements: PDFTextElement[]) => {
    setTextElements(updatedElements);
  };

  const handleImageElementsChange = (updatedElements: PDFImageElement[]) => {
    setImageElements(updatedElements);
  };

  const selectedTextElement = textElements.find(
    (elem) => elem.id === selectedElementId
  );

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={onClose}
            title="Back to upload"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <span className="font-medium">{pdfInfo.title || "Document"}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <span className="text-sm w-16 text-center">
            {Math.round(scale * 100)}%
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            disabled={scale >= 3.0}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-1" />
                Download
              </>
            )}
          </Button>

          {selectedElementId && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
            >
              <Trash className="w-4 h-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-16 bg-gray-100 border-r border-gray-200 flex flex-col items-center py-4">
          <Button
            variant={editingMode === "text" ? "default" : "ghost"}
            size="icon"
            className="mb-4"
            title="Add Text"
            onClick={() =>
              setEditingMode((prev) => (prev === "text" ? "view" : "text"))
            }
          >
            <Pencil className="w-5 h-5" />
          </Button>

          <Button
            variant={editingMode === "image" ? "default" : "ghost"}
            size="icon"
            className="mb-4"
            title="Add Image"
            onClick={() =>
              setEditingMode((prev) => (prev === "image" ? "view" : "image"))
            }
          >
            <ImageIcon className="w-5 h-5" />
          </Button>

          <Button variant="ghost" size="icon" className="mb-4" title="Layers">
            <Layers className="w-5 h-5" />
          </Button>

          <Button variant="ghost" size="icon" className="mb-4" title="Add Page">
            <File className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-red-600 mt-auto"
            title="Delete"
          >
            <Trash className="w-5 h-5" />
          </Button>
        </div>

        <div
          ref={viewerRef}
          className="flex-1 overflow-auto flex flex-col items-center p-8 bg-gray-50"
          onClick={handleViewerClick}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pdf-primary"></div>
            </div>
          ) : (
            <>
              {pdfDocument && (
                <PDFPage
                  pdfDocument={pdfDocument}
                  pageNumber={currentPage}
                  scale={scale}
                  textElements={textElements.filter((elem) => true)} // Filter by current page in a real app
                  imageElements={imageElements.filter((elem) => true)} // Filter by current page in a real app
                  onElementClick={handleElementClick}
                  onTextElementsChange={handleTextElementsChange}
                  onImageElementsChange={handleImageElementsChange}
                />
              )}

              <div className="flex items-center gap-4 mt-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousPage}
                  disabled={currentPage <= 1}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>

                <span className="text-sm">
                  Page {currentPage} of {pdfInfo.pageCount}
                </span>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextPage}
                  disabled={currentPage >= pdfInfo.pageCount}
                >
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </>
          )}

          {editingMode === "text" && (
            <div
              style={{
                position: "absolute",
                left: editorPosition.x,
                top: editorPosition.y,
                zIndex: 100,
              }}
            >
              <TextEditor
                onAddText={handleAddText}
                onCancel={cancelEditing}
                initialText={selectedTextElement?.text}
                initialOptions={selectedTextElement?.options}
              />
            </div>
          )}

          {editingMode === "image" && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 100,
              }}
            >
              <ImageUploader
                onImageSelected={handleAddImage}
                onCancel={cancelEditing}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
