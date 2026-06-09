import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided.");
  }

  let extractedText = "";
  try {
    const arrayBuffer = await file.arrayBuffer();
    // @ts-ignore - TS may complain about the legacy build import
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    
    // Set standard worker options (optional for legacy node environment, but good practice)
    pdfjsLib.GlobalWorkerOptions.workerSrc = "pdfjs-dist/legacy/build/pdf.worker.mjs";

    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    
    for (let i = 1; i <= pdf.numPages; i++) {
      if (extractedText.length > 12000) break; // Hard cap on length
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      extractedText += pageText + "\n";
    }
    
    // Ensure it strictly does not exceed our character limit
    if (extractedText.length > 12000) {
      extractedText = extractedText.slice(0, 12000) + "\n...[TRUNCATED]";
    }
  } catch (error) {
    console.error("Failed to parse PDF:", error);
    throw new Error("Failed to parse PDF file.");
  }
  
  return NextResponse.json({
    message: extractedText,
  });
}