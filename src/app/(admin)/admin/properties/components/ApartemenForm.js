"use client";

// Komponen ini hanya fokus pada field untuk Apartemen
export default function ApartemenForm({ form, handleChange, errors }) {
  return (
    <fieldset className="border p-6 rounded-md shadow-sm">
      <legend className="text-lg font-semibold px-2">
        Spesifikasi Apartemen
      </legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        <div>
          <label htmlFor="buildingSize" className="block font-medium mb-1">
            Luas Bangunan (m²) <span className="text-red-500">*</span>
          </label>
          <input
            id="buildingSize"
            name="buildingSize"
            type="number"
            value={form.buildingSize || ""}
            onChange={handleChange}
            className={`input w-full px-3 py-2 border rounded-md ${
              errors.buildingSize ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.buildingSize && (
            <p className="text-red-500 text-sm mt-1">{errors.buildingSize}</p>
          )}
        </div>

        <div>
          <label htmlFor="unitFloor" className="block font-medium mb-1">
            Lantai Unit <span className="text-red-500">*</span>
          </label>
          <input
            id="unitFloor"
            name="unitFloor"
            type="number"
            value={form.unitFloor || ""}
            onChange={handleChange}
            className={`input w-full px-3 py-2 border rounded-md ${
              errors.unitFloor ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Contoh: 5"
          />
          {errors.unitFloor && (
            <p className="text-red-500 text-sm mt-1">{errors.unitFloor}</p>
          )}
        </div>

        <div>
          <label htmlFor="bedrooms" className="block font-medium mb-1">
            Jumlah Kamar Tidur <span className="text-red-500">*</span>
          </label>
          <select
            id="bedrooms"
            name="bedrooms"
            value={form.bedrooms || ""}
            onChange={handleChange}
            className={`input w-full px-3 py-2 border rounded-md ${
              errors.bedrooms ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">-- Pilih Jumlah --</option>
            <option value="Studio">Studio</option>
            <option value="1">1 Kamar</option>
            <option value="2">2 Kamar</option>
            <option value="3">3 Kamar</option>
            <option value="4">4+ Kamar</option>
          </select>
          {errors.bedrooms && (
            <p className="text-red-500 text-sm mt-1">{errors.bedrooms}</p>
          )}
        </div>

        <div>
          <label htmlFor="bathrooms" className="block font-medium mb-1">
            Jumlah Kamar Mandi <span className="text-red-500">*</span>
          </label>
          <select
            id="bathrooms"
            name="bathrooms"
            value={form.bathrooms || ""}
            onChange={handleChange}
            className={`input w-full px-3 py-2 border rounded-md ${
              errors.bathrooms ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">-- Pilih Jumlah --</option>
            <option value="1">1 Kamar Mandi</option>
            <option value="2">2 Kamar Mandi</option>
            <option value="3">3 Kamar Mandi</option>
            <option value="4">4+ Kamar Mandi</option>
          </select>
          {errors.bathrooms && (
            <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>
          )}
        </div>

        <div>
          <label htmlFor="carport" className="block font-medium mb-1">
            Parkir Mobil
          </label>
          <select
            id="carport"
            name="carport"
            value={form.carport || ""}
            onChange={handleChange}
            className="input w-full px-3 py-2 border rounded-md border-gray-300"
          >
            <option value="">-- Pilih --</option>
            <option value="0">Tidak Ada</option>
            <option value="1">1 Mobil</option>
            <option value="2">2 Mobil</option>
            <option value="3">3+ Mobil</option>
          </select>
        </div>

        <div>
          <label htmlFor="furnishing" className="block font-medium mb-1">
            Kondisi Furnishing <span className="text-red-500">*</span>
          </label>
          <select
            id="furnishing"
            name="furnishing"
            value={form.furnishing || ""}
            onChange={handleChange}
            className={`input w-full px-3 py-2 border rounded-md ${
              errors.furnishing ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">-- Pilih Kondisi --</option>
            <option value="Unfurnished">Unfurnished</option>
            <option value="Semi Furnished">Semi Furnished</option>
            <option value="Fully Furnished">Fully Furnished</option>
          </select>
          {errors.furnishing && (
            <p className="text-red-500 text-sm mt-1">{errors.furnishing}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="facilities" className="block font-medium mb-1">
            Fasilitas Gedung
          </label>
          <textarea
            id="facilities"
            name="facilities"
            value={form.facilities || ""}
            onChange={handleChange}
            rows={3}
            className="input w-full px-3 py-2 border rounded-md border-gray-300"
            placeholder="Contoh: Kolam renang, gym, playground, keamanan 24 jam, dll."
          />
        </div>
      </div>
    </fieldset>
  );
}
