import { LayoutDashboard, ListChecks, Package, Clock, Settings } from "lucide-react";
import logo from "../assets/logo.png";
import SideNav from "./SideNav";
import WaConnect from "./WaConnect";

export default function Sidebar({ halaman, setHalaman, totalProses }) {
  return (
    <aside className="w-64 shrink-0 flex flex-col p-5 bg-white border-r border-slate-100 min-h-screen">
      <div className="flex items-center gap-3 mb-8 px-2 pt-1">
        <img src={logo} alt="El Mufid Printing" className="h-10 max-w-[160px] object-contain" />
      </div>

      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
        Dashboards
      </p>
      <nav className="flex flex-col gap-1.5 mb-5">
        <SideNav
          icon={<LayoutDashboard size={18} strokeWidth={2.2} />}
          label="Overview"
          active={halaman === "dashboard"}
          onClick={() => setHalaman("dashboard")}
        />
        <SideNav
          icon={<ListChecks size={18} strokeWidth={2.2} />}
          label="Order Masuk"
          active={halaman === "order"}
          badge={totalProses}
          onClick={() => setHalaman("order")}
        />
      </nav>

      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
        Gudang &amp; Bahan
      </p>
      <nav className="flex flex-col gap-1.5 mb-5">
        <SideNav
          icon={<Package size={18} strokeWidth={2.2} />}
          label="Stock Bahan"
          active={halaman === "stock"}
          onClick={() => setHalaman("stock")}
        />
      </nav>

      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
        Pengaturan
      </p>
      <nav className="flex flex-col gap-1.5 mb-6">
        <SideNav
          icon={<Clock size={18} strokeWidth={2.2} />}
          label="Riwayat Order"
          active={halaman === "riwayat"}
          onClick={() => setHalaman("riwayat")}
        />
        <SideNav
          icon={<Settings size={18} strokeWidth={2.2} />}
          label="Kustomisasi Toko"
          active={halaman === "kustomisasi"}
          onClick={() => setHalaman("kustomisasi")}
        />
      </nav>

      <WaConnect />
    </aside>
  );
}


