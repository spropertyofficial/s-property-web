"use client";

export default function LeaderboardTable({ data, activityTypes }) {
  const sortedData = [...data].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-slate-500">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
          <tr>
            <th className="px-6 py-3">Peringkat</th>
            <th className="px-6 py-3">Nama Mitra</th>
            {activityTypes?.map((t) => (
              <th key={t.id} className="px-6 py-3 text-center">{t.name}</th>
            ))}
            <th className="px-6 py-3 text-center">Total Aktivitas</th>
            <th className="px-6 py-3 text-center">Skor Aktivitas</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((agent, index) => (
            <tr
              key={`${agent.name}-${index}`}
              className="bg-white border-b hover:bg-slate-50"
            >
              <td className="px-6 py-4 text-center">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-slate-400' : 
                  index === 2 ? 'bg-amber-600' : 
                  'bg-slate-300'
                }`}>
                  {index + 1}
                </span>
              </td>
              <td className="px-6 py-4 font-medium text-slate-900">
                <div>
                  <div className="font-semibold">{agent.name}</div>
                  {agent.agentCode && (
                    <div className="text-xs text-slate-500">
                      Code: {agent.agentCode}
                    </div>
                  )}
                </div>
              </td>
              {activityTypes?.map((t) => (
                <td key={t.id} className="px-6 py-4 text-center">{agent.counts?.[t.id] || 0}</td>
              ))}
              <td className="px-6 py-4 text-center font-semibold text-slate-700">{agent.totalActivities}</td>
              <td className="px-6 py-4 text-center font-bold text-teal-600">
                {agent.totalScore}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
