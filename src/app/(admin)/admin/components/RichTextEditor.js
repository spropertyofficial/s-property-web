"use client";

import { useState, useEffect } from "react";
import { FaInfoCircle, FaBold, FaEye, FaEdit, FaColumns } from "react-icons/fa";
import SafeRichTextEditor from "./SafeRichTextEditor";
import { marked } from "marked";
import parse from "html-react-parser";

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Masukkan deskripsi...",
  maxLength = 1000,
  minLength = 50,
  label = "Deskripsi",
  required = false,
  error = "",
  showTemplate = true,
  templateData = {},
  className = "",
  showTips = true,
  height = 300,
  showPreview = true,
}) {
  const [charCount, setCharCount] = useState(0);
  const [previewMode, setPreviewMode] = useState("edit"); // "edit", "preview", "split"

  // Function to count characters in markdown content
  const getTextLength = (markdownContent) => {
    if (!markdownContent || typeof markdownContent !== 'string') return 0;
    // Remove markdown syntax untuk count karakter actual
    const cleanText = markdownContent
      .replace(/[#*_`\[\]()]/g, "") // Remove markdown syntax
      .replace(/\n/g, " ") // Replace newlines with spaces
      .trim();
    
    return cleanText.length;
  };

  // Update character count when value changes
  useEffect(() => {
    setCharCount(getTextLength(value));
  }, [value]);

  const handleContentChange = (content) => {
    try {
      const textLength = getTextLength(content || "");
      setCharCount(textLength);
      if (onChange) {
        onChange(content || "");
      }
    } catch (error) {
      console.warn("Error in handleContentChange:", error);
      // Fallback: tetap update content meskipun ada error
      if (onChange) {
        onChange(content || "");
      }
    }
  };

  // Generate markdown template
  const generateTemplate = () => {
    const {
      title = "Properti Premium",
      type = "Properti",
      location = "",
      developer = "",
      features = [],
      facilities = [],
    } = templateData;

    const defaultFeatures = [
      "Lokasi strategis dengan akses mudah",
      "Infrastruktur lengkap dan modern",
      "Lingkungan yang aman dan nyaman",
      "Potensi investasi yang menguntungkan",
    ];

    const defaultFacilities = [
      "Keamanan 24 jam",
      "Area parkir yang luas",
      "Fasilitas umum lengkap",
      "Akses transportasi mudah",
    ];

    const finalFeatures = features.length > 0 ? features : defaultFeatures;
    const finalFacilities =
      facilities.length > 0 ? facilities : defaultFacilities;

    return `### ${title} - ${type} Berkualitas

**${title}** adalah ${type.toLowerCase()} premium yang menawarkan kenyamanan dan kemudahan akses${
      location ? ` di **${location}**` : ""
    }. Properti ini dilengkapi dengan fasilitas lengkap dan desain yang modern.

#### ✨ Keunggulan Utama:
${finalFeatures.map((feature) => `- ${feature}`).join("\n")}

#### 🏠 Fasilitas & Amenitas:
${finalFacilities.map((facility) => `- ${facility}`).join("\n")}

${
  developer
    ? `
> *Dikembangkan oleh **${developer}** dengan standar kualitas tinggi dan komitmen terhadap kepuasan pelanggan.*
`
    : ""
}`;
  };

  const insertTemplate = () => {
    const template = generateTemplate();
    handleContentChange(template);
  };

  // Determine character count color
  const getCharCountColor = () => {
    if (charCount > maxLength) return "text-red-500";
    if (charCount > maxLength * 0.8) return "text-yellow-500";
    return "text-gray-500";
  };

  // Get validation feedback
  const getValidationFeedback = () => {
    if (error) return null;
    if (charCount === 0) return null;

    if (charCount < minLength) {
      return {
        type: "warning",
        message: `💡 Tambahkan ${minLength - charCount} karakter lagi untuk mencapai minimal ${minLength} karakter`,
      };
    } else if (charCount >= minLength && charCount < 200) {
      return {
        type: "success",
        message: `✅ Deskripsi sudah cukup baik (${charCount} karakter)`,
      };
    } else if (charCount >= 200) {
      return {
        type: "success",
        message: `✅ Deskripsi sangat detail dan informatif (${charCount} karakter)`,
      };
    }
  };

  const feedback = getValidationFeedback();
  const canShowTemplate = showTemplate && Object.keys(templateData).length > 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {!required && (
            <span className="text-gray-500 font-normal ml-1">(Opsional)</span>
          )}
        </label>
        <div className="flex items-center gap-3">
          <span className={`text-xs ${getCharCountColor()}`}>
            {charCount}/{maxLength} karakter
          </span>
          {/* Preview Mode Toggle */}
          {showPreview && value && (
            <div className="flex items-center border rounded-md">
              <button
                type="button"
                onClick={() => setPreviewMode("edit")}
                className={`px-2 py-1 text-xs rounded-l-md transition-colors ${
                  previewMode === "edit" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="Mode Edit"
              >
                <FaEdit size={10} />
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("preview")}
                className={`px-2 py-1 text-xs transition-colors ${
                  previewMode === "preview" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="Mode Preview"
              >
                <FaEye size={10} />
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("split")}
                className={`px-2 py-1 text-xs rounded-r-md transition-colors ${
                  previewMode === "split" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="Mode Split"
              >
                <FaColumns size={10} />
              </button>
            </div>
          )}
          {canShowTemplate && (
            <button
              type="button"
              onClick={insertTemplate}
              className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
            >
              📝 Gunakan Template
            </button>
          )}
        </div>
      </div>

      {/* Markdown Editor & Preview */}
      <div
        className={`rounded-lg border-2 overflow-hidden ${
          error
            ? "border-red-400"
            : "border-gray-300 hover:border-gray-400 focus-within:border-blue-500"
        }`}
      >
        {previewMode === "edit" && (
          <SafeRichTextEditor
            value={value}
            onChange={handleContentChange}
            placeholder={placeholder}
            height={height}
            className=""
          />
        )}
        {previewMode === "preview" && (
          <div className="p-4 bg-gray-50 min-h-[200px] text-gray-800 prose prose-blue max-w-none">
            {parse(marked(value || ""))}
          </div>
        )}
        {previewMode === "split" && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <SafeRichTextEditor
                value={value}
                onChange={handleContentChange}
                placeholder={placeholder}
                height={height}
                className=""
              />
            </div>
            <div className="p-4 bg-gray-50 min-h-[200px] text-gray-800 prose prose-blue max-w-none">
              {parse(marked(value || ""))}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm flex items-center">
          <span className="inline-block w-4 h-4 mr-1">⚠️</span>
          {error}
        </p>
      )}

      {/* Validation Feedback */}
      {feedback && (
        <div className="text-xs space-y-1">
          <p
            className={
              feedback.type === "success" ? "text-green-600" : "text-yellow-600"
            }
          >
            {feedback.message}
          </p>
        </div>
      )}
    </div>
  );
}
