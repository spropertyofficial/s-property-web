export default function UserView() {
  return (
    <>
      <div className="w-full bg-gradient-to-br from-tosca-50 to-tosca-100 py-12 px-4 md:px-8 rounded-xl my-8 border border-tosca-200">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon Section */}
          <div className="mb-8">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-tosca-400 mb-4">
              Simulasi KPR Eksklusif
            </h2>
            <div className="w-24 h-1 bg-tosca-300 mx-auto rounded-full"></div>
          </div>

          {/* Main Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 md:p-10 shadow-xl border border-white/50">
            <div className="mb-8">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
                Akses Terbatas untuk Member Agent
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Fitur simulasi KPR ini khusus tersedia untuk agent terdaftar
                S-Property. Dapatkan akses ke tools profesional untuk membantu
                klien Anda.
              </p>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-start space-x-4 text-left">
                <div className="bg-tosca-100 p-2 rounded-lg flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-tosca-400"
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
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    Database Bank
                  </h4>
                  <p className="text-sm text-gray-600">
                    Akses ke 15+ bank rekanan dengan suku bunga terbaru
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 text-left">
                <div className="bg-tosca-100 p-2 rounded-lg flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-tosca-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    Dokumen Lengkap
                  </h4>
                  <p className="text-sm text-gray-600">
                    Panduan dokumen KPR dan checklist persyaratan
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 text-left">
                <div className="bg-tosca-100 p-2 rounded-lg flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-tosca-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    Analisis Cepat
                  </h4>
                  <p className="text-sm text-gray-600">
                    Hasil simulasi real-time untuk presentasi klien
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-4 mb-8 py-6 border-t border-b border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-tosca-400 mb-1">
                  15+
                </div>
                <div className="text-sm text-gray-600">Bank Rekanan</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-tosca-400 mb-1">
                  1000+
                </div>
                <div className="text-sm text-gray-600">Simulasi Berhasil</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-tosca-400 mb-1">
                  24/7
                </div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/login"
                className="inline-flex items-center justify-center bg-tosca-400 text-white px-8 py-4 rounded-xl font-semibold hover:bg-tosca-500 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
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
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Login sebagai Agent
              </a>

              <a
                href="/join-s-pro"
                className="inline-flex items-center justify-center bg-white text-tosca-400 border-2 border-tosca-400 px-8 py-4 rounded-xl font-semibold hover:bg-tosca-400 hover:text-white transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
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
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                Daftar Agent Baru
              </a>
            </div>

            {/* Contact Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-600 mb-4">
                Butuh bantuan atau informasi lebih lanjut?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://wa.me/6285123123891"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                  WhatsApp: +62 851-2312-3891
                </a>
                <span className="hidden sm:inline text-gray-400">|</span>
                <a
                  href="mailto:admin@sproperty.co.id"
                  className="inline-flex items-center justify-center text-tosca-400 hover:text-tosca-500 font-medium transition-colors duration-200"
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
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  admin@sproperty.co.id
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="mt-6 text-sm text-gray-500">
            <p>
              <span className="inline-flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Akses aman dan terpercaya
              </span>{" "}
              • Bergabung dengan agent profesional S-Property
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
