import ActionButtons from './components/ActionButtons'
import PropertyLabels from './components/PropertyLabels'

export default function Header({ title, price, city, country, developer, transaction}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-start">
        <PropertyLabels transaction={transaction} developer={developer} />
        <ActionButtons />
      </div>

      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      <div className="text-lg font-bold text-gray-900">{price}</div>
    </div>
  )
}