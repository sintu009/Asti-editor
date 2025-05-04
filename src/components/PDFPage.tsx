import { useRef, useEffect, useState } from "react";
import { PDFDocumentProxy } from "pdfjs-dist";
import { renderPageToCanvas } from "@/lib/pdf-utils";
import { TextOptions } from "./TextEditor";

interface PDFPageProps {
  pdfDocument: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  textElements: PDFTextElement[];
  imageElements: PDFImageElement[];
  onElementClick: (id: string) => void;
  onTextElementsChange?: (elements: PDFTextElement[]) => void;
  onImageElementsChange?: (elements: PDFImageElement[]) => void;
}

export interface PDFTextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  options: TextOptions;
}

export interface PDFImageElement {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const PDFPage = ({
  pdfDocument,
  pageNumber,
  scale,
  textElements,
  imageElements,
  onElementClick,
  onTextElementsChange,
  onImageElementsChange,
}: PDFPageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  const [resizingElement, setResizingElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const renderPage = async () => {
      if (!canvasRef.current || !pdfDocument) return;

      try {
        const page = await pdfDocument.getPage(pageNumber);
        const viewport = page.getViewport({ scale });

        setDimensions({
          width: viewport.width,
          height: viewport.height,
        });

        await renderPageToCanvas(
          canvasRef.current,
          pdfDocument,
          pageNumber,
          scale
        );
      } catch (error) {
        console.error(`Error rendering page ${pageNumber}:`, error);
      }
    };

    renderPage();
  }, [pdfDocument, pageNumber, scale]);

  const handleMouseDown = (
    e: React.MouseEvent,
    elementId: string,
    isResize = false
  ) => {
    e.stopPropagation();

    if (isResize) {
      const element = imageElements.find((elem) => elem.id === elementId);
      if (element) {
        setResizingElement(elementId);
        setResizeStart({
          x: e.clientX,
          y: e.clientY,
          width: element.width,
          height: element.height,
        });
      }
    } else {
      const element = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - element.left,
        y: e.clientY - element.top,
      });
      setDraggingElement(elementId);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();

    if (draggingElement) {
      e.preventDefault();
      const newX = e.clientX - containerRect.left - dragOffset.x;
      const newY = e.clientY - containerRect.top - dragOffset.y;

      const isText = textElements.some((elem) => elem.id === draggingElement);

      if (isText) {
        const updatedElements = textElements.map((elem) =>
          elem.id === draggingElement ? { ...elem, x: newX, y: newY } : elem
        );
        onTextElementsChange?.(updatedElements);
      } else {
        const updatedElements = imageElements.map((elem) =>
          elem.id === draggingElement ? { ...elem, x: newX, y: newY } : elem
        );
        onImageElementsChange?.(updatedElements);
      }
    } else if (resizingElement) {
      e.preventDefault();

      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      let newWidth = resizeStart.width + deltaX;
      let newHeight = resizeStart.height + deltaY;

      if (e.shiftKey) {
        const aspectRatio = resizeStart.width / resizeStart.height;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = newHeight * aspectRatio;
        }
      }

      newWidth = Math.max(10, newWidth);
      newHeight = Math.max(10, newHeight);

      const updatedElements = imageElements.map((elem) =>
        elem.id === resizingElement
          ? { ...elem, width: newWidth, height: newHeight }
          : elem
      );

      onImageElementsChange?.(updatedElements);
    }
  };

  const handleMouseUp = () => {
    setDraggingElement(null);
    setResizingElement(null);
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: dimensions.width,
        height: dimensions.height,
      }}
      onMouseMove={handleMouseMove}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
      />

      {textElements.map((element) => (
        <div
          key={element.id}
          onMouseDown={(e) => handleMouseDown(e, element.id)}
          onClick={() => onElementClick(element.id)}
          style={{
            position: "absolute",
            left: element.x,
            top: element.y,
            cursor: "move",
            fontSize: element.options.fontSize,
            color: element.options.color,
            fontWeight: element.options.bold ? "bold" : "normal",
            fontStyle: element.options.italic ? "italic" : "normal",
            textDecoration: element.options.underline ? "underline" : "none",
          }}
        >
          {element.text}
        </div>
      ))}

      {imageElements.map((element) => (
        <div
          key={element.id}
          style={{
            position: "absolute",
            left: element.x,
            top: element.y,
            width: element.width,
            height: element.height,
            cursor: "move",
            userSelect: "none",
          }}
          onMouseDown={(e) => handleMouseDown(e, element.id)}
          onClick={() => onElementClick(element.id)}
        >
          <img
            src={element.src}
            style={{ width: "100%", height: "100%", display: "block" }}
            draggable={false}
            alt=""
          />
          {/* Resize handle in bottom-right corner */}
          <div
            onMouseDown={(e) => handleMouseDown(e, element.id, true)}
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: 10,
              height: 10,
              backgroundColor: "blue",
              cursor: "nwse-resize",
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default PDFPage;
