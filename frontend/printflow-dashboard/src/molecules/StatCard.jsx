export default function StatCard({ label, value, note, bg = "#EFF6FF", icon, iconColor = "text-blue-600", iconBg = "bg-white" }) {
  return (
    <div
      className="rounded-3xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-default flex flex-col justify-between border border-slate-200/60 shadow-sm relative overflow-hidden"
      style={{ backgroundColor: bg }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-slate-800 tracking-tight">{label}</p>
        {icon && (
          <div className={`w-10 h-10 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center shadow-sm shrink-0`}>
            {icon}
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-none mb-2">
          {value}
        </div>
        {note && (
          <div className="text-xs md:text-sm font-semibold text-slate-600 flex items-center gap-1.5">
            {note}
          </div>
        )}
      </div>
    </div>
  );
}


