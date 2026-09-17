export default function LegendRow({ color, label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2.5">
        <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ background: color }} />
        <span className="text-slate-700 font-medium">{label}</span>
      </div>
      <span className="font-bold text-slate-900">{value}</span>
    </div>
  );
}

