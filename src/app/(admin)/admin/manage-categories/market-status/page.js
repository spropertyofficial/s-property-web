// src/app/admin/manage-categories/market-status/page.jsx
"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaPlus, FaTrash } from "react-icons/fa";

export default function ManageMarketStatusPage() {
  const [marketStatus, setMarketStatus] = useState([]);
  const [newTypeName, setNewTypeName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi untuk mengambil data
  const fetchMarketStatus = async () => {
    try {
      const res = await fetch("/api/categories/market-status");
      const data = await res.json();
      if (data.success) {
        setMarketStatus(data.marketStatus);
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal mengambil data Tipe Aset", "error");
    } finally {
      setLoading(false);
    }
  };

  // Ambil data saat komponen pertama kali dimuat
  useEffect(() => {
    fetchMarketStatus();
  }, []);

  // Handler untuk menambah tipe baru
  const handleAddType = async (e) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/categories/market-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTypeName }),
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire("Berhasil!", data.message, "success");
        setNewTypeName("");
        fetchMarketStatus(); // Muat ulang data
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler untuk menghapus tipe
  const handleDeleteType = async (id, name) => {
    Swal.fire({
      title: "Anda yakin?",
      text: `Tipe Aset "${name}" akan dihapus permanen!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/categories/market-status/${id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (data.success) {
            Swal.fire("Terhapus!", data.message, "success");
            fetchMarketStatus(); // Muat ulang data
          } else {
            throw new Error(data.error);
          }
        } catch (error) {
          Swal.fire("Gagal", error.message, "error");
        }
      }
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Manajemen Status Pasar
      </h1>

      {/* Form Tambah Kategori */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
        <form onSubmit={handleAddType} className="flex items-center gap-4">
          <input
            type="text"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            placeholder="Contoh: Primary"
            className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2"
          >
            <FaPlus size={12} /> {isSubmitting ? "Menyimpan..." : "Tambah"}
          </button>
        </form>
      </div>

      {/* Daftar Kategori */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <p className="p-4 text-center">Loading...</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {marketStatus.map((type) => (
              <li
                key={type._id}
                className="p-4 flex justify-between items-center"
              >
                <span className="text-gray-700">{type.name}</span>
                <button
                  onClick={() => handleDeleteType(type._id, type.name)}
                  className="text-red-500 hover:text-red-700"
                  title="Hapus"
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
