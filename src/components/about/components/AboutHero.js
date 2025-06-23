import Image from "next/image";

export default function AboutHero() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-r from-tosca-500/10 to-tosca-500/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Bagian Teks */}
          <div className="md:w-1/2 max-w-xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
              Tentang <span className="text-tosca-500">S-Property</span>
            </h1>
            <div className="w-20 h-1 bg-tosca-500 mb-6"></div>
            <p className="text-lg text-gray-600 mb-6">
              Menjadi kantor Property Agent terpercaya yang memberikan nilai
              lebih bagi semua pihak, baik Customer, Developer maupun Agent
              Partner.
            </p>

            <p className="italic text-tosca-600 text-xl font-medium">
              &ldquo;Valuable, as You Are.&rdquo;
            </p>
          </div>
          
          {/* Bagian Gambar - Perbaikan untuk mobile */}
          <div className="md:w-1/2 relative w-full flex justify-center">
            <div className="relative w-full shadow-md bg-white h-[250px] md:h-[400px] max-w-[500px] rounded-lg">
              <Image
                src="/images/hero-image.png"
                alt="S-Property Logo"
                fill
                style={{ objectFit: 'scale-down' }}
                priority
                sizes="(max-width: 768px) 100vw, 500px"
                className="drop-shadow-xl"
              />
            </div>
            <div className="absolute bottom-4 right-4 md:-bottom-6 md:left-6 w-20 h-20 md:w-24 md:h-24 bg-tosca-400 rounded-lg shadow-lg flex items-center justify-center">
              <span className="text-white font-bold text-base md:text-lg">Est. 2025</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}