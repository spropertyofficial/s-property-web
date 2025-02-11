import Link from 'next/link'
import { Instagram, Facebook, Youtube, Tiktok } from 'lucide-react'

export default function SocialLinks() {
  const socialMedia = [
    { icon: <Instagram size={20} />, href: "#" },
    { icon: <Facebook size={20} />, href: "#" },
    { icon: <Youtube size={20} />, href: "#" },

  ]

  return (
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
  )
}