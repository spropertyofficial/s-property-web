import Image from 'next/image'
import BurgerMenu from './components/BurgerMenu'
import Link from 'next/link'
import Navigation from './components/Navigation'

export default function Header() {
  return (
    <div className="w-full sticky top-0 z-50">
      <div className="bg-white">
        <div className="px-6 lg:px-20">
          <div className="flex flex-row-reverse md:flex-row items-center justify-between py-4">
            {/* Mobile Menu */}
            <div className="block lg:hidden">
              <BurgerMenu />
            </div>
            
            {/* Logo */}
            <Link href="/">
              <Image
                src="/images/logo.webp"
                alt="S-Property"
                width={120}
                height={40}
                className="w-auto h-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <Navigation />
            </div>

            {/* Spacer for mobile */}
            <div className="w-8 lg:hidden"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
