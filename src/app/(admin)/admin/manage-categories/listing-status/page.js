// src/app/admin/manage-categories/listing-status/page.jsx
"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaPlus, FaTrash, FaTimes, FaSave, FaEdit } from "react-icons/fa";

export default function ManageListingStatusPage() {
  const [listingStatus, setListingStatus] = useState([]);
  const [newTypeName, setNewTypeName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null); // Menyimpan ID item yang diedit
  const [editingName, setEditingName] = useState(""); // Menyimpan teks saat diedit

  // Fungsi untuk mengambil data
  const fetchListingStatus = async () => {
    try {
      const res = await fetch("/api/categories/listing-status");
      const data = await res.json();
      if (data.success) {
        setListingStatus(data.listingStatus);
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
    fetchListingStatus();
  }, []);

  // Handler untuk menambah tipe baru
  const handleAddType = async (e) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/categories/listing-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTypeName }),
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire("Berhasil!", data.message, "success");
        setNewTypeName("");
        fetchListingStatus(); // Muat ulang data
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
          const res = await fetch(`/api/categories/listing-status/${id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (data.success) {
            Swal.fire("Terhapus!", data.message, "success");
            fetchListingStatus(); // Muat ulang data
          } else {
            throw new Error(data.error);
          }
        } catch (error) {
          Swal.fire("Gagal", error.message, "error");
        }
      }
    });
  };

  // Handler untuk memulai mode edit
  const handleEditClick = (type) => {
    setEditingId(type._id);
    setEditingName(type.name);
  };

  // Handler untuk membatalkan edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  // Handler untuk menyimpan perubahan
  const handleUpdateType = async (id) => {
    if (!editingName.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/categories/listing-status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName }),
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire("Berhasil!", data.message, "success");
        handleCancelEdit(); // Keluar dari mode edit
        fetchListingStatus(); // Muat ulang data
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Manajemen Tipe Aset
      </h1>

      {/* Form Tambah Kategori */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
        <form onSubmit={handleAddType} className="flex items-center gap-4">
          <input
            type="text"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            placeholder="Contoh: Ruko"
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
      {/* Daftar Kategori dengan Fitur Edit */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <p className="p-4 text-center">Loading...</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {listingStatus.map((type) => (
              <li
                key={type._id}
                className="p-4 flex justify-between items-center gap-4"
              >
                {editingId === type._id ? (
                  // Tampilan saat mode EDIT
                  <>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-grow border border-blue-300 rounded-md px-3 py-1.5"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateType(type._id)}
                        disabled={isSubmitting}
                        className="text-green-600 hover:text-green-800"
                      >
                        <FaSave />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </>
                ) : (
                  // Tampilan mode normal
                  <>
                    <span className="text-gray-700">{type.name}</span>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleEditClick(type)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteType(type._id, type.name)}
                        className="text-red-500 hover:text-red-700"
                        title="Hapus"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
