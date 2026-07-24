import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut } from "lucide-react";
import { warna, gradien, bayangan } from "../styles/theme";
import { dropdownMotion } from "../utils/motion";

export default function ProfileMenu({ email, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <div
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 cursor-pointer"
        style={{ background: warna.kartu, border: `1px solid ${warna.garis}`, transition: "background 0.2s ease" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = warna.hover)}
        onMouseLeave={(e) => (e.currentTarget.style.background = warna.kartu)}
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: gradien.aksen, boxShadow: bayangan.glowKecil, fontSize: 12, fontWeight: 700 }}>
          A
        </div>
        <div className="leading-tight text-left">
          <p style={{ fontSize: 13, fontWeight: 600, color: warna.teksUtama }}>Admin Toko</p>
          <p style={{ fontSize: 12, fontWeight: 500, color: warna.teksSekunder }}>EL-MUFID</p>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronDown size={14} style={{ color: warna.teksSekunder }} />
        </motion.div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 10 }} />
            <motion.div
              className="absolute rounded-2xl overflow-hidden"
              style={{
                top: "120%", right: 0, minWidth: 160, background: warna.kartu,
                border: `1px solid ${warna.garis}`,
                boxShadow: bayangan.dropdown, zIndex: 20, transformOrigin: "top right",
              }}
              {...dropdownMotion}
            >
              {email && (
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${warna.garis}` }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: warna.teksUtama }}>{email}</p>
                </div>
              )}
              <div
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="flex items-center gap-2 cursor-pointer"
                style={{ fontSize: 13, fontWeight: 600, color: warna.muda, padding: "10px 14px", transition: "background 0.15s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = warna.hover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <LogOut size={14} /> Logout
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
