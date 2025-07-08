import Link from 'next/link'
import { FaExternalLinkAlt, FaClock, FaCheckCircle } from 'react-icons/fa'

export default function UpcomingTasks({ loading }) {
  const tasks = [
    {
      title: "Update property images for Terravia",
      dueDate: "Tomorrow",
      priority: "high",
      status: "pending",
      completed: false
    },
    {
      title: "Review new cluster proposal",
      dueDate: "3 days",
      priority: "medium", 
      status: "in-progress",
      completed: false
    },
    {
      title: "Prepare monthly sales report",
      dueDate: "Next week",
      priority: "low",
      status: "planned", 
      completed: false
    },
    {
      title: "Update cluster pricing",
      dueDate: "2 weeks",
      priority: "medium",
      status: "planned",
      completed: false
    }
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'in-progress':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'planned':
        return 'bg-gray-50 text-gray-700 border border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getPriorityDot = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
          <p className="text-sm text-gray-600">Tasks that need your attention</p>
        </div>
        <Link 
          href="/admin/tasks" 
          className="flex items-center gap-1 text-blue-600 text-sm hover:text-blue-700 font-medium"
        >
          View All <FaExternalLinkAlt className="text-xs" />
        </Link>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 border border-gray-200 rounded-lg">
              <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <input 
                type="checkbox" 
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                defaultChecked={task.completed}
              />
              
              <div className={`w-2 h-2 rounded-full ${getPriorityDot(task.priority)}`}></div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{task.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <FaClock className="text-xs text-gray-400" />
                  <p className="text-xs text-gray-600">Due: {task.dueDate}</p>
                </div>
              </div>
              
              <div className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusStyle(task.status)}`}>
                {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}