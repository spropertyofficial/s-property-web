export default function CompanyValues() {
    const values = [
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-tosca-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        ),
        title: "Integritas",
        description: "Kami berpegang teguh pada kejujuran dan transparansi dalam setiap interaksi dengan klien dan mitra."
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-tosca-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        title: "Inovasi",
        description: "Terus mengembangkan solusi kreatif dan inovatif untuk memenuhi kebutuhan pasar properti yang dinamis."
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-tosca-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
        title: "Kolaborasi",
        description: "Menciptakan hubungan yang saling menguntungkan dengan semua pemangku kepentingan dalam industri properti."
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-tosca-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
        title: "Profesionalisme",
        description: "Memberikan standar layanan tertinggi dengan pengetahuan mendalam tentang pasar properti."
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-tosca-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        ),
        title: "Nilai Tambah",
        description: "Selalu berusaha memberikan lebih dari yang diharapkan untuk meningkatkan nilai properti dan pengalaman klien."
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-tosca-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        title: "Komisi",
        description: "Sistem komisi 90:10 yang inovatif, memberikan penghargaan lebih besar kepada agen untuk kerja keras mereka."
      }
    ];
  
    return (
      <section className="py-16 bg-tosca-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Nilai-Nilai Kami</h2>
            <div className="w-16 h-1 bg-tosca-500 mx-auto mb-4"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Prinsip-prinsip yang menjadi landasan kami dalam memberikan layanan terbaik dan membangun hubungan jangka panjang.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-tosca-500/20 flex items-center justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{value.title}</h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }