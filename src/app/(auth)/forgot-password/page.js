"use client";
import { useState } from "react";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Instruksi reset password sudah dikirim ke email Anda.");
      } else {
        setError(data.message || "Gagal mengirim instruksi reset password.");
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Kiri: gradient dan logo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-tosca-600 via-tosca-500 to-tosca-400 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'4\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white">
          <div className="mb-3">
            <div className="flex items-center justify-center">
              <div className="w-auto h-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                <Image src="/images/logo.png" alt="S-Property Logo" width={300} height={300} />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-center mb-2">S-Property</h1>
            <p className="text-tosca-100 text-center text-lg">Your Trusted Property Partner</p>
          </div>
          <div className="text-center max-w-md">
            <blockquote className="text-tosca-100 italic">&quot;Finding the perfect property has never been easier. Join thousands of satisfied customers.&quot;</blockquote>
          </div>
        </div>
      </div>
      {/* Kanan: form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Lupa Password</h2>
              <p className="text-gray-600">Masukkan email akun Anda untuk menerima instruksi reset password.</p>
            </div>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            {message && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm">{message}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tosca-500 focus:border-transparent transition-colors"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="Masukkan email Anda"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-tosca-300 hover:bg-tosca-700"} text-white`}
                disabled={loading}
              >
                {loading ? "Mengirim..." : "Kirim Instruksi"}
              </button>
            </form>
            <div className="mt-8 text-center">
              <a href="/login" className="text-sm text-blue-600 hover:text-blue-700 underline">Kembali ke Login</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
