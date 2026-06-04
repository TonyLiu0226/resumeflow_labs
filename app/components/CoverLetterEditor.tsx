"use client";

import { useState } from "react";

interface CoverLetterEditorProps {
  content: string;
}

export default function CoverLetterEditor({ content: initialContent }: CoverLetterEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const res = await fetch("/api/cover-letter/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error("Failed to generate PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cover_letter.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-clip flex flex-col h-full">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-3 border-b border-zinc-100 bg-zinc-50">
        <h3 className="text-sm font-semibold text-zinc-900">Cover Letter</h3>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-700 text-xs font-medium rounded-lg hover:bg-zinc-200 transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            {isDownloading ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="p-6 flex-1 h-full min-h-[400px]">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full min-h-[400px] resize-none border-none outline-none text-sm text-zinc-800 leading-relaxed focus:ring-0 whitespace-pre-wrap"
          placeholder="Start typing your cover letter here..."
        />
      </div>
    </div>
  );
}
