"use client";

import { useRef } from "react";
import { FaUpload, FaCheck, FaSpinner, FaTimes, FaEye } from "react-icons/fa";

const FileUpload = ({
  fileType,
  label,
  accept = "image/*,.pdf",
  required = true,
  onFileSelect,
  uploadState,
  onReset,
  className = "",
  disabled = false,
}) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    if (disabled) return;
    
    const file = event.target.files[0];
    if (file && onFileSelect) {
      onFileSelect(file, fileType);
    }
  };

  const handleReset = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onReset) {
      onReset(fileType);
    }
  };

  const openPreview = () => {
    if (uploadState.url) {
      window.open(uploadState.url, "_blank");
    }
  };

  const getStatusIcon = () => {
    if (uploadState.isUploading) {
      return <FaSpinner className="animate-spin text-blue-500" />;
    }
    if (uploadState.isSuccess) {
      return <FaCheck className="text-green-500" />;
    }
    if (uploadState.error) {
      return <FaTimes className="text-red-500" />;
    }
    return <FaUpload className="text-gray-400" />;
  };

  const getStatusColor = () => {
    if (disabled) {
      return "border-gray-200 bg-gray-100";
    }
    if (uploadState.isUploading) {
      return "border-blue-300 bg-blue-50";
    }
    if (uploadState.isSuccess) {
      return "border-green-300 bg-green-50";
    }
    if (uploadState.error) {
      return "border-red-300 bg-red-50";
    }
    return "border-gray-300 hover:border-gray-400";
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${getStatusColor()}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={uploadState.isUploading || disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className={`text-center ${disabled ? 'opacity-50' : ''}`}>
          <div className="mb-2 flex justify-center">
            {getStatusIcon()}
          </div>

          {disabled && (
            <p className="text-sm text-gray-500">
              Silakan isi nama lengkap terlebih dahulu
            </p>
          )}

          {uploadState.isUploading && (
            <div className="mb-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadState.progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Uploading... {uploadState.progress}%
              </p>
            </div>
          )}

          {uploadState.isSuccess && (
            <div className="space-y-2">
              <p className="text-sm text-green-600 font-medium">
                ✓ File berhasil diupload
              </p>
              <div className="flex justify-center space-x-2">
                <button
                  type="button"
                  onClick={openPreview}
                  className="inline-flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  <FaEye className="mr-1" />
                  Preview
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <FaTimes className="mr-1" />
                  Ganti
                </button>
              </div>
            </div>
          )}

          {uploadState.error && (
            <div className="space-y-2">
              <p className="text-sm text-red-600">
                ✗ {uploadState.error}
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {!uploadState.isUploading && !uploadState.isSuccess && !uploadState.error && !disabled && (
            <div>
              <p className="text-sm text-gray-600">
                Klik untuk upload file
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Maksimal 5MB (JPG, PNG, PDF)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
