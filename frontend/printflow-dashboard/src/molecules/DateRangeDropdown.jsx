import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
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
  }, [open, awal, akhir]);

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
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs md:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-sm transition-all cursor-pointer"
      >
        <Calendar size={15} strokeWidth={2.2} className="text-blue-600" />
        <span>{label}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronDown size={15} className="text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div onClick={() => setOpen(false)} className="fixed inset-0 z-10" />
            <motion.div
              className="absolute rounded-2xl overflow-hidden flex bg-white shadow-xl shadow-black/10 z-20 origin-top-right border border-black/[0.04]"
              style={{ top: "125%", right: 0, width: 420 }}
              {...dropdownMotion}
            >
              <div className="flex flex-col gap-1 p-3 border-r border-black/[0.05]" style={{ width: 150 }}>
                {preset.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => pilihPreset(p)}
                    className="cursor-pointer rounded-xl text-left text-[13px] font-medium text-[#1C1C1C] px-2.5 py-2 hover:bg-black/[0.04] transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
                <p className="text-[11px] text-gray-400 px-2.5 pt-2">
                  Tahan Shift untuk memilih rentang
                </p>
              </div>

              <div className="p-4" style={{ width: 270 }}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <button
                    type="button"
                    onClick={() => setBulanTampil(new Date(bulanTampil.getFullYear(), bulanTampil.getMonth() - 1, 1))}
                    className="rounded-full flex items-center justify-center w-7 h-7 text-gray-500 hover:bg-black/[0.05] transition-colors"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <p className="text-[13px] font-semibold text-[#1C1C1C]">
                    {namaBulan[bulanTampil.getMonth()]} {bulanTampil.getFullYear()}
                  </p>
                  <button
                    type="button"
                    onClick={() => setBulanTampil(new Date(bulanTampil.getFullYear(), bulanTampil.getMonth() + 1, 1))}
                    className="rounded-full flex items-center justify-center w-7 h-7 text-gray-500 hover:bg-black/[0.05] transition-colors"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>

                <div className="grid grid-cols-7 mb-1 text-center">
                  {namaHariSingkat.map((h) => (
                    <div key={h} className="text-[10px] font-semibold text-gray-400 h-6 flex items-center justify-center">
                      {h}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-y-1">
                  {grid.map((tgl, i) => {
                    if (!tgl) return <div key={i} className="h-7" />;
                    const nonaktif = tgl > hariIni;
                    const diDalamRentang = min && max && tgl >= min && tgl <= max;
                    const ujung = (min && isSameDay(tgl, min)) || (max && isSameDay(tgl, max));
                    return (
                      <div key={i} className="flex items-center justify-center h-7">
                        <button
                          type="button"
                          disabled={nonaktif}
                          onClick={(e) => klikTanggal(tgl, e)}
                          className={`w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center transition-all ${
                            nonaktif
                              ? "opacity-30 cursor-default text-gray-400"
                              : ujung
                              ? "bg-[#1C1C1C] text-white font-bold"
                              : diDalamRentang
                              ? "bg-[#E5ECF6] text-[#1C1C1C]"
                              : "text-gray-700 hover:bg-black/[0.05]"
                          }`}
                        >
                          {tgl.getDate()}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={terapkanRentang}
                  className="w-full rounded-xl mt-3 py-2 text-xs font-semibold text-white bg-[#1C1C1C] hover:bg-black transition-all shadow-sm cursor-pointer"
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

