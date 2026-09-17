import { statusWarna, statusBg, statusLabel } from "../styles/theme";

export default function StatusPill({ status }) {
  const c = statusWarna[status] || "#64748B";
  const bg = statusBg[status] || "#F1F5F9";
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs md:text-sm font-semibold border border-black/5"
      style={{ color: c, backgroundColor: bg }}
    >
      {statusLabel[status] || status}
    </span>
  );
}

