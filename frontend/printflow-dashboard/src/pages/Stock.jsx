import { useRef, useState } from "react";
import { Search, Trash2, Pencil, Upload } from "lucide-react";
import { warna, gradien, bayangan, inputStyle } from "../styles/theme";
import PillDropdown from "../molecules/PillDropdown";
import EmptyState from "../atoms/EmptyState";
import ConfirmModal from "../organisms/ConfirmModal";
import EditHargaModal from "../organisms/EditHargaModal";

export default function Stock({
  stockItems,
  loading,
  cariStock,
  setCariStock,
  namaBaru,
  setNamaBaru,
  hargaBaru,
  setHargaBaru,
  onTambahBarang,
  menyimpanBarang,
  onUbahStockStatus,
  onUbahHarga,
  onHapusBarang,
  onHapusSemuaBarang,
  onImportBarang,
}) {
  const [barangDihapus, setBarangDihapus] = useState(null);
  const [barangDiedit, setBarangDiedit] = useState(null);
  const [konfirmasiHapusSemua, setKonfirmasiHapusSemua] = useState(false);
  const [mengimpor, setMengimpor] = useState(false);
  const inputFileRef = useRef(null);

  async function handlePilihFile(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setMengimpor(true);
    await onImportBarang(file);
    setMengimpor(false);
  }

  const stockTersaring = stockItems.filter(
    (s) => s.nama.toLowerCase().includes(cariStock.toLowerCase()) || s.kode.toLowerCase().includes(cariStock.toLowerCase())
  );

  return (
    <div className="rounded-3xl p-5" style={{ background: warna.kartu, border: `1px solid ${warna.garis}`, boxShadow: bayangan.kartu }}>
      <div className="flex items-center justify-between mb-4">
        <p style={{ fontSize: 16, fontWeight: 600, color: "#E5E7EB" }}>Daftar stock</p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} strokeWidth={2.3} className="absolute left-3 top-2.5" style={{ color: warna.teksSekunder }} />
            <input
              value={cariStock}
              onChange={(e) => setCariStock(e.target.value)}
              placeholder="Cari kode atau nama barang"
              className="rounded-full outline-none w-64"
              style={{ ...inputStyle, fontSize: 14, padding: "8px 12px 8px 34px" }}
            />
          </div>
          <input
            ref={inputFileRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={handlePilihFile}
          />
          <button
            onClick={() => inputFileRef.current?.click()}
            disabled={mengimpor}
            className="flex items-center gap-1 rounded-full px-3 py-2"
            style={{ fontSize: 12, fontWeight: 600, color: warna.teksSekunder, border: `1px solid ${warna.garis}`, opacity: mengimpor ? 0.6 : 1, transition: "background 0.2s ease" }}
            onMouseEnter={(e) => !mengimpor && (e.currentTarget.style.background = warna.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Upload size={13} strokeWidth={2.3} /> {mengimpor ? "Mengimpor..." : "Import Excel"}
          </button>
          {stockItems.length > 0 && (
            <button
              onClick={() => setKonfirmasiHapusSemua(true)}
              className="flex items-center gap-1 rounded-full px-3 py-2"
              style={{ fontSize: 12, fontWeight: 600, color: warna.bahaya, border: `1px solid ${warna.garis}`, transition: "background 0.2s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = warna.bahayaBg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Trash2 size={13} strokeWidth={2.3} /> Hapus semua
            </button>
          )}
        </div>
      </div>

      <div className="flex items-end gap-2 mb-5 rounded-3xl p-4" style={{ background: warna.bg }}>
        <div className="flex-1">
          <label style={{ fontSize: 12, fontWeight: 600, color: warna.teksSekunder }}>Nama barang</label>
          <input
            value={namaBaru}
            onChange={(e) => setNamaBaru(e.target.value)}
            placeholder="Contoh: kertas hvs 70gsm"
            className="w-full rounded-2xl outline-none mt-1"
            style={{ ...inputStyle, background: warna.kartu, fontSize: 14, padding: "8px 12px" }}
          />
        </div>
        <div className="w-36">
          <label style={{ fontSize: 12, fontWeight: 600, color: warna.teksSekunder }}>Harga (Rp)</label>
          <input
            value={hargaBaru}
            onChange={(e) => setHargaBaru(e.target.value)}
            placeholder="300"
            className="w-full rounded-2xl outline-none mt-1"
            style={{ ...inputStyle, background: warna.kartu, fontSize: 14, padding: "8px 12px" }}
          />
        </div>
        <button
          onClick={onTambahBarang}
          disabled={menyimpanBarang}
          className="text-white rounded-full px-4 py-2.5"
          style={{ background: gradien.aksenTombol, boxShadow: bayangan.glowKecil, fontSize: 12, fontWeight: 600, opacity: menyimpanBarang ? 0.6 : 1, transition: "filter 0.2s ease" }}
          onMouseEnter={(e) => !menyimpanBarang && (e.currentTarget.style.filter = "brightness(1.12)")}
          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
        >
          {menyimpanBarang ? "Menyimpan..." : "+ Tambah barang"}
        </button>
      </div>

      {loading ? (
        <EmptyState pesan="Memuat data stock..." />
      ) : stockTersaring.length === 0 ? (
        <EmptyState pesan={cariStock ? "Barang tidak ditemukan" : "Belum ada barang di stock"} />
      ) : (
        <table className="w-full">
          <thead>
            <tr style={{ textAlign: "left", color: warna.teksSekunder, borderBottom: `1px solid ${warna.garis}` }}>
              <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0" }}>Kode</th>
              <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0" }}>Nama barang</th>
              <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0" }}>Harga</th>
              <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0" }}>Status</th>
              <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0", textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {stockTersaring.map((s) => (
              <tr
                key={s.kode}
                style={{ borderBottom: `1px solid ${warna.divider}`, transition: "background 0.15s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ fontSize: 14, fontWeight: 400, color: warna.teksSekunder, padding: "12px 0" }}>{s.kode}</td>
                <td style={{ fontSize: 14, fontWeight: 700, padding: "12px 0", color: warna.teksUtama }}>{s.nama}</td>
                <td style={{ fontSize: 14, fontWeight: 400, padding: "12px 0", color: warna.teksUtama }}>Rp{Number(s.harga).toLocaleString("id-ID")}</td>
                <td style={{ padding: "12px 0" }}>
                  <PillDropdown
                    value={s.status}
                    options={[
                      { value: "masih", label: "Masih" },
                      { value: "habis", label: "Habis" },
                    ]}
                    colorFor={(v) => (v === "masih" ? warna.muda : warna.biru)}
                    onChange={(v) => onUbahStockStatus(s.kode, v)}
                  />
                </td>
                <td style={{ padding: "12px 0", textAlign: "right" }}>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setBarangDiedit(s)}
                      className="rounded-full inline-flex items-center justify-center"
                      style={{ width: 32, height: 32, color: warna.teksSekunder, border: `1px solid ${warna.garis}`, transition: "background 0.2s ease" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = warna.hover)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      title="Ubah harga"
                    >
                      <Pencil size={14} strokeWidth={2.3} />
                    </button>
                    <button
                      onClick={() => setBarangDihapus(s)}
                      className="rounded-full inline-flex items-center justify-center"
                      style={{ width: 32, height: 32, color: warna.bahaya, border: `1px solid ${warna.garis}`, transition: "background 0.2s ease" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = warna.bahayaBg)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      title="Hapus barang"
                    >
                      <Trash2 size={14} strokeWidth={2.3} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <EditHargaModal
        open={!!barangDiedit}
        onClose={() => setBarangDiedit(null)}
        barang={barangDiedit}
        onSubmit={onUbahHarga}
      />

      <ConfirmModal
        open={!!barangDihapus}
        onClose={() => setBarangDihapus(null)}
        onConfirm={() => onHapusBarang(barangDihapus.kode)}
        judul="Hapus barang ini?"
        pesan={`"${barangDihapus?.nama}" akan dihapus permanen dari stock.`}
      />

      <ConfirmModal
        open={konfirmasiHapusSemua}
        onClose={() => setKonfirmasiHapusSemua(false)}
        onConfirm={onHapusSemuaBarang}
        judul="Hapus semua barang?"
        pesan={`${stockItems.length} barang akan dihapus permanen dari Sheet.`}
        labelKonfirmasi="Ya, hapus semua"
      />
    </div>
  );
}
