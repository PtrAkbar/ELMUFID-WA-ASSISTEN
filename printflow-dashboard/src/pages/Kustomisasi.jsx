import { useRef, useState } from "react";
import { Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { warna, gradien, bayangan, inputStyle } from "../styles/theme";
import EmptyState from "../atoms/EmptyState";
import ConfirmModal from "../organisms/ConfirmModal";

export default function Kustomisasi({ qris, rekeningList, loading, onUploadQris, onHapusQris, onTambahRekening, onHapusRekening }) {
  const [namaBank, setNamaBank] = useState("");
  const [nomorRekening, setNomorRekening] = useState("");
  const [atasNama, setAtasNama] = useState("");
  const [menyimpanRekening, setMenyimpanRekening] = useState(false);
  const [mengupload, setMengupload] = useState(false);
  const [pesanError, setPesanError] = useState("");
  const [rekeningDihapus, setRekeningDihapus] = useState(null);
  const [konfirmasiHapusQris, setKonfirmasiHapusQris] = useState(false);
  const inputFileRef = useRef(null);

  async function handlePilihFileQris(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setMengupload(true);
    setPesanError("");
    const { error } = await onUploadQris(file);
    setMengupload(false);
    if (error) setPesanError(error.message);
  }

  async function handleTambahRekening() {
    if (!namaBank.trim() || !nomorRekening.trim()) {
      setPesanError("Nama bank dan nomor rekening wajib diisi");
      return;
    }
    setMenyimpanRekening(true);
    setPesanError("");
    const { error } = await onTambahRekening({ namaBank, nomorRekening, atasNama });
    setMenyimpanRekening(false);
    if (error) {
      setPesanError(error.message);
      return;
    }
    setNamaBank("");
    setNomorRekening("");
    setAtasNama("");
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-3xl p-5" style={{ background: warna.kartu, border: `1px solid ${warna.garis}`, boxShadow: bayangan.kartu }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: "#E5E7EB" }} className="mb-1">QRIS toko</p>
        <p style={{ fontSize: 13, color: warna.teksSekunder }} className="mb-4">
          Gambar ini otomatis dikirim bot ke customer yang memilih bayar pakai QRIS.
        </p>

        {loading ? (
          <EmptyState pesan="Memuat data..." />
        ) : qris ? (
          <div className="flex items-start gap-4">
            <img src={qris} alt="QRIS toko" className="rounded-2xl" style={{ width: 160, height: 160, objectFit: "cover", border: `1px solid ${warna.garis}` }} />
            <div className="flex flex-col gap-2">
              <input ref={inputFileRef} type="file" accept="image/*" className="hidden" onChange={handlePilihFileQris} />
              <button
                onClick={() => inputFileRef.current?.click()}
                disabled={mengupload}
                className="flex items-center gap-1 rounded-full px-3 py-2"
                style={{ fontSize: 12, fontWeight: 600, color: warna.teksSekunder, border: `1px solid ${warna.garis}`, opacity: mengupload ? 0.6 : 1 }}
              >
                <Upload size={13} strokeWidth={2.3} /> {mengupload ? "Mengupload..." : "Ganti gambar"}
              </button>
              <button
                onClick={() => setKonfirmasiHapusQris(true)}
                className="flex items-center gap-1 rounded-full px-3 py-2"
                style={{ fontSize: 12, fontWeight: 600, color: warna.bahaya, border: `1px solid ${warna.garis}` }}
              >
                <Trash2 size={13} strokeWidth={2.3} /> Hapus QRIS
              </button>
            </div>
          </div>
        ) : (
          <div>
            <input ref={inputFileRef} type="file" accept="image/*" className="hidden" onChange={handlePilihFileQris} />
            <button
              onClick={() => inputFileRef.current?.click()}
              disabled={mengupload}
              className="flex items-center gap-2 rounded-2xl p-6 w-full justify-center"
              style={{ border: `1px dashed ${warna.garis}`, color: warna.teksSekunder, fontSize: 13, fontWeight: 600, opacity: mengupload ? 0.6 : 1 }}
            >
              <ImageIcon size={16} strokeWidth={2.3} /> {mengupload ? "Mengupload..." : "Upload gambar QRIS"}
            </button>
          </div>
        )}

        {pesanError && <p style={{ fontSize: 12, color: warna.bahaya }} className="mt-3">{pesanError}</p>}
      </div>

      <div className="rounded-3xl p-5" style={{ background: warna.kartu, border: `1px solid ${warna.garis}`, boxShadow: bayangan.kartu }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: "#E5E7EB" }} className="mb-1">Rekening bank toko</p>
        <p style={{ fontSize: 13, color: warna.teksSekunder }} className="mb-4">
          Bot akan menawarkan transfer ke salah satu rekening ini kalau customer memilih metode transfer. Boleh lebih dari satu.
        </p>

        <div className="flex items-end gap-2 mb-5 rounded-3xl p-4 flex-wrap" style={{ background: warna.bg }}>
          <div className="flex-1" style={{ minWidth: 140 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: warna.teksSekunder }}>Nama bank</label>
            <input
              value={namaBank}
              onChange={(e) => setNamaBank(e.target.value)}
              placeholder="BCA"
              className="w-full rounded-2xl outline-none mt-1"
              style={{ ...inputStyle, background: warna.kartu, fontSize: 14, padding: "8px 12px" }}
            />
          </div>
          <div className="flex-1" style={{ minWidth: 160 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: warna.teksSekunder }}>Nomor rekening</label>
            <input
              value={nomorRekening}
              onChange={(e) => setNomorRekening(e.target.value)}
              placeholder="1234567890"
              className="w-full rounded-2xl outline-none mt-1"
              style={{ ...inputStyle, background: warna.kartu, fontSize: 14, padding: "8px 12px" }}
            />
          </div>
          <div className="flex-1" style={{ minWidth: 160 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: warna.teksSekunder }}>Atas nama (opsional)</label>
            <input
              value={atasNama}
              onChange={(e) => setAtasNama(e.target.value)}
              placeholder="EL-MUFID"
              className="w-full rounded-2xl outline-none mt-1"
              style={{ ...inputStyle, background: warna.kartu, fontSize: 14, padding: "8px 12px" }}
            />
          </div>
          <button
            onClick={handleTambahRekening}
            disabled={menyimpanRekening}
            className="text-white rounded-full px-4 py-2.5"
            style={{ background: gradien.aksenTombol, boxShadow: bayangan.glowKecil, fontSize: 12, fontWeight: 600, opacity: menyimpanRekening ? 0.6 : 1 }}
          >
            {menyimpanRekening ? "Menyimpan..." : "+ Tambah rekening"}
          </button>
        </div>

        {loading ? (
          <EmptyState pesan="Memuat data..." />
        ) : rekeningList.length === 0 ? (
          <EmptyState pesan="Belum ada rekening ditambahkan" />
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ textAlign: "left", color: warna.teksSekunder, borderBottom: `1px solid ${warna.garis}` }}>
                <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0" }}>Bank</th>
                <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0" }}>Nomor rekening</th>
                <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0" }}>Atas nama</th>
                <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0", textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rekeningList.map((r) => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${warna.divider}` }}>
                  <td style={{ fontSize: 14, fontWeight: 700, padding: "12px 0", color: warna.teksUtama }}>{r.nama_bank}</td>
                  <td style={{ fontSize: 14, padding: "12px 0", color: warna.teksUtama }}>{r.nomor_rekening}</td>
                  <td style={{ fontSize: 14, padding: "12px 0", color: warna.teksSekunder }}>{r.atas_nama || "-"}</td>
                  <td style={{ padding: "12px 0", textAlign: "right" }}>
                    <button
                      onClick={() => setRekeningDihapus(r)}
                      className="rounded-full inline-flex items-center justify-center"
                      style={{ width: 32, height: 32, color: warna.bahaya, border: `1px solid ${warna.garis}` }}
                      title="Hapus rekening"
                    >
                      <Trash2 size={14} strokeWidth={2.3} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        open={konfirmasiHapusQris}
        onClose={() => setKonfirmasiHapusQris(false)}
        onConfirm={onHapusQris}
        judul="Hapus gambar QRIS?"
        pesan="Bot gak akan bisa nawarin pembayaran QRIS sampai gambar baru diupload lagi."
      />

      <ConfirmModal
        open={!!rekeningDihapus}
        onClose={() => setRekeningDihapus(null)}
        onConfirm={() => onHapusRekening(rekeningDihapus.id)}
        judul="Hapus rekening ini?"
        pesan={`Rekening ${rekeningDihapus?.nama_bank} akan dihapus dari daftar.`}
      />
    </div>
  );
}
