import { formatToShortRupiah } from '@/utils/formatCurrency'
import ActionButtons from './components/ActionButtons'
import PropertyLabels from './components/PropertyLabels'

export default function Header({ title, price, developer, transaction, type}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-start">
        <PropertyLabels transaction={transaction} developer={developer} />
        <ActionButtons />
      </div>
      {type && <h2 className="text-xs text-gray-300">{type}</h2>}
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          <div className="text-base text-gray-900">
            Start from <span className='font-semibold text-xl text-tosca-500'>
              {formatToShortRupiah(price)}
            </span>
          </div>
    </div>
  )
}