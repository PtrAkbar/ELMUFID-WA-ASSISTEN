export const warna = {
  bg: "#0A1020",
  bgSekunder: "#0F172A",
  kartu: "#141B2D",
  sidebar: "#0C1324",
  garis: "rgba(255,255,255,0.08)",
  divider: "rgba(255,255,255,0.06)",
  hover: "#1B2643",
  teksUtama: "#F8FAFC",
  teksSekunder: "#94A3B8",
  teksTersier: "#64748B",
  gelap: "#0A1020",
  biru: "#5671FF",
  sedang: "#647CFF",
  muda: "#7B8CFF",
  pucat: "rgba(123,140,255,0.16)",
  bahaya: "#F87171",
  bahayaBg: "rgba(239,68,68,0.14)",
  sukses: "#34D399",
};

export const gradien = {
  aksen: "linear-gradient(135deg, #4F6BFF, #647CFF)",
  aksenTombol: "linear-gradient(135deg, #5671FF, #7087FF)",
  aksenIkon: "linear-gradient(135deg, #5B73FF, #7288FF)",
  latar: "radial-gradient(circle at top, #18274A, #0A1020 60%)",
};

export const bayangan = {
  kartu: "0 20px 60px rgba(0,0,0,0.35)",
  dropdown: "0 20px 50px rgba(0,0,0,0.45)",
  glow: "0 8px 24px rgba(79,107,255,0.28)",
  glowKecil: "0 4px 14px rgba(79,107,255,0.35)",
};

export const statusWarna = {
  menunggu_bayar: warna.bahaya,
  belum: "#F5A524",
  proses: warna.sedang,
  selesai: warna.sukses,
};

export const statusLabel = {
  menunggu_bayar: "Menunggu pembayaran",
  belum: "Belum diproses",
  proses: "Sedang diproses",
  selesai: "Selesai",
};

export const inputStyle = {
  background: warna.bgSekunder,
  border: `1px solid ${warna.garis}`,
  color: warna.teksUtama,
};
