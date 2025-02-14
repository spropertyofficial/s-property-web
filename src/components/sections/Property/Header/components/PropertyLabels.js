export default function PropertyLabels({ type, developer }) {
    return (
      <div className="flex gap-2">
        <span className="px-3 py-1 bg-gray-300 text-white text-sm rounded">
          {type}
        </span>
        {developer && (
          <span className="px-3 py-1 bg-tosca-200 text-white text-sm rounded">
            {developer}
          </span>
        )}
      </div>
    )
  }