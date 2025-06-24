"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Building2,
  Users,
} from "lucide-react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    propertyType: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        propertyType: "",
      });
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Alamat Kantor",
      content: "Jl. Properti Indah No. 123, Jakarta Selatan 12345",
      subContent: "Gedung S-Property, Lantai 5",
    },
    {
      icon: Mail,
      title: "Email",
      content: "info@s-property.com",
      subContent: "support@s-property.com",
    },
    {
      icon: Phone,
      title: "Telepon",
      content: "+62 21 1234 5678",
      subContent: "+62 812 3456 7890 (WhatsApp)",
    },
    {
      icon: Clock,
      title: "Jam Operasional",
      content: "Senin - Jumat: 08:00 - 17:00",
      subContent: "Sabtu: 08:00 - 15:00 | Minggu: Tutup",
    },
  ];

  const propertyTypes = [
    "Rumah Tinggal",
    "Apartemen",
    "Ruko/Rukan",
    "Tanah Kavling",
    "Villa",
    "Lainnya",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-tosca-500 to-tosca-300 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Hubungi Kami
            </h1>
            <p className="text-xl md:text-2xl text-tosca-50 leading-relaxed">
              Tim profesional kami siap membantu mewujudkan impian properti
              Anda. Konsultasi gratis dan terpercaya.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-tosca-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-tosca-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Kirim Pesan
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tosca-200 focus:border-tosca-300 transition-colors"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tosca-200 focus:border-tosca-300 transition-colors"
                      placeholder="nama@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tosca-200 focus:border-tosca-300 transition-colors"
                      placeholder="+62 812 3456 7890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Jenis Properti
                    </label>
                    <select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tosca-200 focus:border-tosca-300 transition-colors"
                    >
                      <option value="">Pilih jenis properti</option>
                      {propertyTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pesan *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tosca-200 focus:border-tosca-300 transition-colors resize-none"
                    placeholder="Ceritakan kebutuhan properti Anda..."
                  ></textarea>
                </div>

                {/* Submit Status */}
                {submitStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg flex items-center gap-3 ${
                      submitStatus === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {submitStatus === "success" ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <span className="font-medium">
                      {submitStatus === "success"
                        ? "Pesan berhasil dikirim! Kami akan segera menghubungi Anda."
                        : "Gagal mengirim pesan. Silakan coba lagi."}
                    </span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-tosca-300 to-tosca-200 text-white px-8 py-4 rounded-lg font-semibold hover:from-tosca-400 hover:to-tosca-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Kirim Pesan
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            <div className="grid gap-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-tosca-100 to-tosca-50 rounded-lg">
                      <info.icon className="w-6 h-6 text-tosca-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {info.title}
                      </h3>
                      <p className="text-gray-600 font-medium">
                        {info.content}
                      </p>
                      {info.subContent && (
                        <p className="text-gray-500 text-sm mt-1">
                          {info.subContent}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Map Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Lokasi Kantor Kami
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kunjungi kantor kami untuk konsultasi langsung dengan tim ahli
              properti. Lokasi strategis dan mudah dijangkau dengan berbagai
              transportasi.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid lg:grid-cols-3">
              {/* Map Placeholder */}
              <div className="lg:col-span-2 h-96 bg-gray-200 relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4058.957257731738!2d106.47085899999999!3d-6.263197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e4207007a9ae2bd%3A0x2eadfd9ad34d5010!2sKantor%20S-Property%20(Agent%20Properti)%20Kabupaten%20Tangerang!5e1!3m2!1sid!2sid!4v1750690645543!5m2!1sid!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              {/* Location Details */}
              <div className="p-8 bg-gradient-to-br from-tosca-50 to-white">
                <h3 className="text-xl font-bold text-gray-800 mb-6">
                  Petunjuk Arah
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg mt-1">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        Dari Stasiun Tigaraksa atau Daru
                      </p>
                      <p className="text-gray-600 text-sm">
                        20 menit naik kendaraan
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg mt-1">
                      <Building2 className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Pasar Gudang Tigaraksa</p>
                      <p className="text-gray-600 text-sm">
                        5 menit naik kendaraan
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg mt-1">
                      <Clock className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Parkir</p>
                      <p className="text-gray-600 text-sm">
                        Tersedia parkir gratis
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button className="w-full bg-tosca-200 text-white px-6 py-3 rounded-lg font-semibold hover:bg-tosca-300 transition-colors duration-300 flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Buka di Google Maps
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Pertanyaan Umum
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Berikut adalah jawaban untuk pertanyaan yang sering diajukan oleh
              klien kami.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                question: "Apakah konsultasi properti gratis?",
                answer:
                  "Ya, kami menyediakan konsultasi gratis untuk semua klien. Tim ahli kami akan membantu Anda menemukan properti yang sesuai dengan kebutuhan dan budget.",
              },
              {
                question: "Berapa lama proses pembelian properti?",
                answer:
                  "Proses pembelian properti biasanya memakan waktu 2-4 minggu, tergantung pada kelengkapan dokumen dan proses verifikasi bank untuk KPR.",
              },
              {
                question: "Apakah ada garansi untuk properti yang dibeli?",
                answer:
                  "Semua properti yang kami jual dilengkapi dengan garansi konstruksi dan legal yang aman. Kami juga menyediakan layanan after-sales.",
              },
              {
                question: "Bagaimana cara mengajukan KPR?",
                answer:
                  "Tim kami akan membantu proses pengajuan KPR dari awal hingga selesai, termasuk persiapan dokumen dan negosiasi dengan bank.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.4 + index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <h3 className="font-semibold text-gray-800 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-tosca-300 to-blue-300 rounded-2xl p-8 md:p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Siap Menemukan Properti Impian?
            </h2>
            <p className="text-xl mb-8 text-tosca-50">
              Hubungi kami sekarang untuk konsultasi gratis dan dapatkan
              penawaran terbaik!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-tosca-200 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300 flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" />
                Hubungi Sekarang
              </button>
              <button className="bg-tosca-200 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-300 flex items-center justify-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Chat WhatsApp
              </button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default ContactPage;
