import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, ShieldCheck } from "lucide-react";
import { dropdownMotion } from "../utils/motion";

export default function ProfileMenu({ email, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-2xl p-1.5 pr-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200/60 transition-all cursor-pointer shadow-sm select-none"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-tr from-blue-600 to-indigo-600 text-sm font-bold shadow-md shadow-blue-500/20 shrink-0">
          A
        </div>
        <div className="leading-snug text-left">
          <p className="text-sm font-bold text-slate-900">Admin Toko</p>
          <p className="text-xs font-semibold text-blue-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            EL-MUFID
          </p>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }} className="ml-1">
          <ChevronDown size={16} className="text-slate-400" />
        </motion.div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <div onClick={() => setOpen(false)} className="fixed inset-0 z-10" />
            <motion.div
              className="absolute rounded-2xl overflow-hidden bg-white shadow-2xl shadow-slate-900/10 z-20 origin-top-right border border-slate-100 p-2.5 w-64 right-0"
              style={{ top: "125%" }}
              {...dropdownMotion}
            >
              <div className="px-3 py-2.5 rounded-xl bg-slate-50/80 mb-2 border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mb-1">
                  <ShieldCheck size={14} />
                  <span>Sesi Aktif</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Masuk sebagai:</p>
                <p className="text-sm font-bold text-slate-900 truncate mt-0.5" title={email}>
                  {email || "admin@elmufid.com"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
              >
                <LogOut size={16} strokeWidth={2.2} />
                <span>Keluar Akun (Logout)</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


