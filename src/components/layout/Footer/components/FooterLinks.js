import Link from 'next/link'

export default function FooterLinks() {
  const links = [
    { text: 'Syarat dan Ketentuan', href: '#' },
    { text: 'Kebijakan Privasi', href: '#' },
  ]

  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-6 text-sm text-white">
      {links.map((link, index) => (
        <Link 
          key={index} 
          href={link.href}
          className="hover:text-gray-200 transition-colors"
        >
          {link.text}
        </Link>
      ))}
    </div>
  )
}