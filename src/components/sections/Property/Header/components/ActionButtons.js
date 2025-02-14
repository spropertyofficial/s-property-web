import { Share2 } from 'lucide-react'

export default function ActionButtons() {
  return (
    <div className="flex gap-2">
      <button className="p-2 border rounded-lg hover:bg-gray-50 transition-colors">
        <Share2 className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  )
}