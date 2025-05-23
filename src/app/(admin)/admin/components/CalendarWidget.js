import { FaCalendarAlt } from 'react-icons/fa'

export default function CalendarWidget({ loading }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-500">Calendar</h2>
        <div className="text-sm text-gray-300">June 2024</div>
      </div>
      
      {loading ? (
        <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <FaCalendarAlt className="text-gray-300 text-5xl" />
        </div>
      )}
    </div>
  )
}