import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

export default function CalendarWidget({ loading }) {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  
  const events = [
    { date: 15, title: "Property Review", type: "meeting" },
    { date: 22, title: "Sales Report", type: "deadline" },
    { date: 28, title: "Team Meeting", type: "meeting" }
  ];

  // Generate calendar days for current month
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const hasEvent = (day) => events.some(event => event.date === day);
  const getEventType = (day) => events.find(event => event.date === day)?.type;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Calendar</h2>
          <p className="text-sm text-gray-600">Upcoming events and deadlines</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-gray-100 rounded">
            <FaChevronLeft className="text-xs text-gray-500" />
          </button>
          <span className="text-sm font-medium text-gray-700">{currentMonth}</span>
          <button className="p-1 hover:bg-gray-100 rounded">
            <FaChevronRight className="text-xs text-gray-500" />
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
      ) : (
        <div>
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <div
                key={index}
                className={`aspect-square flex items-center justify-center text-sm relative ${
                  day === null 
                    ? '' 
                    : day === currentDate.getDate()
                    ? 'bg-blue-600 text-white rounded-lg font-medium'
                    : 'hover:bg-gray-100 rounded-lg cursor-pointer'
                }`}
              >
                {day && (
                  <>
                    <span className={day === currentDate.getDate() ? 'text-white' : 'text-gray-700'}>
                      {day}
                    </span>
                    {hasEvent(day) && (
                      <div className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${
                        getEventType(day) === 'meeting' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Upcoming Events */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Upcoming Events</h3>
            <div className="space-y-2">
              {events.map((event, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    event.type === 'meeting' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-gray-700">{event.title}</span>
                  <span className="text-gray-500">- {event.date}th</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}