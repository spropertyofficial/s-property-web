"use client";
import { useEffect, useState, useCallback } from "react";
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
import { useFileUpload } from "@/hooks/useFileUpload";
import FileUpload from "@/components/common/FileUpload";

export default function RegisterForm() {
  const [notyf, setNotyf] = useState(null);
  const [isBrowser, setIsBrowser] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Generate unique registration ID once per session
  const [registrationId] = useState(() => `reg_${Date.now()}`);

  // Use custom file upload hook
  const { uploadFile, getUploadState, resetUploadState } = useFileUpload();

  // Form data state
  const [formData, setFormData] = useState({
    fullName: "",
    birthPlace: "",
    birthDate: "",
    phone: "",
    email: "",
    category: "", // Tipe Pendaftar
    referralPhone: "",
    city: "",
    idNumber: "",
    npwpNumber: "",
    accountNumber: "",
    bankName: "",
    accountHolder: "",
  });

  // File data state
  const [fileData, setFileData] = useState({
    ktpFile: null,
    npwpFile: null,
    bankBookFile: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Realtime validation for phone and referralPhone
    if (name === "phone") {
      const phoneRegex = /^\+62[8][0-9]{8,11}$/;
      if (!phoneRegex.test(value.replace(/[-\s]/g, ""))) {
        setErrors((prev) => ({ ...prev, phone: "Format nomor handphone tidak valid. Gunakan format +6281234567890" }));
      } else {
        setErrors((prev) => ({ ...prev, phone: null }));
      }
    } else if (name === "referralPhone") {
      if (value && value.trim() !== "") {
        const phoneRegex = /^\+62[8][0-9]{8,11}$/;
        if (!phoneRegex.test(value.replace(/[-\s]/g, ""))) {
          setErrors((prev) => ({ ...prev, referralPhone: "Format nomor handphone tidak valid. Gunakan format +6281234567890" }));
        } else {
          setErrors((prev) => ({ ...prev, referralPhone: null }));
        }
      } else {
        setErrors((prev) => ({ ...prev, referralPhone: null }));
      }
    } else {
      // Hapus error saat user mulai mengetik untuk field lain
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
    }
  };

  // Lanjutan fungsi handleBlur untuk validasi field-field di step 2
  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = null;

    // Validasi berdasarkan nama field
    switch (name) {
      case "fullName":
        if (!value || value.trim() === "") {
          error = "Nama lengkap wajib diisi";
        } else if (value.length < 3) {
          error = "Nama lengkap minimal 3 karakter";
        }
        break;
      case "birthPlace":
        if (!value || value.trim() === "") {
          error = "Tempat lahir wajib diisi";
        }
        break;
      case "phone":
        if (!value || value.trim() === "") {
          error = "Nomor handphone wajib diisi";
        } else {
          // Format nomor Indonesia (dimulai dengan 08 atau +62)
          const phoneRegex = /^(\+62|62|0)[8][0-9]{8,11}$/;
          if (!phoneRegex.test(value.replace(/[-\s]/g, ""))) {
            error = "Format nomor handphone tidak valid";
          }
        }
        break;
      case "email":
        if (!value || value.trim() === "") {
          error = "Email wajib diisi";
        } else {
          // Format email
          const emailRegex = /^\S+@\S+\.\S+$/;
          if (!emailRegex.test(value)) {
            error = "Format email tidak valid";
          }
        }
        break;
      // Validasi untuk field-field di step 2
      case "referralPhone":
        // Opsional, jadi validasi hanya jika diisi
        if (value && value.trim() !== "") {
          const phoneRegex = /^(\+62|62|0)[8][0-9]{8,11}$/;
          if (!phoneRegex.test(value.replace(/[-\s]/g, ""))) {
            error = "Format nomor handphone tidak valid";
          }
        }
        break;
      case "city":
        if (!value || value.trim() === "") {
          error = "Domisili/Kota wajib diisi";
        }
        break;
      case "idNumber":
        if (!value || value.trim() === "") {
          error = "Nomor NIK wajib diisi";
        } else if (!/^\d{16}$/.test(value.replace(/[-\s]/g, ""))) {
          error = "Nomor NIK harus terdiri dari 16 digit angka";
        }
        break;
      case "npwpNumber":
        if (!value || value.trim() === "") {
          error = "Nomor NPWP wajib diisi";
        } else if (!/^\d{16}$/.test(value.replace(/[.\-]/g, ""))) {
          error = "Nomor NPWP harus terdiri dari 15 digit angka";
        }
        break;
      case "accountNumber":
        if (!value || value.trim() === "") {
          error = "Nomor rekening wajib diisi";
        } else if (!/^\d{10,15}$/.test(value.replace(/[-\s]/g, ""))) {
          error = "Nomor rekening tidak valid (harus 10-15 digit angka)";
        }
        break;
      case "bankName":
        if (!value || value.trim() === "") {
          error = "Nama bank wajib dipilih";
        }
        break;
      case "accountHolder":
        if (!value || value.trim() === "") {
          error = "Nama pemilik rekening wajib diisi";
        } else if (value.length < 3) {
          error = "Nama pemilik rekening minimal 3 karakter";
        }
        break;
      // Validasi lainnya akan ditambahkan di bagian berikutnya
      default:
        break;
    }

    // Update state errors
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    } else {
      // Hapus error jika validasi berhasil
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleIdNumberChange = (e) => {
    const { value } = e.target;
    // Filter hanya angka dan batasi maksimal 16 digit
    const numericValue = value.replace(/\D/g, "").slice(0, 16);

    // Update formData dengan nilai yang sudah difilter
    setFormData((prev) => ({ ...prev, idNumber: numericValue }));

    // Hapus error jika ada
    if (errors.idNumber) {
      setErrors((prev) => ({ ...prev, idNumber: null }));
    }
  };

  const handleAccountNumberChange = (e) => {
    const { value } = e.target;
    // Filter hanya angka dan batasi maksimal 20 digit (ukuran umum untuk nomor rekening)
    const numericValue = value.replace(/\D/g, "").slice(0, 15);

    // Update formData dengan nilai yang sudah difilter
    setFormData((prev) => ({ ...prev, accountNumber: numericValue }));

    // Hapus error jika ada
    if (errors.accountNumber) {
      setErrors((prev) => ({ ...prev, accountNumber: null }));
    }
  };

  const handleNpwpNumberChange = (e) => {
    const { value } = e.target;
    // Filter hanya angka dan batasi maksimal 15 digit
    const numericValue = value.replace(/\D/g, "").slice(0, 16);

    // Update formData dengan nilai yang sudah difilter
    setFormData((prev) => ({ ...prev, npwpNumber: numericValue }));

    // Hapus error jika ada
    if (errors.npwpNumber) {
      setErrors((prev) => ({ ...prev, npwpNumber: null }));
    }
  };

  const handleBirthDateChange = (date) => {
    // Format the date to YYYY-MM-DD before saving to state
    const formattedDate = date ? date.toISOString().split("T")[0] : "";
    setFormData((prev) => ({ ...prev, birthDate: formattedDate }));

    // Validasi tanggal lahir
    let error = null;

    if (!formattedDate) {
      error = "Tanggal lahir wajib diisi";
    } else {
      const birthDate = new Date(formattedDate);
      const today = new Date();

      // Validasi tanggal valid
      if (isNaN(birthDate.getTime())) {
        error = "Format tanggal lahir tidak valid";
      }

      // Validasi umur minimal 17 tahun
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (age < 17 || (age === 17 && monthDiff < 0)) {
        error = "Anda harus berusia minimal 17 tahun";
      }

      // Validasi tanggal tidak di masa depan
      if (birthDate > today) {
        error = "Tanggal lahir tidak boleh di masa depan";
      }
    }

    if (error) {
      setErrors((prev) => ({ ...prev, birthDate: error }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.birthDate;
        return newErrors;
      });
    }
  };

  // File upload handler
  const handleFileUpload = useCallback(
    async (file, fileType) => {
      try {
        setErrors((prev) => ({ ...prev, [fileType]: null }));

        // Use consistent registration ID for the session
        const options = {
          applicantName: formData.fullName || "unknown",
          registrationId: registrationId,
        };

        const result = await uploadFile(file, fileType, options);

        setFileData((prev) => ({
          ...prev,
          [fileType]: {
            url: result.url,
            publicId: result.publicId,
          },
        }));
      } catch (error) {
        console.error(`Error uploading ${fileType}:`, error);
        setErrors((prev) => ({ ...prev, [fileType]: error.message }));

        Swal.fire({
          icon: "error",
          title: "Upload Gagal",
          text: error.message,
        });
      }
    },
    [uploadFile, formData.fullName, registrationId]
  );

  // Reset file upload
  const handleFileReset = useCallback(
    (fileType) => {
      resetUploadState(fileType);
      setFileData((prev) => ({ ...prev, [fileType]: null }));
      setErrors((prev) => ({ ...prev, [fileType]: null }));
    },
    [resetUploadState]
  );

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const validateStep = (currentStep) => {
    let stepErrors = {};

    switch (currentStep) {
      case 1:
        // Validasi data pribadi
        if (!formData.fullName || formData.fullName.trim() === "") {
          stepErrors.fullName = "Nama lengkap wajib diisi";
        } else if (formData.fullName.length < 3) {
          stepErrors.fullName = "Nama lengkap minimal 3 karakter";
        }

        // Validasi tipe pendaftar
        if (!formData.category) {
          stepErrors.category = "Tipe pendaftar wajib dipilih";
        }

        if (!formData.birthPlace || formData.birthPlace.trim() === "") {
          stepErrors.birthPlace = "Tempat lahir wajib diisi";
        }

        if (!formData.birthDate) {
          stepErrors.birthDate = "Tanggal lahir wajib diisi";
        } else {
          const birthDate = new Date(formData.birthDate);
          const today = new Date();

          // Validasi tanggal valid
          if (isNaN(birthDate.getTime())) {
            stepErrors.birthDate = "Format tanggal lahir tidak valid";
          }

          // Validasi umur minimal 17 tahun
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (age < 17 || (age === 17 && monthDiff < 0)) {
            stepErrors.birthDate = "Anda harus berusia minimal 17 tahun";
          }

          // Validasi tanggal tidak di masa depan
          if (birthDate > today) {
            stepErrors.birthDate = "Tanggal lahir tidak boleh di masa depan";
          }
        }

        if (!formData.phone || formData.phone.trim() === "") {
          stepErrors.phone = "Nomor handphone wajib diisi";
        } else {
          // Format nomor Indonesia (dimulai dengan 08 atau +62)
          const phoneRegex = /^(\+62|62|0)[8][0-9]{8,11}$/;
          if (!phoneRegex.test(formData.phone.replace(/[-\s]/g, ""))) {
            stepErrors.phone = "Format nomor handphone tidak valid";
          }
        }

        if (!formData.email || formData.email.trim() === "") {
          stepErrors.email = "Email wajib diisi";
        } else {
          // Format email
          const emailRegex = /^\S+@\S+\.\S+$/;
          if (!emailRegex.test(formData.email)) {
            stepErrors.email = "Format email tidak valid";
          }
        }
        break;

      case 2:
        // Validasi dokumen
        // Validasi nomor referral (opsional)
        if (formData.referralPhone && formData.referralPhone.trim() !== "") {
          const phoneRegex = /^(\+62|62|0)[8][0-9]{8,11}$/;
          if (!phoneRegex.test(formData.referralPhone.replace(/[-\s]/g, ""))) {
            stepErrors.referralPhone = "Format nomor handphone tidak valid";
          }
        }

        if (!formData.city || formData.city.trim() === "") {
          stepErrors.city = "Domisili/Kota wajib diisi";
        }

        if (!formData.idNumber || formData.idNumber.trim() === "") {
          stepErrors.idNumber = "Nomor NIK wajib diisi";
        } else if (!/^\d{16}$/.test(formData.idNumber.replace(/[-\s]/g, ""))) {
          stepErrors.idNumber = "Nomor NIK harus terdiri dari 16 digit angka";
        }

        if (!fileData.ktpFile) {
          stepErrors.ktpFile = "File KTP wajib diupload";
        }

        if (!formData.npwpNumber || formData.npwpNumber.trim() === "") {
          stepErrors.npwpNumber = "Nomor NPWP wajib diisi";
        } else if (
          !/^\d{15,16}$/.test(formData.npwpNumber.replace(/[.\-]/g, ""))
        ) {
          stepErrors.npwpNumber =
            "Nomor NPWP harus terdiri dari 15-16 digit angka";
        }

        if (!fileData.npwpFile) {
          stepErrors.npwpFile = "File NPWP wajib diupload";
        }
        break;

      case 3:
        // Validasi rekening
        if (!formData.accountNumber || formData.accountNumber.trim() === "") {
          stepErrors.accountNumber = "Nomor rekening wajib diisi";
        } else if (
          !/^\d{10,15}$/.test(formData.accountNumber.replace(/[-\s]/g, ""))
        ) {
          stepErrors.accountNumber =
            "Nomor rekening tidak valid (harus 10-15 digit angka)";
        }

        if (!formData.bankName || formData.bankName.trim() === "") {
          stepErrors.bankName = "Nama bank wajib dipilih";
        }

        if (!formData.accountHolder || formData.accountHolder.trim() === "") {
          stepErrors.accountHolder = "Nama pemilik rekening wajib diisi";
        } else if (formData.accountHolder.length < 3) {
          stepErrors.accountHolder = "Nama pemilik rekening minimal 3 karakter";
        }

        if (!fileData.bankBookFile) {
          stepErrors.bankBookFile = "File buku tabungan wajib diupload";
        }
        break;

      default:
        break;
    }

    // Update state errors
    setErrors(stepErrors);

    // Jika tidak ada error, return true
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      nextStep();
    } else {
      // Tampilkan pesan error jika ada
      Swal.fire({
        icon: "error",
        title: "Data Tidak Lengkap",
        text: "Silakan lengkapi semua data yang wajib diisi dengan benar",
      });
    }
  };

  const handleSubmit = async () => {
    // Validasi step terakhir
    if (!validateStep(3)) {
      Swal.fire({
        icon: "error",
        title: "Data Tidak Lengkap",
        text: "Silakan lengkapi semua data yang wajib diisi dengan benar",
      });
      return;
    }

    // Validasi semua file sudah terupload
    if (!fileData.ktpFile || !fileData.npwpFile || !fileData.bankBookFile) {
      Swal.fire({
        icon: "error",
        title: "File Belum Lengkap",
        text: "Pastikan semua dokumen sudah berhasil diupload",
      });
      return;
    }

    setIsLoading(true);

    const submitToast = Swal.fire({
      title: "Sedang Mendaftar",
      html: "Mempersiapkan data...",
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // Persiapkan payload untuk API baru
      const registrationData = {
        personalData: {
          fullName: formData.fullName,
          birthPlace: formData.birthPlace,
          birthDate: formData.birthDate,
          phone: formData.phone,
          email: formData.email,
          category: formData.category, // Tipe Pendaftar
          referralPhone: formData.referralPhone || null,
        },
        documents: {
          city: formData.city,
          nik: formData.idNumber,
          npwp: formData.npwpNumber,
          ktpFile: fileData.ktpFile,
          npwpFile: fileData.npwpFile,
        },
        bankAccount: {
          accountNumber: formData.accountNumber,
          bankName: formData.bankName,
          accountHolder: formData.accountHolder,
          bankBookFile: fileData.bankBookFile,
        },
      };

      submitToast.update({
        html: "Mengirim data ke server...",
      });

      // Kirim ke API registrasi baru
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      setIsLoading(false);
      submitToast.close();

      if (result.success) {
        await Swal.fire({
          icon: "success",
          title: "Pendaftaran Berhasil!",
          html: `
            <p class="mb-3">${result.message}</p>
            <div class="bg-green-50 p-3 rounded-lg">
              <p class="text-sm text-green-700">
                <strong>ID Registrasi:</strong> ${
                  result.data.registrationId
                }<br/>
                <strong>Status:</strong> ${result.data.status}<br/>
                <strong>Tanggal:</strong> ${new Date(
                  result.data.submittedAt
                ).toLocaleString("id-ID")}
              </p>
            </div>
          `,
          confirmButtonText: "Lanjutkan",
        });

        nextStep(); // Pindah ke halaman sukses
      } else {
        // Handle error dengan pesan spesifik
        await Swal.fire({
          icon: "error",
          title: "Pendaftaran Gagal",
          text:
            result.message || "Terjadi kesalahan saat memproses pendaftaran",
        });

        // Highlight field yang error jika ada
        if (result.field) {
          setErrors((prev) => ({ ...prev, [result.field]: result.message }));
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      setIsLoading(false);
      submitToast.close();

      await Swal.fire({
        icon: "error",
        title: "Kesalahan Jaringan",
        text: "Terjadi kesalahan koneksi. Silakan coba lagi.",
      });
    }
  };

  // Helper untuk mengecek upload status per step
  const isUploadingInStep = useCallback(
    (stepNum) => {
      if (stepNum === 2) {
        const ktpState = getUploadState("ktpFile");
        const npwpState = getUploadState("npwpFile");
        return ktpState.isUploading || npwpState.isUploading;
      } else if (stepNum === 3) {
        const bankBookState = getUploadState("bankBookFile");
        return bankBookState.isUploading;
      }
      return false;
    },
    [getUploadState]
  );

  // Helper untuk mengecek apakah semua file di step sudah berhasil diupload
  const isStepFilesComplete = useCallback(
    (stepNum) => {
      if (stepNum === 2) {
        return fileData.ktpFile && fileData.npwpFile;
      } else if (stepNum === 3) {
        return fileData.bankBookFile;
      }
      return true;
    },
    [fileData]
  );

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
            <label className="flex text-green-200 items-center mb-1">
              <User size={16} className="mr-2" />
              Tipe Pendaftar *
            </label>
            <select
              name="category"
              className={`w-full p-2 border ${
                errors.category ? "border-red-500" : "border-green-200"
              } outline-none rounded focus:ring-2 focus:ring-green-200`}
              onChange={handleChange}
              value={formData.category || ""}
            >
              <option value="">Pilih Tipe Pendaftar</option>
              <option value="semi-agent">Semi Agent</option>
              <option value="agent">Agent</option>
              <option value="sales-inhouse">Sales Inhouse</option>
              <option value="karyawan">Karyawan</option>
            </select>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category}</p>
            )}
          </div>
          <div>
            <label className="flex text-green-200 items-center mb-1 ">
              <User size={16} className="mr-2" />
              Nama Lengkap *
            </label>
            <input
              type="text"
              name="fullName"
              className={`w-full p-2 border ${
                errors.fullName ? "border-red-500" : "border-green-200"
              } outline-none rounded focus:ring-2 focus:ring-green-200`}
              onChange={handleChange}
              onBlur={handleBlur}
              value={formData.fullName || ""}
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className="flex text-green-200 items-center mb-1">
              <Calendar size={16} className="mr-2" />
              Tempat Lahir *
            </label>
            <input
              type="text"
              name="birthPlace"
              className={`w-full p-2 border ${
                errors.birthPlace ? "border-red-500" : "border-green-200"
              } outline-none rounded focus:ring-2 focus:ring-green-200`}
              onChange={handleChange}
              onBlur={handleBlur}
              value={formData.birthPlace || ""}
            />
            {errors.birthPlace && (
              <p className="text-red-500 text-xs mt-1">{errors.birthPlace}</p>
            )}
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
              onChange={handleBirthDateChange}
              dateFormat="dd/MM/yyyy"
              placeholderText="Pilih tanggal"
              className={`w-full p-2 border ${
                errors.birthDate ? "border-red-500" : "border-green-200"
              } outline-none rounded focus:ring-2 focus:ring-green-200`}
              showYearDropdown
              yearDropdownItemNumber={100}
              scrollableYearDropdown
            />
            {errors.birthDate && (
              <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>
            )}
          </div>

          <div>
            <label className="flex text-green-200 items-center mb-1">
              <Phone size={16} className="mr-2" />
              Nomor Handphone *
            </label>
            <input
              type="tel"
              name="phone"
              className={`w-full p-2 border ${
                errors.phone ? "border-red-500" : "border-green-200"
              } outline-none rounded focus:ring-2 focus:ring-green-200`}
              onChange={handleChange}
              onBlur={handleBlur}
              value={formData.phone || ""}
              placeholder="Contoh: +6281234567890"
            />
            <p className="text-xs text-gray-400 mt-1">Contoh: +6281234567890</p>
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="flex text-green-200 items-center mb-1">
              <Mail size={16} className="mr-2" />
              E-mail *
            </label>
            <input
              type="email"
              name="email"
              className={`w-full p-2 border ${
                errors.email ? "border-red-500" : "border-green-200"
              } outline-none rounded focus:ring-2 focus:ring-green-200`}
              onChange={handleChange}
              onBlur={handleBlur}
              value={formData.email || ""}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
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
              className={`w-full p-2 border ${
                errors.referralPhone ? "border-red-500" : "border-green-200"
              } outline-none rounded focus:ring-2 focus:ring-green-200`}
              onChange={handleChange}
              onBlur={handleBlur}
              value={formData.referralPhone || ""}
              placeholder="Contoh: +6281234567890"
            />
            <p className="text-xs text-gray-400 mt-1">Contoh: +6281234567890</p>
            {errors.referralPhone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.referralPhone}
              </p>
            )}
          </div>

          <div>
            <label className="flex text-green-200 items-center mb-1">
              <Home size={16} className="mr-2" />
              Domisili/Kota *
            </label>
            <input
              type="text"
              name="city"
              className={`w-full p-2 border ${
                errors.city ? "border-red-500" : "border-green-200"
              } outline-none rounded focus:ring-2 focus:ring-green-200`}
              onChange={handleChange}
              onBlur={handleBlur}
              value={formData.city || ""}
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="flex text-green-200 items-center mb-1">
              <FileText size={16} className="mr-2" />
              Nomor NIK *
            </label>
            <input
              type="text"
              name="idNumber"
              className={`w-full p-2 border ${
                errors.idNumber ? "border-red-500" : "border-green-200"
              } outline-none rounded focus:ring-2 focus:ring-green-200`}
              onChange={handleIdNumberChange}
              onBlur={handleBlur}
              value={formData.idNumber || ""}
              maxLength="16"
              inputMode="numeric"
              pattern="[0-9]*"
            />
            {errors.idNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.idNumber}</p>
            )}
          </div>

          <FileUpload
            fileType="ktpFile"
            label="Upload Foto KTP"
            accept="image/*,.pdf"
            required={true}
            onFileSelect={handleFileUpload}
            uploadState={getUploadState("ktpFile")}
            onReset={handleFileReset}
          />
          {errors.ktpFile && (
            <p className="text-red-500 text-xs mt-1">{errors.ktpFile}</p>
          )}

          <div>
            <label className="flex text-green-200 items-center mb-1">
              <FileText size={16} className="mr-2" />
              Nomor NPWP *
            </label>
            <input
              type="text"
              name="npwpNumber"
              className={`w-full p-2 border ${
                errors.npwpNumber ? "border-red-500" : "border-green-200"
              } outline-none rounded focus:ring-2 focus:ring-green-200`}
              onChange={handleNpwpNumberChange}
              onBlur={handleBlur}
              value={formData.npwpNumber || ""}
              maxLength="16"
              inputMode="numeric"
            />
            {errors.npwpNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.npwpNumber}</p>
            )}
          </div>

          <FileUpload
            fileType="npwpFile"
            label="Upload Foto NPWP"
            accept="image/*,.pdf"
            required={true}
            onFileSelect={handleFileUpload}
            uploadState={getUploadState("npwpFile")}
            onReset={handleFileReset}
          />
          {errors.npwpFile && (
            <p className="text-red-500 text-xs mt-1">{errors.npwpFile}</p>
          )}

          <div className="flex gap-4">
            <button
              onClick={prevStep}
              className="w-1/2 text-gray-400 border-gray-200 border-2 p-2 rounded hover:bg-gray-300 hover:text-white"
            >
              Kembali
            </button>
            <button
              onClick={handleNext}
              className={`w-full ${
                isUploadingInStep(2)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-200 hover:bg-green-400"
              } text-white p-2 rounded`}
            >
              {isUploadingInStep(2) ? "Menunggu Upload..." : "Selanjutnya"}
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
              className={`w-full p-2 border ${
                errors.accountNumber ? "border-red-500" : "border-green-200"
              } outline-none rounded focus:ring-2 focus:ring-green-200`}
              onChange={handleAccountNumberChange}
              onBlur={handleBlur}
              value={formData.accountNumber || ""}
              maxLength="15"
              inputMode="numeric"
              pattern="[0-9]*"
            />
            {errors.accountNumber && (
              <p className="text-red-500 text-xs mt-1">
                {errors.accountNumber}
              </p>
            )}
          </div>

          <div>
            <label className="flex text-green-200 items-center mb-1">
              <Wallet size={16} className="mr-2" />
              Nama Bank *
            </label>
            <select
              name="bankName"
              className={`w-full p-2 border ${
                errors.bankName ? "border-red-500" : "border-green-200"
              } outline-none rounded focus:ring-2 focus:ring-green-200`}
              onChange={handleChange}
              onBlur={handleBlur}
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
            {errors.bankName && (
              <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>
            )}
          </div>

          <div>
            <label className="flex text-green-200 items-center mb-1">
              <User size={16} className="mr-2" />
              Atas Nama *
            </label>
            <input
              type="text"
              name="accountHolder"
              className={`w-full p-2 border ${
                errors.accountHolder ? "border-red-500" : "border-green-200"
              } outline-none rounded focus:ring-2 focus:ring-green-200`}
              onChange={handleChange}
              onBlur={handleBlur}
              value={formData.accountHolder || ""}
            />
            {errors.accountHolder && (
              <p className="text-red-500 text-xs mt-1">
                {errors.accountHolder}
              </p>
            )}
          </div>

          <FileUpload
            fileType="bankBookFile"
            label="Upload Foto Buku Tabungan"
            accept="image/*,.pdf"
            required={true}
            onFileSelect={handleFileUpload}
            uploadState={getUploadState("bankBookFile")}
            onReset={handleFileReset}
          />
          {errors.bankBookFile && (
            <p className="text-red-500 text-xs mt-1">{errors.bankBookFile}</p>
          )}

          <div className="flex gap-4">
            <button
              onClick={prevStep}
              className="w-1/2 text-gray-400 border-gray-200 border-2 p-2 rounded hover:bg-gray-300 hover:text-white"
            >
              Kembali
            </button>
            <button
              onClick={handleSubmit}
              className={`w-full ${
                isLoading || isUploadingInStep(3)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-200 hover:bg-green-400"
              } text-white p-2 rounded`}
            >
              {isLoading
                ? "Mendaftar..."
                : isUploadingInStep(3)
                ? "Menunggu Upload..."
                : "Daftar"}
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
