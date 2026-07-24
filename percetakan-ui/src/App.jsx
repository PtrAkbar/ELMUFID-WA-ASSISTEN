import { useEffect, useState } from "react";
import { warna, gradien } from "./styles/theme";
import { useAuth } from "./context/AuthContext";
import { useOrders } from "./hooks/useOrders";
import { useStock } from "./hooks/useStock";
import { useKustomisasi } from "./hooks/useKustomisasi";
import { parseFileStockExcel } from "./utils/importExcel";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Toast from "./components/Toast";
import Dashboard from "./pages/Dashboard";
import Order from "./pages/Order";
import Stock from "./pages/Stock";
import Riwayat from "./pages/Riwayat";
import Kustomisasi from "./pages/Kustomisasi";

const judulHalaman = {
  dashboard: { title: "Dashboard Percetakan EL-MUFID", sub: "Rabu, 16 Juli 2026" },
  order: { title: "Semua order", sub: "Kelola status order customer" },
  stock: { title: "Stock barang", sub: "Kelola ketersediaan bahan cetak" },
  riwayat: { title: "Riwayat order", sub: "Order yang sudah selesai" },
  kustomisasi: { title: "Kustomisasi", sub: "Atur QRIS & rekening pembayaran toko" },
};

export default function App() {
  const { user, logout } = useAuth();
  const { orders, orderBaruMasuk, tambahOrder, ubahStatus, hapusSemuaOrderAktif, hapusSemuaRiwayat } = useOrders();
  const { stockItems, loading: stockLoading, tambahBarang, ubahStockStatus, ubahHarga, hapusBarang, hapusSemuaBarang, importBarang } = useStock();
  const { qris, rekeningList, loading: kustomisasiLoading, uploadQris, hapusQris, tambahRekening, hapusRekening } = useKustomisasi();
  const [halaman, setHalaman] = useState("dashboard");
  const [cariStock, setCariStock] = useState("");
  const [namaBaru, setNamaBaru] = useState("");
  const [hargaBaru, setHargaBaru] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [toastPesan, setToastPesan] = useState("");
  const [menyimpanBarang, setMenyimpanBarang] = useState(false);

  useEffect(() => {
    if (!orderBaruMasuk) return;
    setNotifications((prev) => [
      {
        id: `${orderBaruMasuk.id}-${Date.now()}`,
        judul: "Order baru masuk",
        pesan: `${orderBaruMasuk.nama} - ${orderBaruMasuk.detail}`,
        waktu: "Baru saja",
      },
      ...prev,
    ]);
  }, [orderBaruMasuk]);

  useEffect(() => {
    if (!toastPesan) return;
    const timer = setTimeout(() => setToastPesan(""), 2500);
    return () => clearTimeout(timer);
  }, [toastPesan]);

  const totalOrder = orders.length;
  const totalBelum = orders.filter((o) => o.status === "belum").length;
  const totalProses = orders.filter((o) => o.status === "proses").length;
  const totalSelesai = orders.filter((o) => o.status === "selesai").length;

  async function handleTambahBarang() {
    if (menyimpanBarang) return;
    if (!namaBaru.trim()) {
      setToastPesan("Isi nama barang terlebih dahulu");
      return;
    }
    if (!hargaBaru.trim()) {
      setToastPesan("Isi harga terlebih dahulu");
      return;
    }
    setMenyimpanBarang(true);
    const { error } = await tambahBarang(namaBaru, hargaBaru);
    setMenyimpanBarang(false);
    if (error) {
      setToastPesan(error.message);
      return;
    }
    setNamaBaru("");
    setHargaBaru("");
  }

  async function handleUbahStockStatus(kode, status) {
    const { error } = await ubahStockStatus(kode, status);
    if (error) setToastPesan(error.message);
  }

  async function handleUbahHarga(kode, harga) {
    const { error } = await ubahHarga(kode, harga);
    if (error) setToastPesan(error.message);
  }

  async function handleHapusBarang(kode) {
    const { error } = await hapusBarang(kode);
    if (error) setToastPesan(error.message);
  }

  async function handleHapusSemuaBarang() {
    const { error } = await hapusSemuaBarang();
    if (error) setToastPesan(error.message);
  }

  async function handleImportBarang(file) {
    let daftar;
    try {
      daftar = await parseFileStockExcel(file);
    } catch (err) {
      setToastPesan(err.message || "File tidak bisa dibaca");
      return;
    }
    const { error, jumlah } = await importBarang(daftar);
    if (error) {
      setToastPesan(error.message);
      return;
    }
    setToastPesan(`${jumlah} barang berhasil diimpor dari Excel`);
  }

  async function handleHapusSemuaOrder() {
    const { error } = await hapusSemuaOrderAktif();
    if (error) setToastPesan("Gagal menghapus semua order");
  }

  async function handleRestoreOrder(id) {
    await ubahStatus(id, "proses");
  }

  async function handleHapusSemuaRiwayat() {
    const { error } = await hapusSemuaRiwayat();
    if (error) setToastPesan("Gagal menghapus riwayat");
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: warna.teksUtama, background: gradien.latar }} className="min-h-screen flex">
      <Toast pesan={toastPesan} />
      <Sidebar halaman={halaman} setHalaman={setHalaman} totalProses={totalProses} />

      <main className="flex-1 p-6">
        <Topbar
          title={judulHalaman[halaman].title}
          sub={judulHalaman[halaman].sub}
          notifications={notifications}
          email={user?.email}
          onLogout={logout}
        />

        {halaman === "dashboard" && (
          <Dashboard
            orders={orders}
            totalOrder={totalOrder}
            totalBelum={totalBelum}
            totalProses={totalProses}
            totalSelesai={totalSelesai}
            onLihatSemua={() => setHalaman("order")}
          />
        )}

        {halaman === "order" && (
          <Order
            orders={orders}
            onUbahStatus={ubahStatus}
            onTambahOrder={tambahOrder}
            onHapusSemuaOrder={handleHapusSemuaOrder}
          />
        )}

        {halaman === "stock" && (
          <Stock
            stockItems={stockItems}
            loading={stockLoading}
            cariStock={cariStock}
            setCariStock={setCariStock}
            namaBaru={namaBaru}
            setNamaBaru={setNamaBaru}
            hargaBaru={hargaBaru}
            setHargaBaru={setHargaBaru}
            onTambahBarang={handleTambahBarang}
            menyimpanBarang={menyimpanBarang}
            onUbahStockStatus={handleUbahStockStatus}
            onUbahHarga={handleUbahHarga}
            onHapusBarang={handleHapusBarang}
            onHapusSemuaBarang={handleHapusSemuaBarang}
            onImportBarang={handleImportBarang}
          />
        )}

        {halaman === "riwayat" && (
          <Riwayat orders={orders} onRestore={handleRestoreOrder} onHapusSemuaRiwayat={handleHapusSemuaRiwayat} />
        )}

        {halaman === "kustomisasi" && (
          <Kustomisasi
            qris={qris}
            rekeningList={rekeningList}
            loading={kustomisasiLoading}
            onUploadQris={uploadQris}
            onHapusQris={hapusQris}
            onTambahRekening={tambahRekening}
            onHapusRekening={hapusRekening}
          />
        )}
      </main>
    </div>
  );
}
