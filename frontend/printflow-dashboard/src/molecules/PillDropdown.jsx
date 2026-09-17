import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { dropdownMotion } from "../utils/motion";

export default function PillDropdown({ value, options, colorFor, onChange }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const current = options.find((o) => o.value === value) || options[0];
  const c = colorFor(value);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 44 * options.length + 24;
    const dropdownWidth = 205;

    let top = rect.bottom + 6;
    let left = rect.left;

    // Jika ruang di bawah layar tidak cukup dan di atas masih luas, balikkan ke atas
    if (top + dropdownHeight > window.innerHeight && rect.top > dropdownHeight) {
      top = rect.top - dropdownHeight - 6;
    }

    // Hindari agar tidak meluber keluar batas kanan layar
    if (left + dropdownWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - dropdownWidth - 12);
    }
    if (left < 12) left = 12;

    setCoords({ top, left });
  }, [options.length]);

  useEffect(() => {
    if (!open) return;
    updatePosition();

    const handleScrollOrResize = () => {
      updatePosition();
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, updatePosition]);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full flex items-center gap-2 px-3.5 py-1.5 text-xs md:text-sm font-semibold cursor-pointer transition-all border border-black/5 select-none"
        style={{ color: c, backgroundColor: `${c}18` }}
      >
        <span>{current?.label}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronDown size={14} />
        </motion.div>
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                <div
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 z-40 bg-transparent"
                />
                <motion.div
                  className="fixed rounded-2xl overflow-hidden bg-white shadow-xl shadow-slate-900/15 z-50 border border-slate-100 p-2 min-w-[200px]"
                  style={{
                    top: `${coords.top}px`,
                    left: `${coords.left}px`,
                  }}
                  {...dropdownMotion}
                >
                  {options.map((opt) => {
                    const oc = colorFor(opt.value);
                    const aktif = opt.value === value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          onChange(opt.value);
                          setOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-semibold cursor-pointer transition-colors flex items-center gap-2.5 ${
                          aktif ? "bg-slate-100" : "hover:bg-slate-50"
                        }`}
                        style={{ color: oc }}
                      >
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: oc }} />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
