import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { warna, bayangan } from "../styles/theme";
import { dropdownMotion } from "../utils/motion";

export default function PillDropdown({ value, options, colorFor, onChange }) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  const c = colorFor(value);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full flex items-center gap-1.5"
        style={{ fontSize: 12, fontWeight: 600, padding: "6px 12px", color: c, border: `1px solid ${c}55`, background: c + "14", transition: "background 0.2s ease" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = c + "26")}
        onMouseLeave={(e) => (e.currentTarget.style.background = c + "14")}
      >
        {current.label}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronDown size={12} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 10 }} />
            <motion.div
              className="absolute rounded-2xl overflow-hidden"
              style={{
                top: "115%", left: 0, minWidth: 170, background: warna.kartu,
                border: `1px solid ${warna.garis}`,
                boxShadow: bayangan.dropdown, zIndex: 20, transformOrigin: "top left",
              }}
              {...dropdownMotion}
            >
              {options.map((opt) => {
                const oc = colorFor(opt.value);
                const aktif = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: oc,
                      padding: "10px 14px",
                      background: aktif ? oc + "14" : "transparent",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!aktif) e.currentTarget.style.background = oc + "14";
                    }}
                    onMouseLeave={(e) => {
                      if (!aktif) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {opt.label}
                  </div>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
