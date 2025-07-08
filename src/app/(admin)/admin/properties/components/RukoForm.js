"use client";

// Komponen ini hanya fokus pada field umum untuk Ruko
// Detail unit spesifik akan dikelola di halaman detail properti
export default function RukoForm({ form, handleChange, errors }) {
  return (
    <fieldset className="border p-6 rounded-md shadow-sm">
      <legend className="text-lg font-semibold px-2">
        Informasi Umum Ruko
      </legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        
        <div>
          <label htmlFor="totalUnits" className="block font-medium mb-1">
            Jumlah Unit Ruko <span className="text-red-500">*</span>
          </label>
          <input
            id="totalUnits"
            name="totalUnits"
            type="number"
            value={form.totalUnits || ""}
            onChange={handleChange}
            className={`input w-full px-3 py-2 border rounded-md ${
              errors.totalUnits ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Contoh: 10"
            min="1"
          />
          {errors.totalUnits && (
            <p className="text-red-500 text-sm mt-1">{errors.totalUnits}</p>
          )}
        </div>

        <div>
          <label htmlFor="yearBuilt" className="block font-medium mb-1">
            Tahun Dibangun <span className="text-red-500">*</span>
          </label>
          <input
            id="yearBuilt"
            name="yearBuilt"
            type="number"
            value={form.yearBuilt || ""}
            onChange={handleChange}
            className={`input w-full px-3 py-2 border rounded-md ${
              errors.yearBuilt ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Contoh: 2018"
            min="1900"
            max={new Date().getFullYear()}
          />
          {errors.yearBuilt && (
            <p className="text-red-500 text-sm mt-1">{errors.yearBuilt}</p>
          )}
        </div>

        <div>
          <label htmlFor="buildingCondition" className="block font-medium mb-1">
            Kondisi Bangunan <span className="text-red-500">*</span>
          </label>
          <select
            id="buildingCondition"
            name="buildingCondition"
            value={form.buildingCondition || ""}
            onChange={handleChange}
            className={`input w-full px-3 py-2 border rounded-md ${
              errors.buildingCondition ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">-- Pilih Kondisi --</option>
            <option value="Baru">Baru</option>
            <option value="Renovasi">Sudah Direnovasi</option>
            <option value="Terawat">Terawat</option>
            <option value="Butuh Renovasi">Butuh Renovasi</option>
            <option value="Rusak">Perlu Perbaikan</option>
          </select>
          {errors.buildingCondition && (
            <p className="text-red-500 text-sm mt-1">{errors.buildingCondition}</p>
          )}
        </div>

        <div>
          <label htmlFor="electricPower" className="block font-medium mb-1">
            Daya Listrik per Unit (Watt)
          </label>
          <select
            id="electricPower"
            name="electricPower"
            value={form.electricPower || ""}
            onChange={handleChange}
            className="input w-full px-3 py-2 border rounded-md border-gray-300"
          >
            <option value="">-- Pilih --</option>
            <option value="1300">1.300 Watt</option>
            <option value="2200">2.200 Watt</option>
            <option value="3500">3.500 Watt</option>
            <option value="4400">4.400 Watt</option>
            <option value="5500">5.500 Watt</option>
            <option value="7700">7.700 Watt</option>
            <option value="11000">11.000 Watt</option>
            <option value="13200">13.200 Watt</option>
            <option value="16500">16.500 Watt</option>
            <option value="23000">23.000+ Watt</option>
          </select>
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
            className={`input w-full px-3 py-2 border rounded-md ${
              errors.certificateStatus ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">-- Pilih Status --</option>
            <option value="SHM">SHM (Sertifikat Hak Milik)</option>
            <option value="HGB">HGB (Hak Guna Bangunan)</option>
            <option value="SHGB">SHGB (Sertifikat HGB)</option>
            <option value="Girik">Girik</option>
            <option value="Proses">Sedang Proses</option>
            <option value="Lainnya">Lainnya</option>
          </select>
          {errors.certificateStatus && (
            <p className="text-red-500 text-sm mt-1">{errors.certificateStatus}</p>
          )}
        </div>

        <div>
          <label htmlFor="accessRoad" className="block font-medium mb-1">
            Lebar Jalan Utama
          </label>
          <select
            id="accessRoad"
            name="accessRoad"
            value={form.accessRoad || ""}
            onChange={handleChange}
            className="input w-full px-3 py-2 border rounded-md border-gray-300"
          >
            <option value="">-- Pilih --</option>
            <option value="< 4m">Kurang dari 4 meter</option>
            <option value="4-6m">4-6 meter</option>
            <option value="6-8m">6-8 meter</option>
            <option value="8-12m">8-12 meter</option>
            <option value="> 12m">Lebih dari 12 meter</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="businessSuitability" className="block font-medium mb-1">
            Cocok untuk Jenis Usaha <span className="text-red-500">*</span>
          </label>
          <textarea
            id="businessSuitability"
            name="businessSuitability"
            value={form.businessSuitability || ""}
            onChange={handleChange}
            rows={2}
            className={`input w-full px-3 py-2 border rounded-md ${
              errors.businessSuitability ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Contoh: Restoran, retail, kantor, klinik, salon, minimarket, warung, dll."
          />
          {errors.businessSuitability && (
            <p className="text-red-500 text-sm mt-1">{errors.businessSuitability}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="commonFacilities" className="block font-medium mb-1">
            Fasilitas Umum Kompleks
          </label>
          <textarea
            id="commonFacilities"
            name="commonFacilities"
            value={form.commonFacilities || ""}
            onChange={handleChange}
            rows={2}
            className="input w-full px-3 py-2 border rounded-md border-gray-300"
            placeholder="Contoh: Keamanan 24 jam, area parkir umum, taman, masjid, dll."
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="locationAdvantage" className="block font-medium mb-1">
            Keunggulan Lokasi
          </label>
          <textarea
            id="locationAdvantage"
            name="locationAdvantage"
            value={form.locationAdvantage || ""}
            onChange={handleChange}
            rows={2}
            className="input w-full px-3 py-2 border rounded-md border-gray-300"
            placeholder="Contoh: Dekat mall, akses mudah ke jalan raya, dekat dengan perumahan, dll."
          />
        </div>

        <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <div className="text-blue-600 mt-0.5">💡</div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Informasi Unit Spesifik:</p>
              <p>Detail setiap unit ruko seperti ukuran tanah, luas bangunan, jumlah lantai, dan harga per unit akan dikelola di halaman detail properti setelah data ini disimpan.</p>
            </div>
          </div>
        </div>
      </div>
    </fieldset>
  );
}
