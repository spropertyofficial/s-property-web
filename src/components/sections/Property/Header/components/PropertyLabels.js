export default function PropertyLabels({ transaction, developer }) {
    return (
      <div className="flex gap-2">
        {transaction && (
          <span className="px-3 py-1 bg-gray-300 text-white text-sm rounded">
            {transaction}
          </span>
        )}
        {developer && (
          <span className="px-3 py-1 bg-tosca-200 text-white text-sm rounded">
            {developer}
          </span>
        )}
      </div>
    )
  }