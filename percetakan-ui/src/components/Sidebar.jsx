import { LayoutDashboard, ListChecks, Package, Clock, Settings } from "lucide-react";
import { warna } from "../styles/theme";
import logo from "../assets/logo.png";
import SideNav from "./SideNav";
import WaConnect from "./WaConnect";

export default function Sidebar({ halaman, setHalaman, totalProses }) {
  return (
    <aside className="w-60 flex flex-col p-5" style={{ background: warna.sidebar, borderRight: `1px solid ${warna.garis}` }}>
      <div className="flex items-center mb-8 px-1">
        <img src={logo} alt="El Mufid Printing" className="h-11 w-full object-contain" />
      </div>

      <p style={{ fontSize: 12, fontWeight: 700, color: warna.teksSekunder, letterSpacing: 0.5 }} className="mb-2 px-2">OVERVIEW</p>
      <nav className="flex flex-col gap-1 mb-6">
        <SideNav icon={<LayoutDashboard size={17} strokeWidth={2.3} />} label="Dashboard" active={halaman === "dashboard"} onClick={() => setHalaman("dashboard")} />
        <SideNav icon={<ListChecks size={17} strokeWidth={2.3} />} label="Order" active={halaman === "order"} badge={totalProses} onClick={() => setHalaman("order")} />
      </nav>

      <p style={{ fontSize: 12, fontWeight: 700, color: warna.teksSekunder, letterSpacing: 0.5 }} className="mb-2 px-2">GUDANG</p>
      <nav className="flex flex-col gap-1 mb-6">
        <SideNav icon={<Package size={17} strokeWidth={2.3} />} label="Stock" active={halaman === "stock"} onClick={() => setHalaman("stock")} />
      </nav>

      <p style={{ fontSize: 12, fontWeight: 700, color: warna.teksSekunder, letterSpacing: 0.5 }} className="mb-2 px-2">LAINNYA</p>
      <nav className="flex flex-col gap-1">
        <SideNav icon={<Clock size={17} strokeWidth={2.3} />} label="Riwayat" active={halaman === "riwayat"} onClick={() => setHalaman("riwayat")} />
        <SideNav icon={<Settings size={17} strokeWidth={2.3} />} label="Kustomisasi" active={halaman === "kustomisasi"} onClick={() => setHalaman("kustomisasi")} />
      </nav>

      <WaConnect />
    </aside>
  );
}
