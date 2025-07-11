"use client";

import { useState, useCallback } from "react";
import Swal from "sweetalert2";

export const useFileUpload = () => {
  const [uploadStates, setUploadStates] = useState({});

  const updateUploadState = useCallback((fileType, state) => {
    setUploadStates(prev => ({
      ...prev,
      [fileType]: { ...prev[fileType], ...state }
    }));
  }, []);

  const uploadFile = useCallback(async (file, fileType, options = {}) => {
    if (!file) {
      throw new Error("No file provided");
    }

    const { applicantName = "unknown", registrationId = Date.now().toString() } = options;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Ukuran file maksimal 5MB");
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Format file tidak didukung. Gunakan JPG, PNG, atau PDF");
    }

    try {
      // Set uploading state
      updateUploadState(fileType, {
        isUploading: true,
        progress: 0,
        error: null,
        url: null,
        publicId: null,
      });

      // Create FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileType", fileType);
      formData.append("applicantName", applicantName);
      formData.append("registrationId", registrationId);

      // Upload file
      const response = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Upload failed");
      }

      // Set success state
      updateUploadState(fileType, {
        isUploading: false,
        progress: 100,
        error: null,
        url: result.data.url,
        publicId: result.data.publicId,
        isSuccess: true,
      });

      return result.data;

    } catch (error) {
      // Set error state
      updateUploadState(fileType, {
        isUploading: false,
        progress: 0,
        error: error.message,
        url: null,
        publicId: null,
        isSuccess: false,
      });

      throw error;
    }
  }, [updateUploadState]);

  const resetUploadState = useCallback((fileType) => {
    updateUploadState(fileType, {
      isUploading: false,
      progress: 0,
      error: null,
      url: null,
      publicId: null,
      isSuccess: false,
    });
  }, [updateUploadState]);

  const getUploadState = useCallback((fileType) => {
    return uploadStates[fileType] || {
      isUploading: false,
      progress: 0,
      error: null,
      url: null,
      publicId: null,
      isSuccess: false,
    };
  }, [uploadStates]);

  return {
    uploadFile,
    getUploadState,
    resetUploadState,
    uploadStates,
  };
};
