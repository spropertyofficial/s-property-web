// components/KPRSimulator.jsx
"use client";

import { formatToShortRupiah } from "@/utils/formatCurrency";
import Image from "next/image";
import { FaCheckCircle } from "react-icons/fa";
import { useState, useEffect, useMemo } from "react";
import BankLogos from "../../../../public/images/BankLogos";
import {
  additionalDocumentRequirements,
  documentRequirements,
} from "./data/documentRequirements";

export default function KPRSimulator() {
  // State with more descriptive variable names and better initial values
  const [hargaProperti, setHargaProperti] = useState("");
  const [uangMuka, setUangMuka] = useState("");
  const [jangkaWaktu, setJangkaWaktu] = useState("");
  const [sukuBunga, setSukuBunga] = useState("");
  const [uangMukaPercentage, setUangMukaPercentage] = useState("");

  // Derived states using useMemo for better performance
  const hargaPropertiNum = useMemo(
    () => parseFloat(hargaProperti.replace(/\D/g, "")) || 0,
    [hargaProperti]
  );

  const uangMukaNum = useMemo(
    () => parseFloat(uangMuka.replace(/\D/g, "")) || 0,
    [uangMuka]
  );

  const jumlahPinjaman = useMemo(() => {
    const pinjaman = hargaPropertiNum - uangMukaNum;
    return pinjaman > 0 ? pinjaman : 0;
  }, [hargaPropertiNum, uangMukaNum]);

  const jangkaWaktuNum = useMemo(
    () => parseFloat(jangkaWaktu) || 0,
    [jangkaWaktu]
  );

  const sukuBungaNum = useMemo(() => parseFloat(sukuBunga) || 0, [sukuBunga]);

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
    const pembilang =
      bungaBulanan * Math.pow(1 + bungaBulanan, jangkaWaktuBulan);
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

  const handleUangMukaPercentageChange = (e) => {
    const value = e.target.value.replace(/[^\d.]/g, "");
    setUangMukaPercentage(value);

    if (value === "") {
      setUangMuka("");
      return;
    }

    if (parseFloat(value) <= 100) {
      const calculatedUangMuka = Math.round(
        (parseFloat(value) / 100) * hargaPropertiNum
      );
      setUangMuka(calculatedUangMuka.toString());
    }
  };

  const handleUangMukaChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const uangMukaValue = parseFloat(value) || 0;
    if (uangMukaValue <= hargaPropertiNum) {
      setUangMuka(value);
      // Update percentage when nominal changes
      const percentage = (uangMukaValue / hargaPropertiNum) * 100;
      setUangMukaPercentage(percentage.toFixed(2));
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
      const parts = value.split(".");
      if (parts.length > 1 && parts[1].length > 2) {
        parts[1] = parts[1].substring(0, 2);
        setSukuBunga(parts.join("."));
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
    <div className="w-full bg-tosca-50 py-8 px-4 md:px-8 rounded-xl my-5">
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
                <label
                  className="block text-tosca-400 mb-2"
                  htmlFor="hargaProperti"
                >
                  Harga Properti (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    Rp
                  </span>
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
                  Uang Muka
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="relative col-span-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      Rp
                    </span>
                    <input
                      id="uangMuka"
                      type="text"
                      inputMode="numeric"
                      placeholder="Masukkan nominal uang muka"
                      className="w-full px-4 py-3 pl-10 rounded-lg border border-tosca-100 focus:ring-2 focus:ring-tosca-200"
                      value={formatRupiah(uangMukaNum)}
                      onChange={handleUangMukaChange}
                    />
                  </div>
                  <div className="relative">
                    <input
                      id="uangMukaPercentage"
                      type="text"
                      inputMode="decimal"
                      placeholder="Persentase"
                      className="w-full px-4 py-3 rounded-lg border border-tosca-100 focus:ring-2 focus:ring-tosca-200"
                      value={uangMukaPercentage}
                      onChange={handleUangMukaPercentageChange}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-tosca-400 mb-2"
                  htmlFor="jangkaWaktu"
                >
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
                <label
                  className="block text-tosca-400 mb-2"
                  htmlFor="sukuBunga"
                >
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
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    %
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-tosca-400 mb-2">
                Jumlah Pinjaman (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  Rp
                </span>
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
                <li>
                  Biaya proses KPR dan biaya tambahan lainnya tidak termasuk
                  dalam simulasi.
                </li>
                <li>
                  Untuk ilustrasi angsuran pasti, silakan konsultasikan dengan
                  pihak bank.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 bg-white/90 rounded-lg shadow-md p-6">
          <div className="mt-8 sm:mt-12 bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-tosca-400 text-center">
              Dokumen Pengajuan KPR
            </h2>
            <div className="space-y-4 sm:space-y-6">
              {documentRequirements.map((section, idx) => (
                <div key={idx}>
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-tosca-300">
                    {section.category}
                  </h3>
                  <ul
                    className={`grid gap-2 ${
                      section.items.length > 4
                        ? "md:grid-cols-2"
                        : "grid-cols-1"
                    }`}
                  >
                    {section.items.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start text-xs sm:text-sm text-gray-700"
                      >
                        <FaCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <span className="flex-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 sm:mt-12 bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-tosca-400 text-center">
              Dokumen Tambahan
            </h2>
            <div className="space-y-4 sm:space-y-6">
              {additionalDocumentRequirements.map((section, idx) => (
                <div key={idx}>
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-tosca-300">
                    {section.category}
                  </h3>
                  <ul className="grid gap-2 md:grid-cols-2">
                    {section.items.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start sm:items-center text-xs sm:text-sm text-gray-700"
                      >
                        <FaCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <span className="flex-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          {/* Bank yang Bekerjasama */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-center text-tosca-100">
              Bank Rekanan
            </h3>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4">
            {BankLogos.map((bank) => (
              <Image
                key={bank.name}
                src={bank.logo}
                alt={bank.name}
                width={80}
                height={100}
                className="w-auto h-7 object-contain"
                loading="lazy"
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-tosca-400 mb-4">
              Informasi Lebih Lanjut? Hubungi Kami!
            </h3>
            <p className="text-gray-600 mb-6">
              Tim kami siap membantu Anda dengan proses KPR Anda
            </p>
            <a
              href="https://wa.me/6285123123891"
              className="inline-block bg-tosca-200 text-white px-8 py-3 rounded-lg font-semibold hover:bg-tosca-400 transition duration-300"
            >
              Hubungi Kami
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
