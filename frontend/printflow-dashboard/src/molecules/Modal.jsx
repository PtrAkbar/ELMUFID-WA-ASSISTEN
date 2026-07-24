import { AnimatePresence, motion } from "framer-motion";
import { warna, bayangan } from "../styles/theme";

export default function Modal({ open, onClose, children, width = 380 }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          onClick={onClose}
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ background: "rgba(5,9,20,0.6)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", zIndex: 50 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="rounded-3xl p-6"
            style={{ background: warna.kartu, border: `1px solid ${warna.garis}`, boxShadow: bayangan.dropdown, width, maxWidth: "100%" }}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
