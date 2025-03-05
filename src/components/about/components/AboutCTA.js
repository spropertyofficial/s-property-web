import Link from "next/link";

export default function AboutCTA() {
  return (
    <section className="py-16 bg-tosca-500">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Bergabunglah dengan S-Property
          </h2>
          <p className="text-white/90 mb-8 text-lg">
            Menjadi bagian dari keluarga kami sebagai Agent Partner atau mulai
            mencari properti impian Anda sekarang.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/join-s-pro"
              className="bg-tosca-100 text-tosca-600 hover:bg-white hover:text-tosca-100 font-semibold py-3 px-6 rounded-lg shadow-md transition-colors"
            >
              Gabung Sebagai Agent
            </Link>
            <Link
              href="/properties/residentials"
              className="bg-transparent hover:bg-tosca-600 border-2 border-white text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Lihat Properti
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
