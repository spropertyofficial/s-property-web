"use client";

import { useState, useEffect } from "react";
import { 
  FaUserTie, 
  FaChartLine, 
  FaHandshake, 
  FaDollarSign, 
  FaEye, 
  FaPhone,
  FaTrophy,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";

// Mock data for demonstration
const MOCK_DATA = {
  summary: {
    totalAgents: 12,
    totalActivities: 256,
    totalDeals: 18,
    totalDealValue: 2500000000
  },
  topAgents: [
    {
      _id: "1",
      agent: { name: "John Doe", agentCode: "AGT001" },
      activityScore: 195,
      performanceGrade: "A+",
      rank: 1
    },
    {
      _id: "2", 
      agent: { name: "Jane Smith", agentCode: "AGT002" },
      activityScore: 167,
      performanceGrade: "A",
      rank: 2
    },
    {
      _id: "3",
      agent: { name: "Bob Johnson", agentCode: "AGT003" },
      activityScore: 142,
      performanceGrade: "B+",
      rank: 3
    },
    {
      _id: "4",
      agent: { name: "Alice Wong", agentCode: "AGT004" },
      activityScore: 128,
      performanceGrade: "B+",
      rank: 4
    },
    {
      _id: "5",
      agent: { name: "David Lee", agentCode: "AGT005" },
      activityScore: 95,
      performanceGrade: "C+",
      rank: 5
    }
  ],
  recentActivities: [
    {
      _id: "1",
      description: "Successfully closed deal for Villa Paradise",
      agent: { name: "John Doe", agentCode: "AGT001" },
      relatedProperty: { name: "Villa Paradise" },
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      _id: "2", 
      description: "Showed property to potential buyer",
      agent: { name: "Jane Smith", agentCode: "AGT002" },
      relatedProperty: { name: "Green Garden Residence" },
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      _id: "3",
      description: "Negotiating deal for Sunset Apartment",
      agent: { name: "Bob Johnson", agentCode: "AGT003" },
      relatedProperty: { name: "Sunset Apartment" },
      createdAt: new Date(Date.now() - 10800000).toISOString()
    },
    {
      _id: "4",
      description: "Responded to client inquiry about Mountain View Villa",
      agent: { name: "Alice Wong", agentCode: "AGT004" },
      relatedProperty: { name: "Mountain View Villa" },
      createdAt: new Date(Date.now() - 14400000).toISOString()
    },
    {
      _id: "5",
      description: "Created new property listing: Beach House",
      agent: { name: "David Lee", agentCode: "AGT005" },
      relatedProperty: { name: "Beach House" },
      createdAt: new Date(Date.now() - 18000000).toISOString()
    }
  ],
  activityTypeStats: [
    { _id: "property_created", count: 45, totalValue: 0 },
    { _id: "inquiry_received", count: 89, totalValue: 0 },
    { _id: "inquiry_responded", count: 76, totalValue: 0 },
    { _id: "property_shown", count: 34, totalValue: 0 },
    { _id: "deal_negotiated", count: 28, totalValue: 0 },
    { _id: "deal_closed", count: 18, totalValue: 2500000000 },
    { _id: "client_contacted", count: 112, totalValue: 0 },
    { _id: "login", count: 324, totalValue: 0 }
  ]
};

export default function KPIDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch real data first
      const response = await fetch(`/api/kpi/dashboard?period=${period}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardData(data);
          setUseMockData(false);
        } else {
          throw new Error(data.error || "Failed to fetch dashboard data");
        }
      } else {
        throw new Error("API request failed");
      }
    } catch (err) {
      console.warn("Failed to fetch real data, using mock data:", err.message);
      // Fall back to mock data if real API fails
      setDashboardData({
        success: true,
        summary: MOCK_DATA.summary,
        topAgents: MOCK_DATA.topAgents,
        recentActivities: MOCK_DATA.recentActivities,
        activityTypeStats: MOCK_DATA.activityTypeStats
      });
      setUseMockData(true);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const periodOptions = [
    { value: "daily", label: "Today" },
    { value: "weekly", label: "This Week" },
    { value: "monthly", label: "This Month" },
    { value: "quarterly", label: "This Quarter" },
    { value: "yearly", label: "This Year" }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getGradeColor = (grade) => {
    const colors = {
      "A+": "text-green-600 bg-green-50",
      "A": "text-green-600 bg-green-50",
      "B+": "text-blue-600 bg-blue-50",
      "B": "text-blue-600 bg-blue-50",
      "C+": "text-yellow-600 bg-yellow-50",
      "C": "text-yellow-600 bg-yellow-50",
      "D": "text-orange-600 bg-orange-50",
      "F": "text-red-600 bg-red-50"
    };
    return colors[grade] || "text-gray-600 bg-gray-50";
  };

  if (error && !useMockData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <FaEye className="text-red-500 mr-2" />
          <span className="text-red-700">Error: {error}</span>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const summaryStats = dashboardData?.summary ? [
    {
      title: "Total Agents",
      value: dashboardData.summary.totalAgents,
      icon: FaUserTie,
      color: "blue"
    },
    {
      title: "Total Activities",
      value: dashboardData.summary.totalActivities,
      icon: FaChartLine,
      color: "green"
    },
    {
      title: "Deals Closed",
      value: dashboardData.summary.totalDeals,
      icon: FaHandshake,
      color: "purple"
    },
    {
      title: "Total Deal Value",
      value: formatCurrency(dashboardData.summary.totalDealValue || 0),
      icon: FaDollarSign,
      color: "yellow"
    }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Demo Notice */}
      {useMockData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <FaEye className="text-blue-500 mr-2" />
            <span className="text-blue-700">Demo Mode: Showing mock data for demonstration</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KPI Production Dashboard</h1>
          <p className="text-gray-600">Monitor agent activities and performance metrics</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaArrowUp className="rotate-45" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {summaryStats.map((stat, index) => {
          const IconComponent = stat.icon;
          const colorClasses = {
            blue: "bg-blue-50 text-blue-600 border-blue-100",
            green: "bg-green-50 text-green-600 border-green-100", 
            purple: "bg-purple-50 text-purple-600 border-purple-100",
            yellow: "bg-yellow-50 text-yellow-600 border-yellow-100"
          };
          
          return (
            <div key={index} className={`bg-white rounded-lg border ${colorClasses[stat.color]?.split(' ')[2]} p-6 shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  {loading ? (
                    <div className="h-8 w-20 bg-gray-200 animate-pulse rounded mt-2"></div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                  <IconComponent className="text-xl" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Performing Agents */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FaTrophy className="text-yellow-500" />
            Top Performing Agents
          </h3>
          <p className="text-sm text-gray-600">Ranked by activity score</p>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : dashboardData?.topAgents?.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.topAgents.map((agent, index) => (
                <div key={agent._id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? "bg-yellow-500" : 
                      index === 1 ? "bg-gray-400" :
                      index === 2 ? "bg-orange-400" : "bg-gray-300"
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{agent.agent?.name}</p>
                      <p className="text-sm text-gray-600">{agent.agent?.agentCode}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{agent.activityScore}</p>
                      <p className="text-sm text-gray-600">Activity Score</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(agent.performanceGrade)}`}>
                      {agent.performanceGrade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No agent performance data available</p>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FaChartLine className="text-blue-500" />
            Recent Activities
          </h3>
          <p className="text-sm text-gray-600">Latest agent activities</p>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                  <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : dashboardData?.recentActivities?.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentActivities.map((activity) => (
                <div key={activity._id} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaPhone className="text-blue-600 text-sm" />
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-600">
                      {activity.agent?.name} ({activity.agent?.agentCode})
                      {activity.relatedProperty && ` • ${activity.relatedProperty.name}`}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString("id-ID")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleTimeString("id-ID", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No recent activities</p>
          )}
        </div>
      </div>

      {/* Activity Statistics */}
      {dashboardData?.activityTypeStats?.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Activity Statistics</h3>
            <p className="text-sm text-gray-600">Breakdown by activity type</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.activityTypeStats.map((stat) => (
                <div key={stat._id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {stat._id.replace(/_/g, " ")}
                    </span>
                    <span className="text-lg font-bold text-gray-900">{stat.count}</span>
                  </div>
                  {stat.totalValue > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Value: {formatCurrency(stat.totalValue)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}