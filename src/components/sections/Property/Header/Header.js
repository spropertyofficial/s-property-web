import ActionButtons from './components/ActionButtons'
import PropertyLabels from './components/PropertyLabels'
import { MapPin } from 'lucide-react'

export default function Header({ title, price, city, country, developer, type }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <PropertyLabels type={type} developer={developer} />
        <ActionButtons />
      </div>

      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center text-gray-500">
        <MapPin className="h-4 w-4 mr-1" />
        <span>{city}, {country}</span>
      </div>

      <div className="text-2xl font-bold text-gray-900">{price}</div>
    </div>
  )
}