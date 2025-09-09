"use client";

export default function LeadInfoPanel({ conversation, onToggleAssign }){
  if(!conversation){
    return <div className="h-full grid place-items-center text-slate-400 p-4 text-center"><div><div className="text-4xl mb-4">👤</div><div className="font-bold">Informasi Lead</div><div className="text-sm">Detail kontak dan properti yang diminati akan muncul di sini.</div></div></div>;
  }
  const lead = conversation.lead;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
        <div>
          <div className="font-medium text-slate-900">Detail Prospek</div>
          <div className="text-xs text-slate-500">Ringkasan CRM</div>
        </div>
      </div>

  <div className="p-4 space-y-4 overflow-y-auto flex-1">
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-xl mr-4">{getInitials(lead.name)}</div>
            <div>
              <p className="font-bold text-lg">{lead.name}</p>
              <p className="text-sm text-slate-500">{lead.phone}</p>
            </div>
          </div>
        </div>
        <div className="text-sm space-y-3">
          <div>
            <p className="text-slate-500">Sumber</p>
            <p className="font-semibold">{lead.source || '-'}</p>
          </div>
          <div>
            <p className="text-slate-500">Status</p>
            <p className="font-semibold">{lead.status || '-'}</p>
          </div>
        </div>

        <h3 className="text-lg font-bold border-b pb-2 pt-2">Properti Diminati</h3>
        <div className="text-sm space-y-3">
          <div>
            <p className="text-slate-500">Nama Properti</p>
            <p className="font-semibold">{lead.property?.name || '-'}</p>
          </div>
          <div>
            <p className="text-slate-500">Harga Mulai</p>
            <p className="font-semibold">{formatIDR(lead.property?.price)}</p>
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500 mb-1">Penugasan</div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${conversation.assignedToMe?"bg-green-100 text-green-700":"bg-slate-100 text-slate-600"}`}>{conversation.assignedToMe?"Milik Saya":"Belum Ditugaskan"}</span>
            <button onClick={onToggleAssign} className="text-xs px-2 py-1 border rounded-lg hover:bg-white">{conversation.assignedToMe?"Lepaskan":"Ambil"}</button>
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500 mb-1">Tag</div>
          <div className="flex flex-wrap gap-2">
            {(conversation.tags||[]).length===0 ? <span className="text-xs text-slate-400">-</span> : conversation.tags.map(t => (
              <span key={t} className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{t}</span>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500 mb-1">Catatan</div>
          <textarea rows={3} placeholder="Tulis catatan internal..." className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
      </div>

      <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-end gap-2">
        <button className="px-3 py-2 text-sm border rounded-lg hover:bg-white">Tandai Selesai</button>
        <button className="px-3 py-2 text-sm rounded-lg bg-teal-600 text-white hover:bg-teal-700">Simpan</button>
      </div>
    </div>
  );
}

function getInitials(name){
  return name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
}

function formatIDR(n){
  if(!n && n!==0) return '-';
  try{
    return new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', minimumFractionDigits: 0 }).format(n);
  }catch{
    return `${n}`;
  }
}
