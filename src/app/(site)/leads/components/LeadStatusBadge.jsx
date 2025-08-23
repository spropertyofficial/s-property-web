import { Flame, Snowflake, Clock, PhoneOff, Handshake, CheckCircle2, FileCheck, Sparkles, Sun } from "lucide-react";

const STATUS_META = {
  Baru: {
    cls: 'bg-green-100 text-green-700 border border-green-200',
    Icon: Sparkles
  },
  Hot: {
    cls: 'bg-orange-100 text-orange-700 border border-orange-200',
    Icon: Flame
  },
  Warm: {
    cls: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    Icon: Sun
  },
  Cold: {
    cls: 'bg-blue-100 text-blue-700 border border-blue-200',
    Icon: Snowflake
  },
  Reservasi: {
    cls: 'bg-violet-100 text-violet-700 border border-violet-200',
    Icon: Handshake
  },
  Booking: {
    cls: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
    Icon: FileCheck
  },
  Closing: {
    cls: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    Icon: CheckCircle2
  },
  'No Respond': {
    cls: 'bg-gray-200 text-gray-600 border border-gray-300',
    Icon: PhoneOff
  }
};

export default function LeadStatusBadge({ status }) {
  const meta = STATUS_META[status];
  if (!meta) return <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-600">{status}</span>;
  const { cls, Icon } = meta;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${cls}`}> 
      <Icon size={12} />
      {status}
    </span>
  );
}
