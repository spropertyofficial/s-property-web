// src/app/page.js
"use client";
import CategoryMenu from "@/components/sections/Home/CategoryMenu";
import ExploreCities from "@/components/sections/Home/ExploreCities";
import SearchSection from "@/components/sections/Home/SearchSection";
import PropertyListing from "@/components/common/PropertyListing";
import KPRSimulator from "@/components/sections/SimulasiKPR/KPRSimulator";
import { useGetResidentialsQuery } from "@/store/api/residentialsApi";
import { useAuth } from "@/context/AuthContext";
import LoadingLogo from "@/components/common/LoadingWrapper/components/LoadingLogo";

export default function Home() {
  const { data: properties, isLoading, error } = useGetResidentialsQuery();
  const { user, loading: authLoading, isAgent } = useAuth();

  // Filter properties for agents only
  const masterLeadProjects = properties?.filter(
    (property) =>
      property.name === "Griya Harmoni Cibugel" ||
      property.name === "Taman Cisoka Indah"
  );

  const subLeadProjects = properties?.filter(
    (property) =>
      property.name === "Grand Tenjo Residence" ||
      property.name === "Cikupa Green Village"
  );

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingLogo />
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* Search Section - Always visible */}
      <div>
        <SearchSection />
      </div>

      <div className="lg:px-20">
        {/* Category Menu - Always visible */}
        <CategoryMenu />

        {/* Explore Cities - Always visible */}
        <ExploreCities />

        {/* Agent-only Content */}
        {isAgent() ? (
          <>
            {/* Property Listings - Agent Only */}
            <div className="space-y-8">
              <PropertyListing
                data={masterLeadProjects}
                type="residentials"
                title="Master Lead Project"
                isLoading={isLoading}
              />
              <PropertyListing
                data={subLeadProjects}
                type="residentials"
                title="Sub Lead Project"
                isLoading={isLoading}
              />
            </div>
          </>
        ) : (
          /* Public Content for Non-Agents */
          <div className="space-y-12 my-12">
            {/* Hero Section for Public */}
            <section className="text-center py-16 bg-gradient-to-br from-tosca-50 to-tosca-100 rounded-xl">
              <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl md:text-5xl font-bold text-tosca-400 mb-6">
                  Temukan Rumah Impian Anda
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                  Platform properti terpercaya dengan pilihan hunian berkualitas
                  dan lokasi strategis untuk investasi masa depan Anda
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://wa.me/6285123123891"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-white text-tosca-400 border-2 border-tosca-400 px-8 py-3 rounded-lg font-semibold hover:bg-tosca-400 hover:text-white transition-colors duration-200"
                  >
                    Hubungi Kami
                  </a>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="py-16">
              <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
                  Mengapa Memilih S-Property?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center group">
                    <div className="bg-tosca-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-tosca-200 transition-colors duration-200">
                      <svg
                        className="w-10 h-10 text-tosca-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">
                      Properti Berkualitas
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Pilihan properti terbaik dengan lokasi strategis,
                      fasilitas lengkap, dan akses mudah ke berbagai tempat
                      penting
                    </p>
                  </div>

                  <div className="text-center group">
                    <div className="bg-tosca-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-tosca-200 transition-colors duration-200">
                      <svg
                        className="w-10 h-10 text-tosca-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">
                      Terpercaya
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Pengalaman bertahun-tahun dalam industri properti dengan
                      track record terbaik dan kepuasan pelanggan yang tinggi
                    </p>
                  </div>

                  <div className="text-center group">
                    <div className="bg-tosca-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-tosca-200 transition-colors duration-200">
                      <svg
                        className="w-10 h-10 text-tosca-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">
                      Pelayanan 24/7
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Tim profesional siap membantu Anda kapan saja untuk
                      kebutuhan properti dan konsultasi investasi
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Services Section */}
            <section className="py-16 bg-gray-50 rounded-xl">
              <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
                  Layanan Kami
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="text-tosca-400 mb-4">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Jual Beli Properti
                    </h4>
                    <p className="text-sm text-gray-600">
                      Konsultasi lengkap untuk transaksi properti yang aman dan
                      menguntungkan
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="text-tosca-400 mb-4">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Simulasi KPR
                    </h4>
                    <p className="text-sm text-gray-600">
                      Hitung estimasi angsuran dan rencanakan keuangan properti
                      Anda
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="text-tosca-400 mb-4">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Survey Lokasi
                    </h4>
                    <p className="text-sm text-gray-600">
                      Pendampingan survey lokasi dan analisis investasi properti
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="text-tosca-400 mb-4">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Konsultasi Investasi
                    </h4>
                    <p className="text-sm text-gray-600">
                      Strategi investasi properti untuk keuntungan jangka
                      panjang
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 text-center">
              <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  Siap Memulai Investasi Properti?
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Hubungi tim ahli kami untuk konsultasi gratis dan temukan
                  properti impian Anda
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://wa.me/6285123123891"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
                    WhatsApp Kami
                  </a>
                  <a
                    href="tel:+6285123123891"
                    className="inline-flex items-center justify-center bg-tosca-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-tosca-500 transition-colors duration-200"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    Telepon Langsung
                  </a>
                </div>
              </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-16 bg-tosca-50 rounded-xl">
              <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
                  Apa Kata Klien Kami
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className="w-5 h-5 fill-current"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 italic">
                      &quot;Pelayanan yang sangat memuaskan! Tim S-Property
                      membantu saya menemukan rumah impian dengan proses yang
                      mudah dan transparan.&quot;
                    </p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-tosca-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-tosca-600 font-semibold">AS</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          Andi Setiawan
                        </p>
                        <p className="text-sm text-gray-600">Pembeli Rumah</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className="w-5 h-5 fill-current"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 italic">
                      &quot;Investasi properti pertama saya berjalan lancar
                      berkat bimbingan dari S-Property. Sangat profesional dan
                      terpercaya.&quot;
                    </p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-tosca-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-tosca-600 font-semibold">SR</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          Sari Rahayu
                        </p>
                        <p className="text-sm text-gray-600">Investor</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className="w-5 h-5 fill-current"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 italic">
                      &quot;Proses KPR yang tadinya rumit menjadi mudah dengan
                      bantuan tim S-Property. Terima kasih atas pelayanan
                      terbaiknya!&quot;
                    </p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-tosca-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-tosca-600 font-semibold">BH</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          Budi Hartono
                        </p>
                        <p className="text-sm text-gray-600">Nasabah KPR</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16">
              <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
                  Pertanyaan Umum
                </h2>
                <div className="space-y-6">
                  <details className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <summary className="font-semibold text-gray-800 cursor-pointer hover:text-tosca-400 transition-colors">
                      Bagaimana cara memulai investasi properti?
                    </summary>
                    <p className="mt-4 text-gray-600 leading-relaxed">
                      Mulai dengan konsultasi gratis bersama tim kami. Kami akan
                      membantu menganalisis kebutuhan, budget, dan tujuan
                      investasi Anda untuk menemukan properti yang tepat.
                    </p>
                  </details>

                  <details className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <summary className="font-semibold text-gray-800 cursor-pointer hover:text-tosca-400 transition-colors">
                      Apakah ada biaya konsultasi?
                    </summary>
                    <p className="mt-4 text-gray-600 leading-relaxed">
                      Konsultasi awal dengan tim kami sepenuhnya gratis. Kami
                      akan memberikan analisis mendalam tentang pilihan properti
                      dan strategi investasi tanpa biaya tambahan.
                    </p>
                  </details>

                  <details className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <summary className="font-semibold text-gray-800 cursor-pointer hover:text-tosca-400 transition-colors">
                      Bagaimana proses pengajuan KPR?
                    </summary>
                    <p className="mt-4 text-gray-600 leading-relaxed">
                      Tim kami akan mendampingi seluruh proses KPR mulai dari
                      persiapan dokumen, pengajuan ke bank, hingga pencairan
                      dana. Kami bekerja sama dengan berbagai bank untuk
                      memberikan pilihan terbaik.
                    </p>
                  </details>

                  <details className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <summary className="font-semibold text-gray-800 cursor-pointer hover:text-tosca-400 transition-colors">
                      Apakah properti yang ditawarkan sudah legal?
                    </summary>
                    <p className="mt-4 text-gray-600 leading-relaxed">
                      Semua properti yang kami tawarkan telah melalui verifikasi
                      legal yang ketat. Kami memastikan semua dokumen lengkap
                      dan sah sebelum ditawarkan kepada klien.
                    </p>
                  </details>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
