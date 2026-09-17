import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { dropdownMotion } from "../utils/motion";

export default function PillDropdown({ value, options, colorFor, onChange }) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value) || options[0];
  const c = colorFor(value);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-full flex items-center gap-2 px-3.5 py-1.5 text-xs md:text-sm font-semibold cursor-pointer transition-all border border-black/5"
        style={{ color: c, backgroundColor: `${c}18` }}
      >
        <span>{current?.label}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronDown size={14} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div onClick={() => setOpen(false)} className="fixed inset-0 z-10" />
            <motion.div
              className="absolute rounded-2xl overflow-hidden bg-white shadow-xl shadow-slate-900/10 z-20 origin-top-left border border-slate-100 p-2 min-w-[190px]"
              style={{ top: "115%", left: 0 }}
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
      </AnimatePresence>
    </div>
  );
}

