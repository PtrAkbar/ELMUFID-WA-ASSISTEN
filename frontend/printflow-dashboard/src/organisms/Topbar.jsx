import NotificationBell from "../molecules/NotificationBell";
import ProfileMenu from "../molecules/ProfileMenu";

export default function Topbar({ title, sub, notifications, email, onLogout }) {
  return (
    <div className="flex items-center justify-between mb-8 pb-3 border-b border-slate-100">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
          <span className="hover:text-blue-600 transition-colors cursor-pointer">Dashboards</span>
          <span className="text-slate-300">/</span>
          <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">EL-MUFID</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell notifications={notifications} />
        <ProfileMenu email={email} onLogout={onLogout} />
      </div>
    </div>
  );
}


