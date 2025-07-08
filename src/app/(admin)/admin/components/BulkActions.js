"use client";

import { useState } from "react";
import { FaCheck, FaTrash, FaEdit, FaDownload, FaFileExport } from "react-icons/fa";
import Swal from "sweetalert2";

export default function BulkActions({ selectedItems, onBulkDelete, onBulkStatusChange, onExport }) {
  const [showActions, setShowActions] = useState(false);

  if (selectedItems.length === 0) return null;

  const handleBulkDelete = async () => {
    const result = await Swal.fire({
      title: "Konfirmasi Hapus Massal",
      html: `Apakah Anda yakin ingin menghapus <strong>${selectedItems.length}</strong> properti yang dipilih?<br><small class="text-gray-500">Tindakan ini tidak dapat dibatalkan</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus Semua!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await onBulkDelete(selectedItems);
        if (typeof window !== 'undefined' && window.showNotification) {
          window.showNotification(`${selectedItems.length} properti berhasil dihapus`, "success");
        }
      } catch (error) {
        if (typeof window !== 'undefined' && window.showNotification) {
          window.showNotification("Gagal menghapus properti", "error");
        }
      }
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    const result = await Swal.fire({
      title: "Konfirmasi Ubah Status",
      html: `Ubah status <strong>${selectedItems.length}</strong> properti menjadi <strong>"${newStatus}"</strong>?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Ubah!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await onBulkStatusChange(selectedItems, newStatus);
        if (typeof window !== 'undefined' && window.showNotification) {
          window.showNotification(`Status ${selectedItems.length} properti berhasil diubah`, "success");
        }
      } catch (error) {
        if (typeof window !== 'undefined' && window.showNotification) {
          window.showNotification("Gagal mengubah status properti", "error");
        }
      }
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FaCheck className="text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              {selectedItems.length} item dipilih
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaEdit />
                Ubah Status
              </button>
              
              {showActions && (
                <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[150px]">
                  <button
                    onClick={() => {
                      handleBulkStatusChange("Dijual");
                      setShowActions(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Dijual
                  </button>
                  <button
                    onClick={() => {
                      handleBulkStatusChange("Disewakan");
                      setShowActions(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Disewakan
                  </button>
                  <button
                    onClick={() => {
                      handleBulkStatusChange("Terjual Habis");
                      setShowActions(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Terjual Habis
                  </button>
                  <button
                    onClick={() => {
                      handleBulkStatusChange("Segera Hadir");
                      setShowActions(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Segera Hadir
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={() => onExport(selectedItems)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaFileExport />
              Export
            </button>
            
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaTrash />
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
