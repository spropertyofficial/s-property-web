import Image from "next/image";

export default function VisionMission() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            Visi & Misi Kami
          </h2>
          <div className="w-16 h-1 bg-tosca-500 mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-tosca-500 shadow-sm">
              <h3 className="text-xl font-semibold text-tosca-600 mb-3">
                Visi
              </h3>
              <p className="text-gray-700">
                S-Property menjadi kantor Property Agent terpercaya yang
                memberikan nilai lebih bagi semua pihak, baik Customer,
                Developer maupun Agent Partner. Didukung dengan solusi yang
                inovatif, layanan profesional, dan hubungan yang berlandaskan
                kepercayaan serta integritas.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-tosca-500 shadow-sm">
              <h3 className="text-xl font-semibold text-tosca-600 mb-3">
                Misi
              </h3>
              <p className="text-gray-700 mb-4">Kami berkomitmen untuk:</p>
              <ul className="space-y-4">
                <li className="flex">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-tosca-500 flex items-center justify-center mr-3 mt-1">
                    <span className="text-white text-xs">1</span>
                  </div>
                  <p className="text-gray-700">
                    Menyediakan properti yang sesuai dengan kebutuhan dan impian
                    pelanggan, didukung oleh layanan personal dan profesional.
                  </p>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-tosca-500 flex items-center justify-center mr-3 mt-1">
                    <span className="text-white text-xs">2</span>
                  </div>
                  <p className="text-gray-700">
                    Memberikan strategi pemasaran yang efektif dan menciptakan
                    nilai tambah dalam pengelolaan properti.
                  </p>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-tosca-500 flex items-center justify-center mr-3 mt-1">
                    <span className="text-white text-xs">3</span>
                  </div>
                  <p className="text-gray-700">
                    Memberikan peluang kemitraan yang saling menguntungkan dan
                    dukungan kuat untuk pengembangan karier agen properti.
                  </p>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
              <div className="relative w-full h-full">
                <Image
                  src="/images/AboutPage/podomoro-event.webp"
                  alt="S-Property Office"
                  loading="lazy"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden translate-y-8">
              <div className="relative w-full h-full">
                <Image
                  src="/images/AboutPage/podomoro-pk.webp"
                  alt="S-Property Team"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
              <div className="relative w-full h-full">
                <Image
                  src="/images/AboutPage/podomoro.webp"
                  alt="Meeting with clients"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover object-[35%_50%] hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden translate-y-8">
              <div className="relative w-full h-full">
                <Image
                  src="/images/AboutPage/sinarmas-event.webp"
                  alt="Property showcase"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
