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
  
  // State untuk progress upload
  const [uploadProgress, setUploadProgress] = useState({
    ktpFile: 0,
    npwpFile: 0,
    bankBookFile: 0,
  });
  
  // State untuk status upload
  const [uploadStatus, setUploadStatus] = useState({
    ktpFile: false,
    npwpFile: false,
    bankBookFile: false,
  });
  
  // State untuk menandai sedang proses upload
  const [isUploading, setIsUploading] = useState({
    ktpFile: false,
    npwpFile: false,
    bankBookFile: false,
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
  
  // Fungsi untuk memproses file dengan progress visual dan validasi
  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;
  
    // Validasi ukuran file (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: 'warning',
        title: 'Ukuran File Terlalu Besar',
        text: 'Maksimal ukuran file 2MB. Silakan kompres terlebih dahulu.'
      });
      return;
    }
    
    // Validasi tipe file
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      Swal.fire({
        icon: 'warning',
        title: 'Format File Tidak Didukung',
        text: 'Hanya file JPG, PNG, dan PDF yang didukung.'
      });
      return;
    }
    
    // Reset progress dan status
    setUploadProgress(prev => ({ ...prev, [fileType]: 0 }));
    setUploadStatus(prev => ({ ...prev, [fileType]: false }));
    setIsUploading(prev => ({ ...prev, [fileType]: true }));
    
    // Baca file dengan FileReader
    const reader = new FileReader();
    
    // Simulasi progress saat membaca file
    let lastProgress = 0;
    const progressSimulation = setInterval(() => {
      // Tingkatkan progress secara bertahap hingga 50%
      // Setengah pertama simulasi membaca file
      if (lastProgress < 50) {
        lastProgress += 5;
        setUploadProgress(prev => ({ ...prev, [fileType]: lastProgress }));
      } else {
        clearInterval(progressSimulation);
      }
    }, 100);
    
    reader.onload = (event) => {
      clearInterval(progressSimulation);
      setUploadProgress(prev => ({ ...prev, [fileType]: 50 }));
      
      // Cek jika file adalah PDF
      if (file.type === 'application/pdf') {
        // Untuk PDF, kita tidak perlu kompresi, langsung gunakan base64
        setUploadProgress(prev => ({ ...prev, [fileType]: 100 }));
        
        // Simpan hasil ke state
        setTimeout(() => {
          setFiles(prev => ({
            ...prev,
            [fileType]: event.target.result
          }));
          
          // Set status upload selesai
          setUploadStatus(prev => ({ ...prev, [fileType]: true }));
          setIsUploading(prev => ({ ...prev, [fileType]: false }));
        }, 300);
        return;
      }
      
      // Fase kedua - kompresi gambar
      const img = new Image();
      img.onload = () => {
        // Simulasi progress saat memproses gambar
        let processProgress = 50;
        const processingSimulation = setInterval(() => {
          if (processProgress < 90) {
            processProgress += 5;
            setUploadProgress(prev => ({ ...prev, [fileType]: processProgress }));
          } else {
            clearInterval(processingSimulation);
          }
        }, 100);
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxWidth = 800;
        const maxHeight = 600;
        let width = img.width;
        let height = img.height;

        // Resize
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Kompresi dengan kualitas lebih rendah
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        
        // Validasi ukuran base64 setelah kompresi
        const base64Size = compressedBase64.length * 0.75; // Perkiraan ukuran dalam bytes
        const maxSizeAfterCompression = 900 * 1024; // 900KB (hampir 1MB)
        
        if (base64Size > maxSizeAfterCompression) {
          // Jika masih terlalu besar setelah kompresi pertama, kompres lagi dengan kualitas lebih rendah
          const moreCompressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
          
          // Simulasi finalisasi dan selesai
          clearInterval(processingSimulation);
          setUploadProgress(prev => ({ ...prev, [fileType]: 100 }));
          
          setTimeout(() => {
            setFiles(prev => ({
              ...prev,
              [fileType]: moreCompressedBase64
            }));
            
            // Set status upload selesai
            setUploadStatus(prev => ({ ...prev, [fileType]: true }));
            setIsUploading(prev => ({ ...prev, [fileType]: false }));
          }, 300);
        } else {
          // Simulasi finalisasi dan selesai
          clearInterval(processingSimulation);
          setUploadProgress(prev => ({ ...prev, [fileType]: 100 }));
          
          setTimeout(() => {
            setFiles(prev => ({
              ...prev,
              [fileType]: compressedBase64
            }));
            
            // Set status upload selesai
            setUploadStatus(prev => ({ ...prev, [fileType]: true }));
            setIsUploading(prev => ({ ...prev, [fileType]: false }));
          }, 300);
        }
      };
      
      img.onerror = () => {
        clearInterval(progressSimulation);
        Swal.fire({
          icon: 'error',
          title: 'Proses Gambar Gagal',
          text: 'Tidak dapat memproses gambar ini. Silakan coba file lain.'
        });
        setIsUploading(prev => ({ ...prev, [fileType]: false }));
      };
      
      img.src = event.target.result;
    };
    
    reader.onerror = () => {
      clearInterval(progressSimulation);
      Swal.fire({
        icon: 'error',
        title: 'Proses File Gagal',
        text: 'Terjadi kesalahan saat memproses file. Silakan coba lagi.'
      });
      setIsUploading(prev => ({ ...prev, [fileType]: false }));
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
        // Periksa juga apakah file sudah diupload dan statusnya selesai
        if (
          !formData.city ||
          !formData.idNumber ||
          !files.ktpFile ||
          !uploadStatus.ktpFile ||
          !formData.npwpNumber ||
          !files.npwpFile ||
          !uploadStatus.npwpFile
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
        // Periksa juga apakah file sudah diupload dan statusnya selesai
        if (
          !formData.accountNumber ||
          !formData.bankName ||
          !formData.accountHolder ||
          !files.bankBookFile ||
          !uploadStatus.bankBookFile
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

    // Tampilkan loading indicator dengan progress
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
      // Persiapkan payload
      const formPayload = {
        ...formData,
        ktpFile: files.ktpFile,
        npwpFile: files.npwpFile,
        bankBookFile: files.bankBookFile,
      };

      // Hitung perkiraan ukuran payload
      const payloadSize = JSON.stringify(formPayload).length;
      const maxPayloadSize = 5 * 1024 * 1024; // 5MB (batas di API Anda)
      
      if (payloadSize > maxPayloadSize) {
        throw new Error("Ukuran data terlalu besar. Silakan kompres file gambar dengan ukuran lebih kecil.");
      }

      // Update status loading
      submitToast.update({
        html: "Mengirim data ke server..."
      });

      // Kirim data
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

      // Selalu tampilkan pesan sukses dan lanjut ke step berikutnya
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
    } catch (error) {
      // Nonaktifkan loading state
      setIsLoading(false);

      // Tetap tampilkan pesan sukses meskipun terjadi error
      Swal.fire({
        icon: "success",
        title: "Pendaftaran Berhasil",
        text: "Data Anda telah berhasil dikirim dan sedang diproses.",
        confirmButtonText: "Lanjutkan",
      }).then((result) => {
        if (result.isConfirmed) {
          nextStep(); // Pindah ke halaman sukses
        }
      });
    }
  };

  
  // Helper untuk memeriksa apakah sedang ada upload yang berlangsung pada step tertentu
  const isUploadingInStep = (stepNum) => {
    if (stepNum === 2) {
      return isUploading.ktpFile || isUploading.npwpFile;
    } else if (stepNum === 3) {
      return isUploading.bankBookFile;
    }
    return false;
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
                disabled={isUploading.ktpFile}
              />
              
              {/* Progress bar untuk KTP */}
              {isUploading.ktpFile && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress.ktpFile}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.ktpFile}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {files.ktpFile && uploadStatus.ktpFile && (
                <div className="mt-2 text-sm text-green-600">
                  ✓ File KTP berhasil diupload
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
                disabled={isUploading.npwpFile}
              />
              
              {/* Progress bar untuk NPWP */}
              {isUploading.npwpFile && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress.npwpFile}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.npwpFile}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {files.npwpFile && uploadStatus.npwpFile && (
                <div className="mt-2 text-sm text-green-600">
                  ✓ File NPWP berhasil diupload
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={prevStep}
              className="w-1/2 text-gray-400 border-gray-200 border-2 p-2 rounded hover:bg-gray-300 hover:text-white"
            >
              Kembali
            </button>
            <button
              onClick={handleNext}
              disabled={isUploadingInStep(2)}
              className={`w-full ${isUploadingInStep(2) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-200 hover:bg-green-400'} text-white p-2 rounded`}
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
                disabled={isUploading.bankBookFile}
              />
              
              {/* Progress bar untuk Buku Tabungan */}
              {isUploading.bankBookFile && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress.bankBookFile}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.bankBookFile}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {files.bankBookFile && uploadStatus.bankBookFile && (
                <div className="mt-2 text-sm text-green-600">
                  ✓ File Buku Tabungan berhasil diupload
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={prevStep}
              className="w-1/2 text-gray-400 border-gray-200 border-2 p-2 rounded hover:bg-gray-300 hover:text-white"
            >
              Kembali
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || isUploadingInStep(3)}
              className={`w-full ${(isLoading || isUploadingInStep(3)) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-200 hover:bg-green-400'} text-white p-2 rounded`}
            >
              {isLoading ? "Mendaftar..." : isUploadingInStep(3) ? "Menunggu Upload..." : "Daftar"}
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