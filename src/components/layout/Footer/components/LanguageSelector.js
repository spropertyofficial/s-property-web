export default function LanguageSelector() {
    return (
      <div className="flex justify-center gap-4 text-sm text-white mb-4">
        <button className="hover:text-gray-100 transition-colors">Indonesia</button>
        <span>|</span>
        <button className="hover:text-gray-100 transition-colors">English</button>
      </div>
    )
  }