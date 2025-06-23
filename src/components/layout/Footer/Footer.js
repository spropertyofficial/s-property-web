import Link from "next/link";
import Image from "next/image";
// Impor ikon dari React Icons
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";

export default function Footer() {
  // Data untuk navigasi agar mudah dikelola
  const navLinks = [
    { text: "Beranda", href: "/" },
    { text: "Tentang Kami", href: "/tentang-kami" },
    { text: "Tipe Rumah", href: "/tipe-rumah" },
    { text: "Fasilitas & Kawasan", href: "/fasilitas" },
    { text: "Kontak", href: "/kontak" },
  ];

  // Data untuk ikon sosial media
  const socialLinks = [
    {
      href: "https://www.facebook.com/profile.php?id=61572569770701",
      icon: <FaFacebookF />,
    },
    {
      href: "https://www.instagram.com/spropertyofficial/",
      icon: <FaInstagram />,
    },
    { href: "https://www.tiktok.com/@spropertyofficial", icon: <FaTiktok /> },
  ];

  return (
    <footer className="bg-gradient-to-b from-[#0F1A2E] to-[#1a2942] text-white">
      <div className="container mx-auto px-8 py-16">
        {/* Grid utama untuk 3 kolom */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 text-center">
          {/* Kolom 1: Identitas & Deskripsi */}
          <div className="space-y-6">
            <div className="w-fit hover:opacity-90 transition-opacity">
              <Link href="/">
                <Image
                  src="/images/logos/footer-logo.png"
                  alt="S-Property Logo"
                  width={250}
                  height={50}
                  className="h-auto"
                />
              </Link>
            </div>
          </div>

          {/* Kolom 2: Navigasi Cepat */}
          <div className="md:pl-12">
            <h3 className="text-lg font-bold mb-6 text-tosca-100">
              Navigasi Cepat
            </h3>
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.text}>
                  <Link
                    href={link.href}
                    className="text-base text-gray-200 hover:text-tosca-100 hover:pl-2 transition-all duration-300"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Terhubung Dengan Kami */}
          <div className="lg:pl-8">
            <h3 className="text-lg font-bold mb-6 text-tosca-100">
              Terhubung Dengan Kami
            </h3>
            <div className="flex space-x-6 mb-8">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-200 hover:text-tosca-100 hover:scale-125 transform transition-all duration-300"
                >
                  <span className="text-2xl">{social.icon}</span>
                </a>
              ))}
            </div>
            <div className="space-y-4 text-base">
              <p className="text-gray-200 flex items-center gap-2">
                <span className="font-semibold">Email:</span>
                <a
                  href="mailto:sproperty.official@gmail.com"
                  className="hover:text-tosca-200"
                >
                  sproperty.official@gmail.com
                </a>
              </p>
              <p className="text-gray-200 flex items-center gap-2">
                <span className="font-semibold">Telp:</span>
                <a href="tel:851-2312-3891" className="hover:text-tosca-100">
                  0851-2312-3891
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Garis pemisah dan Copyright */}
        <div className="border-t border-gray-600 mt-10 pt-8 text-center">
          <p className="text-base text-gray-300">
            © {new Date().getFullYear()} S-Property. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
