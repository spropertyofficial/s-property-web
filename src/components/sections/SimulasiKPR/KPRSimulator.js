// components/KPRSimulator.jsx
"use client";

import { formatToShortRupiah } from "@/utils/formatCurrency";
import { useState, useEffect, useMemo } from "react";

export default function KPRSimulator() {
  // State with more descriptive variable names and better initial values
  const [hargaProperti, setHargaProperti] = useState("");
  const [uangMuka, setUangMuka] = useState("");
  const [jangkaWaktu, setJangkaWaktu] = useState("");
  const [sukuBunga, setSukuBunga] = useState("");
  
  // Derived states using useMemo for better performance
  const hargaPropertiNum = useMemo(() => 
    parseFloat(hargaProperti.replace(/\D/g, "")) || 0
  , [hargaProperti]);
  
  const uangMukaNum = useMemo(() => 
    parseFloat(uangMuka.replace(/\D/g, "")) || 0
  , [uangMuka]);
  
  const jumlahPinjaman = useMemo(() => {
    const pinjaman = hargaPropertiNum - uangMukaNum;
    return pinjaman > 0 ? pinjaman : 0;
  }, [hargaPropertiNum, uangMukaNum]);
  
  const jangkaWaktuNum = useMemo(() => 
    parseFloat(jangkaWaktu) || 0
  , [jangkaWaktu]);
  
  const sukuBungaNum = useMemo(() => 
    parseFloat(sukuBunga) || 0
  , [sukuBunga]);

  // Calculate monthly payment using useMemo instead of useEffect + state
  const angsuranBulanan = useMemo(() => {
    if (jumlahPinjaman <= 0 || jangkaWaktuNum <= 0 || sukuBungaNum <= 0) {
      return 0;
    }

    // Convert annual interest rate to monthly (in decimal)
    const bungaBulanan = sukuBungaNum / 100 / 12;
    // Term in months
    const jangkaWaktuBulan = jangkaWaktuNum * 12;

    // Monthly payment formula: P * r * (1+r)^n / ((1+r)^n - 1)
    // P = loan amount, r = monthly interest rate, n = term in months
    const pembilang = bungaBulanan * Math.pow(1 + bungaBulanan, jangkaWaktuBulan);
    const penyebut = Math.pow(1 + bungaBulanan, jangkaWaktuBulan) - 1;
    const angsuran = jumlahPinjaman * (pembilang / penyebut);

    return Math.round(angsuran);
  }, [jumlahPinjaman, jangkaWaktuNum, sukuBungaNum]);

  // Formatter for displaying numbers in Rupiah format
  const formatRupiah = (value) => {
    if (!value && value !== 0) return "";
    return new Intl.NumberFormat("id-ID").format(value);
  };

  // Handlers for input changes with better validation
  const handleHargaPropertiChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setHargaProperti(value);
  };

  const handleUangMukaChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    // Ensure uang muka doesn't exceed harga properti
    const uangMukaValue = parseFloat(value) || 0;
    if (uangMukaValue <= hargaPropertiNum) {
      setUangMuka(value);
    }
  };

  const handleJangkaWaktuChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    // Limit to reasonable mortgage periods (1-30 years)
    const years = parseFloat(value) || 0;
    if (years <= 30) {
      setJangkaWaktu(value);
    }
  };

  const handleSukuBungaChange = (e) => {
    // Allow decimal points for interest rate
    const value = e.target.value.replace(/[^\d.]/g, "");
    // Ensure only one decimal point
    const decimalCount = (value.match(/\./g) || []).length;
    if (decimalCount <= 1) {
      // Limit to two decimal places
      const parts = value.split('.');
      if (parts.length > 1 && parts[1].length > 2) {
        parts[1] = parts[1].substring(0, 2);
        setSukuBunga(parts.join('.'));
      } else {
        setSukuBunga(value);
      }
    }
  };

  // Calculate percentage of down payment
  const persentaseUangMuka = useMemo(() => {
    if (hargaPropertiNum <= 0 || uangMukaNum <= 0) return 0;
    return Math.round((uangMukaNum / hargaPropertiNum) * 100);
  }, [hargaPropertiNum, uangMukaNum]);

  // Calculate total payment over the loan term
  const totalPembayaran = useMemo(() => {
    if (angsuranBulanan <= 0 || jangkaWaktuNum <= 0) return 0;
    return angsuranBulanan * jangkaWaktuNum * 12;
  }, [angsuranBulanan, jangkaWaktuNum]);

  // Calculate total interest paid
  const totalBunga = useMemo(() => {
    return totalPembayaran - jumlahPinjaman;
  }, [totalPembayaran, jumlahPinjaman]);

  return (
    <div className="w-full bg-tosca-50 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div
          className="relative bg-cover bg-center text-white rounded-lg mb-8 overflow-hidden"
          style={{
            backgroundImage: 'url("/images/staff-bank.png")',
          }}
        >
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative z-10 flex items-center p-6 md:p-10">
            <div className="w-full md:w-2/3">
              <h1 className="text-2xl md:text-4xl font-bold mb-4">
                Simulasi Kredit Pemilikan Rumah (KPR)
              </h1>
              <p className="text-sm md:text-base">
                Hitung estimasi angsuran bulanan dan rencanakan keuangan Anda
                dengan mudah
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Simulation Input */}
          <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-tosca-400">
              Masukkan Detail Simulasi
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-tosca-400 mb-2" htmlFor="hargaProperti">
                  Harga Properti (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                  <input
                    id="hargaProperti"
                    type="text"
                    inputMode="numeric"
                    placeholder="Masukkan harga properti"
                    className="w-full px-4 py-3 pl-10 rounded-lg border border-tosca-100 focus:ring-2 focus:ring-tosca-200"
                    value={formatRupiah(hargaPropertiNum)}
                    onChange={handleHargaPropertiChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-tosca-400 mb-2" htmlFor="uangMuka">
                  Uang Muka (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                  <input
                    id="uangMuka"
                    type="text"
                    inputMode="numeric"
                    placeholder="Masukkan uang muka"
                    className="w-full px-4 py-3 pl-10 rounded-lg border border-tosca-100 focus:ring-2 focus:ring-tosca-200"
                    value={formatRupiah(uangMukaNum)}
                    onChange={handleUangMukaChange}
                  />
                </div>
                {hargaPropertiNum > 0 && uangMukaNum > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {persentaseUangMuka}% dari harga properti
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-tosca-400 mb-2" htmlFor="jangkaWaktu">
                  Jangka Waktu (Tahun)
                </label>
                <input
                  id="jangkaWaktu"
                  type="text"
                  inputMode="numeric"
                  placeholder="Jangka waktu pinjaman"
                  className="w-full px-4 py-3 rounded-lg border border-tosca-100 focus:ring-2 focus:ring-tosca-200"
                  value={jangkaWaktu}
                  onChange={handleJangkaWaktuChange}
                />
              </div>

              <div>
                <label className="block text-tosca-400 mb-2" htmlFor="sukuBunga">
                  Suku Bunga (% per Tahun)
                </label>
                <div className="relative">
                  <input
                    id="sukuBunga"
                    type="text"
                    inputMode="decimal"
                    placeholder="Suku bunga"
                    className="w-full px-4 py-3 rounded-lg border border-tosca-100 focus:ring-2 focus:ring-tosca-200"
                    value={sukuBunga}
                    onChange={handleSukuBungaChange}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-tosca-400 mb-2">
                Jumlah Pinjaman (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <input
                  type="text"
                  readOnly
                  className="w-full px-4 py-3 pl-10 rounded-lg bg-gray-100 cursor-not-allowed"
                  value={formatRupiah(jumlahPinjaman)}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Simulation Results */}
          <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-tosca-400">
              Hasil Simulasi
            </h2>

            <div className="flex flex-col gap-4">
              <div className="bg-tosca-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Harga Properti</p>
                <p className="text-xl font-bold text-tosca-400">
                  Rp. {formatRupiah(hargaPropertiNum)}
                </p>
              </div>

              <div className="bg-tosca-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Angsuran Bulanan</p>
                <p className="text-xl font-bold text-tosca-400">
                  Rp. {formatRupiah(angsuranBulanan)}
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold mb-2">Catatan Penting:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Hasil simulasi ini bersifat perkiraan.</li>
                <li>Biaya proses KPR dan biaya tambahan lainnya tidak termasuk dalam simulasi.</li>
                <li>Untuk ilustrasi angsuran pasti, silakan konsultasikan dengan pihak bank.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}