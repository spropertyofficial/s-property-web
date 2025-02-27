import Image from 'next/image'
import BurgerMenu from './components/BurgerMenu'
import Link from 'next/link'

export default function Header() {
  return (
    <div className="w-full sticky top-0 z-50">
      {/* Header section */}
      <div className="bg-white">
        <div className="px-6">
          <div className="flex items-center justify-between">
            <BurgerMenu />
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
            <div className="w-8"></div>
          </div>
        </div>
      </div>
    </div>
  )
}