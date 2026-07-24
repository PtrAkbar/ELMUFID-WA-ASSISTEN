import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { warna, gradien, bayangan } from "../styles/theme";
import { dropdownMotion } from "../utils/motion";
import { namaBulan, namaHariSingkat, formatTgl, startOfDay, addDays, isSameDay } from "../utils/date";

const preset = [
  { label: "7 hari terakhir", hari: 7 },
  { label: "30 hari terakhir", hari: 30 },
  { label: "3 bulan terakhir", hari: 90 },
];

function ambilGridBulan(bulanTampil) {
  const tahun = bulanTampil.getFullYear();
  const bulan = bulanTampil.getMonth();
  const tglPertama = new Date(tahun, bulan, 1);
  const jumlahHari = new Date(tahun, bulan + 1, 0).getDate();
  const offset = tglPertama.getDay();
  const sel = [];
  for (let i = 0; i < offset; i++) sel.push(null);
  for (let d = 1; d <= jumlahHari; d++) sel.push(new Date(tahun, bulan, d));
  return sel;
}

export default function DateRangeDropdown({ awal, akhir, label, onTerapkan }) {
  const [open, setOpen] = useState(false);
  const [bulanTampil, setBulanTampil] = useState(startOfDay(akhir || new Date()));
  const [pilihAwal, setPilihAwal] = useState(awal);
  const [pilihAkhir, setPilihAkhir] = useState(akhir);
  const hariIni = startOfDay(new Date());

  useEffect(() => {
    if (open) {
      setPilihAwal(awal);
      setPilihAkhir(akhir);
      setBulanTampil(startOfDay(akhir || new Date()));
    }
  }, [open]);

  function pilihPreset(p) {
    const baru = { awal: startOfDay(addDays(new Date(), -(p.hari - 1))), akhir: startOfDay(new Date()) };
    onTerapkan(baru.awal, baru.akhir, p.label);
    setOpen(false);
  }

  function klikTanggal(tgl, e) {
    if (!tgl || tgl > hariIni) return;
    if (e.shiftKey && pilihAwal) {
      setPilihAkhir(tgl);
    } else {
      setPilihAwal(tgl);
      setPilihAkhir(tgl);
    }
  }

  function terapkanRentang() {
    if (!pilihAwal || !pilihAkhir) return;
    const min = pilihAwal < pilihAkhir ? pilihAwal : pilihAkhir;
    const max = pilihAwal < pilihAkhir ? pilihAkhir : pilihAwal;
    const teks = isSameDay(min, max) ? formatTgl(min) : `${formatTgl(min)} - ${formatTgl(max)}`;
    onTerapkan(min, max, teks);
    setOpen(false);
  }

  const min = pilihAwal && pilihAkhir ? (pilihAwal < pilihAkhir ? pilihAwal : pilihAkhir) : null;
  const max = pilihAwal && pilihAkhir ? (pilihAwal < pilihAkhir ? pilihAkhir : pilihAwal) : null;
  const grid = ambilGridBulan(bulanTampil);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
        style={{ fontSize: 12, fontWeight: 600, border: `1px solid ${warna.garis}`, color: warna.teksSekunder, background: "transparent", transition: "background 0.2s ease" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = warna.hover)}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <Calendar size={13} strokeWidth={2.3} />
        {label}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronDown size={13} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 10 }} />
            <motion.div
              className="absolute rounded-2xl overflow-hidden flex"
              style={{
                top: "125%", right: 0, background: warna.kartu,
                border: `1px solid ${warna.garis}`,
                boxShadow: bayangan.dropdown, zIndex: 20, transformOrigin: "top right", width: 420,
              }}
              {...dropdownMotion}
            >
              <div className="flex flex-col gap-1 p-3" style={{ width: 150, borderRight: `1px solid ${warna.divider}` }}>
                {preset.map((p) => (
                  <div
                    key={p.label}
                    onClick={() => pilihPreset(p)}
                    className="cursor-pointer rounded-xl"
                    style={{ fontSize: 13, fontWeight: 600, color: warna.teksUtama, padding: "9px 10px", transition: "background 0.15s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = warna.hover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {p.label}
                  </div>
                ))}
                <p style={{ fontSize: 11, color: warna.teksTersier, padding: "10px 10px 2px" }}>
                  Atau pilih tanggal, tahan Shift untuk memilih rentang
                </p>
              </div>

              <div className="p-3" style={{ width: 270 }}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <button
                    onClick={() => setBulanTampil(new Date(bulanTampil.getFullYear(), bulanTampil.getMonth() - 1, 1))}
                    className="rounded-full flex items-center justify-center"
                    style={{ width: 26, height: 26, color: warna.teksSekunder, transition: "background 0.15s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = warna.hover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <p style={{ fontSize: 13, fontWeight: 700, color: warna.teksUtama }}>
                    {namaBulan[bulanTampil.getMonth()]} {bulanTampil.getFullYear()}
                  </p>
                  <button
                    onClick={() => setBulanTampil(new Date(bulanTampil.getFullYear(), bulanTampil.getMonth() + 1, 1))}
                    className="rounded-full flex items-center justify-center"
                    style={{ width: 26, height: 26, color: warna.teksSekunder, transition: "background 0.15s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = warna.hover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>

                <div className="grid grid-cols-7 mb-1">
                  {namaHariSingkat.map((h) => (
                    <div key={h} className="flex items-center justify-center" style={{ fontSize: 10, fontWeight: 600, color: warna.teksTersier, height: 24 }}>
                      {h}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {grid.map((tgl, i) => {
                    if (!tgl) return <div key={i} style={{ height: 30 }} />;
                    const nonaktif = tgl > hariIni;
                    const diDalamRentang = min && max && tgl >= min && tgl <= max;
                    const ujung = (min && isSameDay(tgl, min)) || (max && isSameDay(tgl, max));
                    return (
                      <div key={i} className="flex items-center justify-center" style={{ height: 30 }}>
                        <button
                          disabled={nonaktif}
                          onClick={(e) => klikTanggal(tgl, e)}
                          className="rounded-full flex items-center justify-center"
                          style={{
                            width: 26,
                            height: 26,
                            fontSize: 12,
                            fontWeight: ujung ? 700 : 500,
                            cursor: nonaktif ? "default" : "pointer",
                            color: nonaktif ? warna.teksTersier : ujung ? "#FFFFFF" : diDalamRentang ? warna.teksUtama : warna.teksSekunder,
                            background: ujung ? gradien.aksen : diDalamRentang ? warna.pucat : "transparent",
                            opacity: nonaktif ? 0.35 : 1,
                            boxShadow: ujung ? bayangan.glowKecil : "none",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!nonaktif && !ujung) e.currentTarget.style.background = warna.hover;
                          }}
                          onMouseLeave={(e) => {
                            if (!nonaktif && !ujung) e.currentTarget.style.background = diDalamRentang ? warna.pucat : "transparent";
                          }}
                        >
                          {tgl.getDate()}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={terapkanRentang}
                  className="w-full rounded-full mt-3 py-2"
                  style={{ fontSize: 12, fontWeight: 700, color: "#FFFFFF", background: gradien.aksenTombol, boxShadow: bayangan.glowKecil, transition: "filter 0.2s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.12)")}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
                >
                  Terapkan
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
