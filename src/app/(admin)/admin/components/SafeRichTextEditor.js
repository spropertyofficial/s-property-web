"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";

// Safe MDEditor wrapper dengan error handling
const SafeMDEditor = dynamic(
  () => import("./SafeMDEditorComponent"),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 bg-gray-100 animate-pulse rounded flex items-center justify-center">
        <span className="text-gray-500">Loading editor...</span>
      </div>
    ),
  }
);

export default function SafeRichTextEditor({
  value = "",
  onChange,
  placeholder = "Masukkan deskripsi...",
  height = 300,
  className = "",
}) {
  const [editorValue, setEditorValue] = useState(value);
  const [hasError, setHasError] = useState(false);

  // Sync external value changes
  useEffect(() => {
    setEditorValue(value || "");
  }, [value]);

  const handleChange = useCallback((newValue) => {
    try {
      // Ensure value is string and handle undefined/null
      const safeValue = typeof newValue === 'string' ? newValue : (newValue || "");
      setEditorValue(safeValue);
      if (onChange) {
        onChange(safeValue);
      }
      setHasError(false);
    } catch (error) {
      console.warn("Error in SafeRichTextEditor onChange:", error);
      setHasError(true);
    }
  }, [onChange]);

  if (hasError) {
    return (
      <div className={`${className}`}>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800 text-sm mb-2">
            ⚠️ Rich text editor mengalami masalah, menggunakan mode sederhana:
          </p>
          <textarea
            value={editorValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-2 border border-gray-300 rounded resize-none"
            style={{ height }}
          />
          <button
            type="button"
            onClick={() => setHasError(false)}
            className="mt-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
          >
            🔄 Coba Rich Editor Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <SafeMDEditor
        value={editorValue}
        onChange={handleChange}
        placeholder={placeholder}
        height={height}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
