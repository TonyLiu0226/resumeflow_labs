"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Point pdf.js at its own worker bundled in node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PdfPreviewProps {
  /** Blob URL (or any URL) of the PDF to render */
  url: string;
}

/**
 * Renders every page of a PDF to `<canvas>` elements — no browser PDF viewer UI.
 * Pages are stacked vertically, each scaled to fill the container width.
 */
export default function PdfPreview({ url }: PdfPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const canvases: HTMLCanvasElement[] = [];

    async function render() {
      const container = containerRef.current;
      if (!container) return;

      // Clear previous canvases
      container.innerHTML = "";
      setError(null);

      try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          if (cancelled) return;

          const canvas = document.createElement("canvas");
          canvases.push(canvas);
          canvas.className =
            "w-full rounded border border-zinc-200 shadow-sm bg-white mb-4 last:mb-0";

          // Render at 2× for sharpness, CSS scales it back down via w-full
          const containerWidth = container.clientWidth || 600;
          const scale = (containerWidth * 2) / page.getViewport({ scale: 1 }).width;
          const viewport = page.getViewport({ scale });

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          container.appendChild(canvas);

          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvasContext: ctx, viewport }).promise;
        }
      } catch (err) {
        if (!cancelled) {
          console.error("PDF render error:", err);
          setError("Failed to render PDF preview");
        }
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (error) {
    return (
      <p className="text-sm text-red-500 text-center py-4">{error}</p>
    );
  }

  return <div ref={containerRef} />;
}
