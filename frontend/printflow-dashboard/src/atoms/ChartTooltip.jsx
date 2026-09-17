export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white rounded-2xl px-4 py-2.5 shadow-xl shadow-slate-900/10 border border-slate-100 text-left pointer-events-none">
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-sm font-bold text-slate-900 mt-0.5">{payload[0].value} order</p>
    </div>
  );
}

