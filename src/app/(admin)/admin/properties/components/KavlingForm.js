"use client";

// Komponen ini hanya fokus pada field untuk Kavling/Tanah
export default function KavlingForm({ form, handleChange, errors }) {
  return (
    <fieldset className="border p-6 rounded-md shadow-sm">
      <legend className="text-lg font-semibold px-2">
        Spesifikasi Tanah/Kavling
      </legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        <div>
          <label htmlFor="landSize" className="block font-medium mb-1">
            Luas Tanah (m²) <span className="text-red-500">*</span>
          </label>
          <input
            id="landSize"
            name="landSize"
            type="number"
            value={form.landSize || ""}
            onChange={handleChange}
            className="input w-full px-3 py-2 border rounded-md"
          />
          {/* Tampilkan error jika ada */}
        </div>

        <div>
          <label htmlFor="pricePerSqM" className="block font-medium mb-1">
            Harga per m² (Opsional)
          </label>
          <input
            id="pricePerSqM"
            name="pricePerSqM"
            type="number"
            value={form.pricePerSqM || ""}
            onChange={handleChange}
            className="input w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="flex gap-4">
          <div>
            <label htmlFor="landLength" className="block font-medium mb-1">
              Panjang (m)
            </label>
            <input
              id="landLength"
              name="landLength"
              type="number"
              value={form.landLength || ""}
              onChange={handleChange}
              className="input w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label htmlFor="landWidth" className="block font-medium mb-1">
              Lebar (m)
            </label>
            <input
              id="landWidth"
              name="landWidth"
              type="number"
              value={form.landWidth || ""}
              onChange={handleChange}
              className="input w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div>
          <label htmlFor="certificateStatus" className="block font-medium mb-1">
            Status Sertifikat <span className="text-red-500">*</span>
          </label>
          <select
            id="certificateStatus"
            name="certificateStatus"
            value={form.certificateStatus || ""}
            onChange={handleChange}
            className="input w-full px-3 py-2 border rounded-md"
          >
            <option value="">-- Pilih Status --</option>
            <option value="SHM">SHM</option>
            <option value="HGB">HGB</option>
            <option value="Girik">Girik</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
      </div>
    </fieldset>
  );
}
