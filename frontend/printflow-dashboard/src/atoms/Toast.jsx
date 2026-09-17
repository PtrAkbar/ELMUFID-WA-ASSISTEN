import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

export default function Toast({ pesan }) {
  return (
    <AnimatePresence>
      {pesan && (
        <motion.div
          initial={{ opacity: 0, y: -16, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -16, x: "-50%" }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-6 left-1/2 z-50 flex items-center gap-2.5 rounded-2xl px-5 py-3 bg-slate-900/95 backdrop-blur-sm text-white shadow-2xl shadow-slate-900/20 text-sm font-semibold border border-slate-700/40"
        >
          <AlertCircle size={18} className="text-amber-400 shrink-0" />
          <span>{pesan}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

