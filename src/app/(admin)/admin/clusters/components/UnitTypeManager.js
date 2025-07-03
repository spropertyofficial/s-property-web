"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  FaBed,
  FaBath,
  FaRulerCombined,
  FaCar,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

// Komponen ini akan menampilkan daftar Tipe Unit untuk satu cluster
export default function UnitTypeManager({ clusterId, initialUnitTypes = [] }) {
  const router = useRouter();
  const [units, setUnits] = useState(initialUnitTypes);

  const handleDeleteUnit = async (unitId, unitName) => {
    Swal.fire({
      title: "Anda yakin?",
      text: `Tipe Unit "${unitName}" akan dihapus!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/units/${unitId}`, { method: "DELETE" });
          const data = await res.json();
          if (!res.ok)
            throw new Error(data.error || "Gagal menghapus Tipe Unit");
          Swal.fire("Terhapus!", data.message, "success");
          router.refresh(); // Refresh data di halaman detail cluster
        } catch (error) {
          Swal.fire("Gagal", error.message, "error");
        }
      }
    });
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Daftar Tipe Unit</h3>
        <Link
          href={`/admin/units/add?clusterId=${clusterId}`}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
        >
          + Tambah Tipe Unit
        </Link>
      </div>

      {units.length === 0 ? (
        <p className="text-gray-500 bg-gray-50 p-4 rounded-md">
          Belum ada Tipe Unit untuk cluster ini.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {units.map((unit) => (
            <div
              key={unit._id}
              className="bg-white border rounded-lg shadow-sm p-4 flex flex-col justify-between"
            >
              <div>
                <h4 className="font-bold text-lg text-gray-800">{unit.name}</h4>
                <p className="text-blue-600 font-semibold mb-3">
                  Rp {Number(unit.price || 0).toLocaleString("id-ID")}
                </p>
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <FaBed /> {unit.bedrooms} Kamar Tidur
                  </div>
                  <div className="flex items-center gap-2">
                    <FaBath /> {unit.bathrooms} Kamar Mandi
                  </div>
                  <div className="flex items-center gap-2">
                    <FaRulerCombined /> LT: {unit.landSize} m² | LB:{" "}
                    {unit.buildingSize} m²
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCar /> {unit.carport} Carport
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 border-t pt-3">
                <Link
                  href={`/admin/units/edit/${unit._id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDeleteUnit(unit._id, unit.name)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
