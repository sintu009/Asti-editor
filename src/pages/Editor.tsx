
import { useState } from "react";
import Header from "@/components/Header";
import FileUploader from "@/components/FileUploader";
import PDFViewer from "@/components/PDFViewer";
import { loadPDF, PDFDocumentInfo } from "@/lib/pdf-utils";

const Editor = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfInfo, setPdfInfo] = useState<PDFDocumentInfo | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleFileSelected = async (file: File) => {
    try {
      setLoading(true);
      const info = await loadPDF(file);
      setPdfFile(file);
      setPdfInfo(info);
    } catch (error) {
      console.error("Error processing PDF:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseEditor = () => {
    setPdfFile(null);
    setPdfInfo(null);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header minimal={!!pdfFile} />
      
      <main className="flex-grow flex flex-col">
        {loading ? (
          <div className="flex-grow flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pdf-primary mb-4"></div>
              <p className="text-gray-600">Loading PDF...</p>
            </div>
          </div>
        ) : pdfFile && pdfInfo ? (
          <PDFViewer
            file={pdfFile}
            pdfInfo={pdfInfo}
            onClose={handleCloseEditor}
          />
        ) : (
          <div className="container py-12 max-w-xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">
              Upload a PDF to Start Editing
            </h1>
            
            <FileUploader onFileSelected={handleFileSelected} />
          </div>
        )}
      </main>
      
      {!pdfFile && (
        <div className="container py-8 max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              All Processing Happens in Your Browser
            </h3>
            <p className="text-gray-600">
              Your files never leave your computer. All the processing happens right in your browser for maximum privacy and security.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
