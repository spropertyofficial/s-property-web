"use client";

export default function LeaderboardTable({ data }) {
  // Di masa depan, Anda bisa menambahkan logika sorting di sini
  const sortedData = [...data].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-slate-500">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
          <tr>
            <th className="px-6 py-3">Nama Mitra</th>
            <th className="px-6 py-3 text-center">Listing Baru</th>
            <th className="px-6 py-3 text-center">Survei Klien</th>
            <th className="px-6 py-3 text-center">Sesi Live</th>
            <th className="px-6 py-3 text-center">Skor Aktivitas</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((agent) => (
            <tr
              key={agent.name}
              className="bg-white border-b hover:bg-slate-50"
            >
              <td className="px-6 py-4 font-medium text-slate-900">
                {agent.name}
              </td>
              <td className="px-6 py-4 text-center">{agent.newListings}</td>
              <td className="px-6 py-4 text-center">{agent.surveys}</td>
              <td className="px-6 py-4 text-center">{agent.liveSessions}</td>
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
