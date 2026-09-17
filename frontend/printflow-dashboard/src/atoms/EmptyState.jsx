import { Inbox } from "lucide-react";

export default function EmptyState({ pesan, tinggi = 200 }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6" style={{ minHeight: tinggi }}>
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
        <Inbox size={24} strokeWidth={2} />
      </div>
      <p className="text-sm text-slate-500 font-medium">{pesan}</p>
    </div>
  );
}

