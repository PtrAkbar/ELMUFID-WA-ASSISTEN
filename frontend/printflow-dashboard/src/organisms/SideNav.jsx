export default function SideNav({ icon, label, active, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[14px] md:text-[15px] transition-all cursor-pointer text-left ${
        active
          ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`transition-colors shrink-0 ${active ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
      {badge ? (
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors ${
            active ? "bg-white text-blue-600" : "bg-blue-100 text-blue-700"
          }`}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}


