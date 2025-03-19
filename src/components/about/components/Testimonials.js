import Image from "next/image";

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "Inovasi serta visi misi yang sangat milenial dan menghargai setiap Agent untuk dapat berkembang. Dengan komisi yang super wow, yakni pembagian komisi 90:10. S-Property diburu karena mutu, teratas karena kualitas.",
      name: "Andre",
      role: "Agent S-Property",
      image: "/images/AboutPage/andre.jpg",
    },
    {
      quote:
        "Saya sangat senang karena di S-Property saya dibimbing dan mendapatkan support yang luar biasa, dari hanya ibu rumah tangga hingga mendapatkan income tambahan lewat bisnis properti.",
      name: "Rini",
      role: "Agent S-Property",
      image: "/images/main-logo.webp",
    },
    {
      quote:
        "Pelayanan agent baik dan memuaskan. Projek yang di kerjakan cukup banyak jadi memudahkan saya dalam memilih rumah yang saya inginkan.",
      name: "Sri Rahayu",
      role: "Customer",
      image: "/images/AboutPage/sri-rahayu.jpg",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            Apa Kata Mereka
          </h2>
          <div className="w-16 h-1 bg-tosca-500 mx-auto mb-4"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Pengalaman para klien dan mitra yang telah bekerja sama dengan
            S-Property.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 p-6 rounded-lg shadow-sm relative flex flex-col"
            >
              {/* Content */}
              <div className="relative z-10 flex-grow mb-5">
                <p className="text-gray-600 italic">{testimonial.quote}</p>
              </div>

              {/* Profile - Positioned at the bottom */}
              <div className="relative z-10 mt-auto">
                <div className="flex items-center">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0 mr-3">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-tosca-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="#"
            className="inline-flex items-center text-tosca-500 hover:text-tosca-600 font-medium"
          >
            Lihat lebih banyak testimonial
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
