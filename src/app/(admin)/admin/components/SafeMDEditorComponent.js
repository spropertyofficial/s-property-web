"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Import MDEditor with error handling
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
});

export default function SafeMDEditorComponent({ 
  value, 
  onChange, 
  placeholder, 
  height, 
  onError 
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleChange = (val) => {
    try {
      // Ensure the value is properly handled
      const safeValue = val === undefined || val === null ? "" : String(val);
      onChange(safeValue);
    } catch (error) {
      console.warn("MDEditor onChange error:", error);
      onError && onError();
    }
  };

  if (!isMounted) {
    return (
      <div className="h-40 bg-gray-100 animate-pulse rounded flex items-center justify-center">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  try {
    return (
      <MDEditor
        value={value || ""}
        onChange={handleChange}
        height={height}
        data-color-mode="light"
        preview="edit"
        hideToolbar={false}
        visibleDragBar={false}
        textareaProps={{
          placeholder,
          spellCheck: false,
          style: { fontSize: 14 },
          onKeyDown: (e) => {
            // Prevent problematic shortcuts
            if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
              // Disable complex shortcuts that might cause issues
              e.preventDefault();
              return;
            }
          }
        }}
        // Minimal configuration to reduce error surface
        commands={[]} // Remove all commands to avoid shortcut conflicts
        extraCommands={[]}
      />
    );
  } catch (error) {
    console.warn("MDEditor render error:", error);
    onError && onError();
    return (
      <textarea
        value={value || ""}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-md resize-none"
        style={{ height }}
      />
    );
  }
}
