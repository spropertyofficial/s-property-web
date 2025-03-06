// src/components/sections/RegisterForm/RegisterForm.js
"use client";
import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Home,
  FileText,
  CreditCard,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

export default function RegisterForm() {
  const [notyf, setNotyf] = useState(null);
  const [isBrowser, setIsBrowser] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState({
    ktpFile: null,
    npwpFile: null,
    bankBookFile: null,
  });

  const [formData, setFormData] = useState({
    fullName: "",
    birthPlace: "",
    birthDate: "",
    phone: "",
    email: "",
    referralPhone: "",
    city: "",
    idNumber: "",
    npwpNumber: "",
    accountNumber: "",
    bankName: "",
    accountHolder: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "Ukuran File Terlalu Besar",
        text: "Maksimal ukuran file adalah 5MB.",
      });
      return;
    }

    // Konversi file ke base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setFiles((prev) => ({
        ...prev,
        [fileType]: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  
  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        if (
          !formData.fullName ||
          !formData.birthPlace ||
          !formData.birthDate ||
          !formData.phone ||
          !formData.email
        ) {
          Swal.fire({
            icon: "error",
            title: "Data Tidak Lengkap",
            text: "Silakan lengkapi semua data yang wajib diisi",
          });
          return false;
        }
        // Validasi format email
        if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
          Swal.fire({
            icon: "error",
            title: "Format Email Salah",
            text: "Format email tidak valid",
          });
          return false;
        }
        return true;

      case 2:
        if (
          !formData.city ||
          !formData.idNumber ||
          !files.ktpFile ||
          !formData.npwpNumber ||
          !files.npwpFile
        ) {
          Swal.fire({
            icon: "error",
            title: "Data Tidak Lengkap",
            text: "Silakan lengkapi semua data yang wajib diisi dan upload KTP juga NPWP Anda",
          });
          return false;
        }
        return true;

      case 3:
        if (
          !formData.accountNumber ||
          !formData.bankName ||
          !formData.accountHolder ||
          !files.bankBookFile
        ) {
          Swal.fire({
            icon: "error",
            title: "Data Tidak Lengkap",
            text: "Silakan lengkapi semua data rekening yang wajib diisi dan upload foto buku tabungan",
          });
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      nextStep();
    }
  };

  const handleSubmit = async () => {
    // Validasi step
    if (!validateStep(3)) return;

    // Aktifkan loading state
    setIsLoading(true);

    Swal.fire({
      title: "Sedang Mendaftar",
      text: "Mohon tunggu sebentar...",
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const formPayload = {
        ...formData,
        ktpFile: files.ktpFile,
        npwpFile: files.npwpFile,
        bankBookFile: files.bankBookFile,
      };

      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formPayload),
      });

        const result = await response.json();

      // Nonaktifkan loading state
      setIsLoading(false);

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Pendaftaran Berhasil",
          text:
            result.message ||
            "Data Anda telah berhasil dikirim dan sedang diproses.",
          confirmButtonText: "Lanjutkan",
        }).then((result) => {
          if (result.isConfirmed) {
            nextStep(); // Pindah ke halaman sukses
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Pendaftaran Gagal",
          text: `Terjadi kesalahan: ${error.message}. Silakan coba lagi.`,
        });
      }
    } catch (error) {
      // Nonaktifkan loading state
      setIsLoading(false);

      Swal.fire({
        icon: "error",
        title: "Pendaftaran Gagal",
        text: `Terjadi kesalahan: ${error.message}. Silakan coba lagi.`,
      });
    }
  };
  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6 text-green-200">
        REGISTRASI
      </h1>

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-green-200 rounded-full"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className={step >= 1 ? "text-green-200 font-medium" : ""}>
            Data Diri
          </span>
          <span className={step >= 2 ? "text-green-200 font-medium" : ""}>
            Dokumen
          </span>
          <span className={step >= 3 ? "text-green-200 font-medium" : ""}>
            Rekening
          </span>
          <span className={step >= 4 ? "text-green-200 font-medium" : ""}>
            Selesai
          </span>
        </div>
      </div>

      {/* Step 1: Informasi Dasar */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="flex text-green-200 items-center mb-1 ">
              <User size={16} className="mr-2" />
              Nama Lengkap *
            </label>
            <input
              type="text"
              name="fullName"
              className="w-full p-2 border border-green-200 outline-none rounded focus:ring-2 focus:ring-green-200"
              onChange={handleChange}
              value={formData.fullName || ""}
            />
          </div>

          <div>
            <label className="flex text-green-200 items-center mb-1">
              <Calendar size={16} className="mr-2" />
              Tempat Lahir *
            </label>
            <input
              type="text"
              name="birthPlace"
              className="w-full p-2 border border-green-200 outline-none rounded focus:ring-2 focus:ring-green-200"
              onChange={handleChange}
              value={formData.birthPlace || ""}
            />
          </div>
          <div>
            <label className="flex text-green-200 items-center mb-1">
              <Calendar size={16} className="mr-2" />
              Tanggal Lahir *
            </label>
            <DatePicker
              selected={
                formData.birthDate ? new Date(formData.birthDate) : null
              }
              onChange={(date) => {
                // Format the date to YYYY-MM-DD before saving to state
                const formattedDate = date.toISOString().split("T")[0];
                setFormData((prev) => ({ ...prev, birthDate: formattedDate }));
              }}
              dateFormat="dd/MM/yyyy"
              placeholderText="Pilih tanggal lahir"
              className="w-full p-2 border border-green-200 outline-none rounded focus:ring-2 focus:ring-green-200"
              showYearDropdown
              yearDropdownItemNumber={100}
              scrollableYearDropdown
            />
          </div>

          <div>
            <label className="flex text-green-200 items-center mb-1">
              <Phone size={16} className="mr-2" />
              Nomor Handphone *
            </label>
            <input
              type="tel"
              name="phone"
              className="w-full p-2 border border-green-200 outline-none rounded focus:ring-2 focus:ring-green-200"
              onChange={handleChange}
              value={formData.phone || ""}
            />
          </div>

          <div>
            <label className="flex text-green-200 items-center mb-1">
              <Mail size={16} className="mr-2" />
              E-mail *
            </label>
            <input
              type="email"
              name="email"
              className="w-full p-2 border border-green-200 outline-none rounded focus:ring-2 focus:ring-green-200"
              onChange={handleChange}
              value={formData.email || ""}
            />
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-green-200 text-white p-2 rounded hover:bg-green-400"
          >
            Selanjutnya
          </button>
        </div>
      )}

      {/* Step 2: Dokumen */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="flex text-green-200 items-center mb-1">
              <Phone size={16} className="mr-2" />
              Nomor Handphone Pengrekrut (opsional)
            </label>
            <input
              type="tel"
              name="referralPhone"
              className="w-full p-2 border border-green-200 outline-none rounded focus:ring-2 focus:ring-green-200"
              onChange={handleChange}
              value={formData.referralPhone || ""}
            />
          </div>

          <div>
            <label className="flex text-green-200 items-center mb-1">
              <Home size={16} className="mr-2" />
              Domisili/Kota *
            </label>
            <input
              type="text"
              name="city"
              className="w-full p-2 border border-green-200 outline-none rounded focus:ring-2 focus:ring-green-200"
              onChange={handleChange}
              value={formData.city || ""}
            />
          </div>

          <div>
            <label className="flex text-green-200 items-center mb-1">
              <FileText size={16} className="mr-2" />
              Nomor NIK *
            </label>
            <input
              type="text"
              name="idNumber"
              className="w-full p-2 border border-green-200 outline-none rounded focus:ring-2 focus:ring-green-200"
              onChange={handleChange}
              value={formData.idNumber || ""}
            />
          </div>

          <div>
            <label className="flex text-green-200 items-center mb-1">
              <FileText size={16} className="mr-2" />
              Upload Foto KTP *
            </label>
            <div className="border border-dashed rounded p-4">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(e, "ktpFile")}
                className="w-full"
              />
              {files.ktpFile && (
                <div className="mt-2 text-sm text-green-600">
                  ✓ File KTP siap diupload
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="flex text-green-200 items-center mb-1">
              <FileText size={16} className="mr-2" />
              Nomor NPWP *
            </label>
            <input
              type="text"
              name="npwpNumber"
              className="w-full p-2 border border-green-200 outline-none rounded focus:ring-2 focus:ring-green-200"
              onChange={handleChange}
              value={formData.npwpNumber || ""}
            />
          </div>

          <div>
            <label className="flex text-green-200 items-center mb-1">
              <FileText size={16} className="mr-2" />
              Upload Foto NPWP *
            </label>
            <div className="border border-dashed rounded p-4">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(e, "npwpFile")}
                className="w-full"
              />
              {files.npwpFile && (
                <div className="mt-2 text-sm text-green-600">
                  ✓ File NPWP siap diupload
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={prevStep}
              className="w-1/2 text-gray-400 border-gray-200 border-2  p-2 rounded hover:bg-gray-300 hover:text-white"
            >
              Kembali
            </button>
            <button
              onClick={handleNext}
              className="w-full bg-green-200 text-white p-2 rounded hover:bg-green-400"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Rekening */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="flex text-green-200 items-center mb-1">
              <CreditCard size={16} className="mr-2" />
              Nomor Rekening *
            </label>
            <input
              type="text"
              name="accountNumber"
              className="w-full p-2 border border-green-200 outline-none rounded focus:ring-2 focus:ring-green-200"
              onChange={handleChange}
              value={formData.accountNumber || ""}
            />
          </div>

          <div>
            <label className="flex text-green-200 items-center mb-1">
              <Wallet size={16} className="mr-2" />
              Nama Bank *
            </label>
            <select
              name="bankName"
              className="w-full p-2 border border-green-200 outline-none rounded focus:ring-2 focus:ring-green-200"
              onChange={handleChange}
              value={formData.bankName || ""}
            >
              <option value="">Pilih Bank</option>
              <option value="BCA">BCA</option>
              <option value="BNI">BNI</option>
              <option value="BRI">BRI</option>
              <option value="Mandiri">Mandiri</option>
              <option value="CIMB Niaga">CIMB Niaga</option>
              <option value="BTN">BTN</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="flex text-green-200 items-center mb-1">
              <User size={16} className="mr-2" />
              Atas Nama *
            </label>
            <input
              type="text"
              name="accountHolder"
              className="w-full p-2 border border-green-200 outline-none rounded focus:ring-2 focus:ring-green-200"
              onChange={handleChange}
              value={formData.accountHolder || ""}
            />
          </div>

          <div>
            <label className="flex text-green-200 items-center mb-1">
              <FileText size={16} className="mr-2" />
              Upload Foto Buku Tabungan *
            </label>
            <div className="border border-dashed rounded p-4">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(e, "bankBookFile")}
                className="w-full"
              />
              {files.bankBookFile && (
                <div className="mt-2 text-sm text-green-600">
                  ✓ File Buku Tabungan siap diupload
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={prevStep}
              className="w-1/2 text-gray-400 border-gray-200 border-2  p-2 rounded hover:bg-gray-300 hover:text-white"
            >
              Kembali
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-green-200 text-white p-2 rounded hover:bg-green-400"
            >
              {isLoading ? "Mendaftar..." : "Daftar"}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Selesai */}
      {step === 4 && (
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold">Pendaftaran Berhasil!</h2>
          <p className="text-gray-600">
            Terima kasih telah mendaftar sebagai partner S-Property.
          </p>
          <p className="text-gray-600">
            Kami telah mengirimkan email konfirmasi ke alamat {formData.email}.
          </p>
          <p className="text-gray-600">
            Tim kami akan segera menghubungi Anda untuk proses verifikasi.
          </p>
          <Link
            href="/"
            className="block w-full bg-green-200 text-white p-2 rounded hover:bg-green-400"
          >
            Kembali ke Beranda
          </Link>
        </div>
      )}
    </div>
  );
}
