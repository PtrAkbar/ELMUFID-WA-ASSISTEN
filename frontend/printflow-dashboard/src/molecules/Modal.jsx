import { AnimatePresence, motion } from "framer-motion";

export default function Modal({ open, onClose, children, width = 400 }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          onClick={onClose}
          className="fixed inset-0 flex items-center justify-center p-4 bg-black/25 backdrop-blur-[2px] z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="rounded-3xl p-6 bg-white shadow-2xl shadow-black/15 border border-black/[0.04] text-[#1C1C1C]"
            style={{ width, maxWidth: "100%" }}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

