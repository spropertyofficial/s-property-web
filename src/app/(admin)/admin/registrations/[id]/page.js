"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { 
  FaArrowLeft, 
  FaUser, 
  FaIdCard, 
  FaCreditCard, 
  FaEye,
  FaUserCheck,
  FaUserTimes,
  FaEdit
} from "react-icons/fa";
import Link from "next/link";
import Swal from "sweetalert2";

export default function RegistrationDetailPage() {
  const { id } = useParams();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  // Always run hooks before any early return
  useEffect(() => {
    if (registration && registration.status === "approved" && registration.userAccount) {
      // Fetch again to get generatedPassword and user info
      fetch(`/api/admin/registrations/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.user && data.generatedPassword) {
            setUserInfo({
              email: data.user.email,
              password: data.generatedPassword,
            });
          }
        });
    } else {
      setUserInfo(null);
    }
  }, [registration, id]);

  const fetchRegistration = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/registrations/${id}`);
      const data = await response.json();
      if (data.success) {
        // If registration is approved, fetch again to get user/password
        setRegistration(data.registration);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error fetching registration:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal memuat data registrasi",
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchRegistration();
    }
  }, [id, fetchRegistration]);

  const handleStatusUpdate = async (newStatus) => {
    const { value: reviewNotes } = await Swal.fire({
      title: `Update Status ke "${newStatus}"`,
      input: "textarea",
      inputLabel: "Catatan Review (opsional)",
      inputPlaceholder: "Masukkan catatan untuk perubahan status ini...",
      showCancelButton: true,
      confirmButtonText: "Update Status",
      cancelButtonText: "Batal",
    });

    if (reviewNotes !== undefined) {
      try {
        const response = await fetch(`/api/admin/registrations/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            status: newStatus,
            reviewNotes: reviewNotes || ""
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          Swal.fire("Berhasil!", "Status berhasil diperbarui", "success");
          fetchRegistration();
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        Swal.fire("Error!", error.message, "error");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "reviewed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openImageModal = (imageUrl, title) => {
    Swal.fire({
      title: title,
      imageUrl: imageUrl,
      imageWidth: 600,
      imageHeight: 400,
      imageAlt: title,
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        image: 'swal-image-preview'
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Data Tidak Ditemukan</h1>
          <Link
            href="/admin/registrations"
            className="text-blue-600 hover:text-blue-800"
          >
            Kembali ke Daftar Registrasi
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/registrations"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="mr-2" />
            Kembali
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Detail Registrasi
            </h1>
            <p className="text-gray-600">
              {registration.personalData.fullName}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(registration.status)}`}>
            {registration.status}
          </span>
          {registration.status === "pending" && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleStatusUpdate("approved")}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <FaUserCheck className="mr-2" />
                Approve
              </button>
              <button
                onClick={() => handleStatusUpdate("rejected")}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <FaUserTimes className="mr-2" />
                Reject
              </button>
            </div>
          )}
          {registration.status !== "pending" && (
            <button
              onClick={() => handleStatusUpdate("pending")}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaEdit className="mr-2" />
              Edit Status
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Data */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <FaUser className="text-blue-500 text-lg mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Data Pribadi</h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Nama Lengkap</label>
              <p className="text-gray-900">{registration.personalData.fullName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500  mb-4">Tipe Pendaftar</label>
              <p className="text-blue-700 bg-blue-50 px-2 py-1 rounded-full block font-semibold w-fit">
                {registration.personalData.category && registration.personalData.category.replace(/-/g, " ")}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Tempat, Tanggal Lahir</label>
              <p className="text-gray-900">
                {registration.personalData.birthPlace}, {" "}
                {new Date(registration.personalData.birthDate).toLocaleDateString("id-ID")}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{registration.personalData.email}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Telepon</label>
              <p className="text-gray-900">{registration.personalData.phone}</p>
            </div>
            
            {registration.personalData.referralPhone && (
              <div>
                <label className="text-sm font-medium text-gray-500">Telepon Referral</label>
                <p className="text-gray-900">{registration.personalData.referralPhone}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-500">Kota</label>
              <p className="text-gray-900">{registration.documents.city}</p>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <FaIdCard className="text-green-500 text-lg mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Dokumen</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">NIK</label>
              <p className="text-gray-900 font-mono">{registration.documents.nik}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">NPWP</label>
              <p className="text-gray-900 font-mono">{registration.documents.npwp}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Foto KTP</label>
              <button
                onClick={() => openImageModal(registration.documents.ktpFile.url, "Foto KTP")}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <FaEye className="mr-2" />
                Lihat Foto KTP
              </button>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Foto NPWP</label>
              <button
                onClick={() => openImageModal(registration.documents.npwpFile.url, "Foto NPWP")}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <FaEye className="mr-2" />
                Lihat Foto NPWP
              </button>
            </div>
          </div>
        </div>

        {/* Bank Account */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <FaCreditCard className="text-purple-500 text-lg mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Data Rekening</h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Bank</label>
              <p className="text-gray-900">{registration.bankAccount.bankName}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Nomor Rekening</label>
              <p className="text-gray-900 font-mono">{registration.bankAccount.accountNumber}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Nama Pemilik</label>
              <p className="text-gray-900">{registration.bankAccount.accountHolder}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Foto Buku Tabungan</label>
              <button
                onClick={() => openImageModal(registration.bankAccount.bankBookFile.url, "Foto Buku Tabungan")}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <FaEye className="mr-2" />
                Lihat Foto Buku Tabungan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata & User Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Registrasi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Tanggal Daftar</label>
            <p className="text-gray-900">{formatDate(registration.submittedAt)}</p>
          </div>
          {registration.reviewedAt && (
            <div>
              <label className="text-sm font-medium text-gray-500">Tanggal Review</label>
              <p className="text-gray-900">{formatDate(registration.reviewedAt)}</p>
            </div>
          )}
          {registration.reviewNotes && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500">Catatan Review</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{registration.reviewNotes}</p>
            </div>
          )}
        </div>

        {/* User Account Info (shown if approved) */}
        {registration.status === "approved" && userInfo && (
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-md font-semibold text-green-800 mb-2 flex items-center">
              <FaUserCheck className="mr-2" /> Akun User Otomatis
            </h3>
            <div className="flex flex-col md:flex-row md:space-x-8 space-y-2 md:space-y-0">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900 font-mono select-all">{userInfo.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Password</label>
                <p className="text-gray-900 font-mono select-all">{userInfo.password}</p>
                <span className="text-xs text-gray-500">(Tampilkan ke user secara manual)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
