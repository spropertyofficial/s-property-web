"use client";

import KavlingForm from "./KavlingForm";
import PerumahanForm from "./PerumahanForm";
import ApartemenForm from "./ApartemenForm";
import RukoForm from "./RukoForm";

export default function SpesificForms({
  assetTypeName,
  form,
  handleChange,
  errors,
}) {
  switch (assetTypeName) {
    case "Tanah":
    case "Kavling":
      // Jika tipenya Tanah atau Kavling, panggil komponen spesialisnya
      return (
        <KavlingForm form={form} handleChange={handleChange} errors={errors} />
      );

    case "Ruko":
      return (
        <RukoForm form={form} handleChange={handleChange} errors={errors} />
      );

    case "Apartemen":
      return (
        <ApartemenForm form={form} handleChange={handleChange} errors={errors} />
      );

    case "Perumahan":
      // return <PerumahanFields form={form} handleChange={handleChange} errors={errors} />;
      return (
        <PerumahanForm
          form={form}
          handleChange={handleChange}
          errors={errors}
        />
      );

    // Jika tidak ada tipe aset yang cocok, jangan tampilkan apa-apa
    default:
      return null;
  }
}
