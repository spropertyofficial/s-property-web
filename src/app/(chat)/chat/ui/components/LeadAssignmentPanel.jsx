export default function LeadAssignmentPanel({ assignedToMe, onToggleAssign }) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-1">Penugasan</div>
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-1 rounded-full ${assignedToMe ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>{assignedToMe ? "Milik Saya" : "Belum Ditugaskan"}</span>
        <button onClick={onToggleAssign} className="text-xs px-2 py-1 border rounded-lg hover:bg-white">{assignedToMe ? "Lepaskan" : "Ambil"}</button>
      </div>
    </div>
  );
}
