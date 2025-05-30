import LoginButton from "@/components/auth/LoginButton";
import Link from "next/link";

const menuItems = [
  { label: "Home", href: "/" },
  { label: "Properti", href: "/properties/residentials" },
  { label: "Join S-Pro", href: "/join-s-pro" },
  { label: "Simulasi KPR", href: "/simulasi-kpr" },
  { label: "Tentang Kami", href: "/about" },
  { label: "Kontak", href: "/contact" },
];

export default function Navigation() {
  return (
    <nav className="flex items-center gap-8">
      {menuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="relative text-tosca-300 hover:text-tosca-100 font-medium transition-colors duration-200
            after:content-[''] after:absolute after:w-full after:h-0.5 
            after:bg-tosca-100 after:left-0 after:-bottom-1 
            after:scale-x-0 hover:after:scale-x-100 
            after:transition-transform after:duration-300 after:origin-left"
        >
          {item.label}
        </Link>
      ))}
      <div className="px-3 py2">
        <LoginButton />
      </div>
    </nav>
  );
}
