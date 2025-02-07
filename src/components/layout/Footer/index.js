import Image from "next/image";
import Link from "next/link";
import { Instagram, Facebook, Youtube } from "lucide-react";

export default function Footer() {
  const socialMedia = [
    { icon: <Instagram size={20} />, href: "#" },
    { icon: <Facebook size={20} />, href: "#" },
    { icon: <Youtube size={20} />, href: "#" },
  ];

  return (
    <footer className="bg-tosca-200 text-white px-6 py-8">
      {/* Logo */}
      <div className="flex justify-center">
        <Image
          src="/images/footer-logo.webp"
          alt="S-Property Logo"
          width={120}
          height={0}
        />
      </div>
      {/* Social Media */}
      <div className="flex justify-center gap-4 mb-6">
        {socialMedia.map((social, index) => (
          <Link
            key={index}
            href={social.href}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center
                     hover:bg-white/20 transition-colors"
          >
            {social.icon}
          </Link>
        ))}
      </div>

      {/* Language Selector */}
      <div className="flex justify-center gap-4 text-sm text-white mb-4">
        <button className="hover:text-white/20 transition-colors">
          Indonesia
        </button>
        <span>|</span>
        <button className="hover:text-white/20 transition-colors">English</button>
      </div>

      {/* Copyright */}
      <div className="text-center text-sm text-white">
        © 2025 S-Property. Hak cipta dilindungi.
      </div>
    </footer>
  );
}
