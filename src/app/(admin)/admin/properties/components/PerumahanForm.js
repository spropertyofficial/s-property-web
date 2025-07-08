"use client";
const PerumahanForm = ({ form, errors, handleChange }) => {
  return (
    <fieldset className="border p-6 rounded-md shadow-sm">
      <legend className="text-lg font-semibold px-2">Detail Lokasi</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div>
          <label className="block font-medium mb-1">Region</label>
          <input
            name="location.region"
            value={form.location.region}
            onChange={handleChange}
            className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Contoh: Jawa Barat"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">
            Kota <span className="text-red-500">*</span>
          </label>
          <input
            name="location.city"
            value={form.location.city}
            onChange={handleChange}
            className={`input w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors["location.city"] ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Contoh: Tangerang Selatan"
          />
          {errors["location.city"] && (
            <p className="text-red-500 text-sm mt-1">
              {errors["location.city"]}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">
            Area <span className="text-red-500">*</span>
          </label>
          <input
            name="location.area"
            value={form.location.area}
            onChange={handleChange}
            className={`input w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors["location.area"] ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Contoh: BSD City"
          />
          {errors["location.area"] && (
            <p className="text-red-500 text-sm mt-1">
              {errors["location.area"]}
            </p>
          )}
        </div>

        <div className="col-span-2">
          <label className="block font-medium mb-1">Alamat Lengkap</label>
          <input
            name="location.address"
            value={form.location.address}
            onChange={handleChange}
            className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Contoh: Jl. BSD Raya Utama, Pagedangan, Kec. Pagedangan"
          />
        </div>

        <div className="col-span-2">
          <label className="block font-medium mb-1">Link Google Maps</label>
          <input
            name="location.mapsLink"
            value={form.location.mapsLink}
            onChange={handleChange}
            className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Contoh: https://maps.app.goo.gl/..."
          />
        </div>
      </div>
    </fieldset>
  );
};

export default PerumahanForm;