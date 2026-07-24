import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { warna, gradien, bayangan } from "../styles/theme";

export default function Toast({ pesan }) {
  return (
    <AnimatePresence>
      {pesan && (
        <motion.div
          initial={{ opacity: 0, y: -16, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -16, x: "-50%" }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-6 left-1/2 z-50 flex items-center gap-2 rounded-full px-4 py-3"
          style={{ background: gradien.aksenTombol, boxShadow: bayangan.glow }}
        >
          <AlertCircle size={16} className="text-white" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{pesan}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
