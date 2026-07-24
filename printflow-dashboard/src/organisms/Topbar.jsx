import { warna } from "../styles/theme";
import NotificationBell from "../molecules/NotificationBell";
import ProfileMenu from "../molecules/ProfileMenu";

export default function Topbar({ title, sub, notifications, email, onLogout }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#FFFFFF" }}>{title}</h1>
        <p style={{ fontSize: 13, fontWeight: 400, color: warna.teksSekunder }} className="mt-0.5">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell notifications={notifications} />
        <ProfileMenu email={email} onLogout={onLogout} />
      </div>
    </div>
  );
}
