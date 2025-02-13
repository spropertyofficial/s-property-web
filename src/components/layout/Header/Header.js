import Image from 'next/image'
import BurgerMenu from './components/BurgerMenu'

export default function Header() {
  return (
    <div className="w-full">
      {/* Header section */}
      <div className="bg-white">
        <div className="px-6">
          <div className="flex items-center justify-between">
            <button className="text-tosca-200 hover:text-tosca-50 transition-colors">
              <BurgerMenu />
            </button>
            <Image
              src="/images/logo.png"
              alt="S-Property"
              width={120}
              height={40}
              priority
            />
            <div className="w-8"></div>
          </div>
        </div>
      </div>
    </div>
  )
}