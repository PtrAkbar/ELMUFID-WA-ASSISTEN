import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { dropdownMotion } from "../utils/motion";

export default function NotificationBell({ notifications }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-11 h-11 rounded-2xl flex items-center justify-center relative bg-slate-50 hover:bg-blue-50/60 border border-slate-200/60 transition-all cursor-pointer shadow-sm text-slate-700 hover:text-blue-600"
      >
        <Bell size={20} strokeWidth={2.2} />
        {notifications.length > 0 && (
          <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div onClick={() => setOpen(false)} className="fixed inset-0 z-10" />
            <motion.div
              className="absolute rounded-2xl overflow-hidden bg-white shadow-2xl shadow-slate-900/10 z-20 origin-top-right border border-slate-100 w-80 right-0 p-1"
              style={{ top: "125%" }}
              {...dropdownMotion}
            >
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">Pemberitahuan</p>
                {notifications.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600">
                    {notifications.length} baru
                  </span>
                )}
              </div>
              <div className="overflow-y-auto max-h-[300px] divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <p className="text-sm text-slate-400 py-8 px-4 text-center font-medium">
                    Belum ada notifikasi baru
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                      <p className="text-sm font-bold text-slate-900">{n.judul}</p>
                      <p className="text-sm text-slate-600 mt-1">{n.pesan}</p>
                      <p className="text-xs font-semibold text-blue-600 mt-1.5">{n.waktu}</p>
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


