import { statusWarna, statusLabel } from "../styles/theme";

export default function StatusPill({ status }) {
  const c = statusWarna[status];
  return (
    <span className="rounded-full" style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", color: c, background: c + "14" }}>
      {statusLabel[status]}
    </span>
  );
}
