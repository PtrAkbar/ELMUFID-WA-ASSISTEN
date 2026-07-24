import { warna, gradien, bayangan } from "../styles/theme";

export default function SideNav({ icon, label, active, badge, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between px-3 py-2.5 rounded-full cursor-pointer"
      style={{
        background: active ? gradien.aksen : "transparent",
        boxShadow: active ? bayangan.glowKecil : "none",
        color: active ? "#FFFFFF" : "#CBD5E1",
        fontSize: 15,
        fontWeight: active ? 600 : 500,
        transition: "background 0.25s ease, color 0.25s ease",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = warna.hover;
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <div className="flex items-center gap-2.5">
        {icon}
        <span>{label}</span>
      </div>
      {badge ? (
        <span
          className="rounded-full flex items-center justify-center"
          style={{
            width: 18, height: 18, fontSize: 10, fontWeight: 700,
            background: active ? "rgba(255,255,255,0.25)" : warna.pucat,
            color: active ? "white" : warna.muda,
          }}
        >
          {badge}
        </span>
      ) : null}
    </div>
  );
}
