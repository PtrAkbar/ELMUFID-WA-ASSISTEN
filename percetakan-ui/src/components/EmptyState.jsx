import { Inbox } from "lucide-react";

export default function EmptyState({ pesan, tinggi = 160 }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2" style={{ height: tinggi }}>
      <Inbox
        size={28}
        strokeWidth={1.6}
        style={{ color: "#7B8CFF", opacity: 0.8, filter: "drop-shadow(0 0 10px rgba(123,140,255,0.45))" }}
      />
      <p style={{ fontSize: 13, color: "#CBD5E1" }}>{pesan}</p>
    </div>
  );
}
