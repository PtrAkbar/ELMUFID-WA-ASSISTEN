import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";
import { warna, gradien, bayangan } from "../styles/theme";
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
          className="mt-auto rounded-3xl p-4 cursor-pointer"
          style={{ background: warna.bgSekunder, border: `1px solid ${warna.garis}`, transition: "background 0.2s ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = warna.hover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = warna.bgSekunder)}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: gradien.aksenIkon, boxShadow: bayangan.glowKecil }}>
              <Smartphone size={16} strokeWidth={2.3} className="text-white" />
            </div>
            <div className="text-left leading-tight">
              <p style={{ fontSize: 13, fontWeight: 700, color: warna.teksUtama }}>WA terhubung</p>
              <p style={{ fontSize: 12, fontWeight: 500, color: warna.teksSekunder }}>{number}</p>
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
      <div className="mt-auto rounded-3xl p-4 text-center" style={{ background: warna.bgSekunder, border: `1px solid ${warna.garis}` }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: warna.teksSekunder }} className="leading-relaxed">
          Sambungkan nomor WA toko biar order masuk otomatis
        </p>
        <button
          onClick={() => setQrOpen(true)}
          className="mt-3 w-full text-white rounded-full py-2"
          style={{ background: gradien.aksenTombol, boxShadow: bayangan.glowKecil, fontSize: 12, fontWeight: 600, transition: "filter 0.2s ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.12)")}
          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
        >
          Hubungkan WA
        </button>
      </div>
      <WaQrModal open={qrOpen} onClose={() => setQrOpen(false)} status={status} qr={qr} />
    </>
  );
}
