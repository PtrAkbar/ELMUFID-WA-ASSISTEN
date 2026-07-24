import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { warna, bayangan } from "../styles/theme";
import { dropdownMotion } from "../utils/motion";

export default function NotificationBell({ notifications }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 rounded-full flex items-center justify-center relative"
        style={{ background: warna.kartu, border: `1px solid ${warna.garis}`, transition: "background 0.2s ease" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = warna.hover)}
        onMouseLeave={(e) => (e.currentTarget.style.background = warna.kartu)}
      >
        <Bell size={16} strokeWidth={2.3} style={{ color: warna.teksSekunder }} />
        {notifications.length > 0 && (
          <span className="absolute rounded-full" style={{ width: 8, height: 8, background: warna.biru, top: 8, right: 9 }} />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 10 }} />
            <motion.div
              className="absolute rounded-2xl overflow-hidden"
              style={{
                top: "120%", right: 0, width: 300, background: warna.kartu,
                border: `1px solid ${warna.garis}`,
                boxShadow: bayangan.dropdown, zIndex: 20, transformOrigin: "top right",
              }}
              {...dropdownMotion}
            >
              <p style={{ fontSize: 13, fontWeight: 700, padding: "12px 14px", color: warna.teksUtama }}>Notifikasi</p>
              <div className="overflow-y-auto" style={{ maxHeight: 280, borderTop: `1px solid ${warna.garis}` }}>
                {notifications.length === 0 ? (
                  <p style={{ fontSize: 12, color: warna.teksSekunder, padding: "24px 14px", textAlign: "center" }}>
                    Belum ada notifikasi
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} style={{ padding: "10px 14px", borderBottom: `1px solid ${warna.garis}` }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: warna.teksUtama }}>{n.judul}</p>
                      <p style={{ fontSize: 12, color: warna.teksSekunder, marginTop: 2 }}>{n.pesan}</p>
                      <p style={{ fontSize: 11, fontWeight: 500, color: warna.teksSekunder, marginTop: 4 }}>{n.waktu}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
