import { warna, gradien } from "../styles/theme";
import Sidebar from "../organisms/Sidebar";
import Topbar from "../organisms/Topbar";
import Toast from "../atoms/Toast";

// Template Atomic Design: kerangka tata letak dashboard (sidebar + topbar +
// area konten), tanpa data spesifik halaman -- tiap halaman (pages/) tinggal
// mengisi children-nya sendiri lewat App.jsx.
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
    <div style={{ fontFamily: "'Inter', sans-serif", color: warna.teksUtama, background: gradien.latar }} className="min-h-screen flex">
      <Toast pesan={toastPesan} />
      <Sidebar halaman={halaman} setHalaman={setHalaman} totalProses={totalProses} />

      <main className="flex-1 p-6">
        <Topbar title={title} sub={sub} notifications={notifications} email={email} onLogout={onLogout} />
        {children}
      </main>
    </div>
  );
}
