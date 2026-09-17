import Sidebar from "../organisms/Sidebar";
import Topbar from "../organisms/Topbar";
import Toast from "../atoms/Toast";

export default function DashboardLayout({
  halaman,
  setHalaman,
  totalProses,
  title,
  sub,
  notifications,
  email,
  onLogout,
  toastPesan,
  children,
}) {
  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-900">
      <Toast pesan={toastPesan} />
      <Sidebar halaman={halaman} setHalaman={setHalaman} totalProses={totalProses} />

      <main className="flex-1 px-8 py-7 max-w-[1600px] overflow-y-auto">
        <Topbar title={title} sub={sub} notifications={notifications} email={email} onLogout={onLogout} />
        {children}
      </main>
    </div>
  );
}

