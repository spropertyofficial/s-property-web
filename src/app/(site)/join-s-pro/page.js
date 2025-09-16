// src/app/join-s-pro/page.js
import RegisterForm from "@/components/sections/RegisterForm";


const JoinSProPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 text-blue-900 p-4">
        <h2 className="font-semibold mb-1">Catatan untuk pendaftar Sales Inhouse</h2>
        <p className="text-sm">
          Setelah pendaftaran Anda disetujui, admin akan menetapkan daftar proyek yang boleh dijual.
          Saat menambah lead, Anda wajib memilih proyek dari daftar tersebut (tidak bisa ketik bebas).
          Jika proyek Anda belum terlihat, hubungi admin untuk penetapan proyek.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}

export default JoinSProPage;