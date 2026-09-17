import { useEffect, useState } from "react";
import { Smartphone, CheckCircle2 } from "lucide-react";
import { useWaStatus } from "../hooks/useWaStatus";
import WaQrModal from "./WaQrModal";
import WaProfileModal from "./WaProfileModal";

export default function WaConnect() {
  const { status, qr, number, logout } = useWaStatus();
  const [qrOpen, setQrOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (status === "connected" && qrOpen) setQrOpen(false);
  }, [status, qrOpen]);

  if (status === "connected") {
    return (
      <>
        <div
          onClick={() => setProfileOpen(true)}
          className="mt-auto rounded-2xl p-3.5 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/70 transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <CheckCircle2 size={18} strokeWidth={2.4} />
            </div>
            <div className="text-left leading-tight truncate">
              <p className="text-sm font-bold text-slate-900">WA Terhubung</p>
              <p className="text-xs font-semibold text-emerald-700 font-mono mt-1 truncate">{number}</p>
            </div>
          </div>
        </div>
        <WaProfileModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          nomor={number}
          onLogout={() => {
            logout();
            setProfileOpen(false);
          }}
        />
      </>
    );
  }

  return (
    <>
      <div className="mt-auto rounded-2xl p-4 text-center bg-slate-50 border border-slate-200/70">
        <div className="w-10 h-10 rounded-xl mx-auto mb-2.5 flex items-center justify-center bg-emerald-100 text-emerald-700 shadow-sm">
          <Smartphone size={18} strokeWidth={2.2} />
        </div>
        <p className="text-sm font-bold text-slate-900">WhatsApp Toko</p>
        <p className="text-xs text-slate-500 mt-1 leading-snug">
          Hubungkan bot WA toko agar pesanan tercatat otomatis
        </p>
        <button
          type="button"
          onClick={() => setQrOpen(true)}
          className="mt-3.5 w-full text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-600/25"
        >
          Hubungkan WhatsApp
        </button>
      </div>
      <WaQrModal open={qrOpen} onClose={() => setQrOpen(false)} status={status} qr={qr} />
    </>
  );
}


