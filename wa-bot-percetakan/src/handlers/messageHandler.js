const { analyzeMessage, susunBalasanAlami } = require('../services/groqService');
const { checkStock, calculateOrder } = require('../services/pricingService');
const { getAllStock } = require('../data/stock');
const { ambilRiwayat, tambahPesan, resetRiwayat } = require('../services/conversationStore');
const supabaseService = require('../services/supabaseService');
const paymentFlow = require('../services/paymentFlow');
const adminMode = require('../services/adminMode');
const filePrintFlow = require('../services/filePrintFlow');
const { formatRupiah } = require('../utils/formatter');
const env = require('../config/env');

// Kata kunci customer minta dihubungkan ke admin/manusia langsung -- dicek
// deterministik (bukan lewat intent AI) supaya gak pernah meleset, karena ini
// harus langsung memicu mode admin (bot berhenti total buat kontak itu).
const KATA_MINTA_ADMIN = /\b(admin|customer service|\bcs\b|orang asli|dihubungkan|sambungkan|hubungkan)\b/i;

function formatRincianText(rincian, total) {
  const teks = rincian
    .map((item) => {
      if (item.error) return `- ${item.nama}: ${item.error}`;
      return `- ${item.nama}: ${item.jumlah} ${item.satuan} x ${formatRupiah(item.hargaSatuan)} = ${formatRupiah(item.subtotal)}`;
    })
    .join('\n');
  return `${teks}\n\nTotal: ${formatRupiah(total)}`;
}

function formatInfoTambahanText(infoTambahan) {
  if (!infoTambahan || infoTambahan.length === 0) return '';
  const baris = infoTambahan
    .map((info) => {
      if (!info.ditemukan) return `- ${info.produk}: gak ada di daftar kami`;
      if (!info.tersedia) return `- ${info.nama}: lagi kosong`;
      return `- ${info.nama}: tersedia, harga ${formatRupiah(info.harga)}/lembar`;
    })
    .join('\n');
  return `\n\nOh iya, soal yang kamu tanya juga:\n${baris}`;
}

// Menentukan apa saja yang masih kurang untuk sebuah order, secara
// deterministik (bukan diserahkan ke AI untuk diputuskan) -- ini yang tadinya
// jadi sumber bug AI balik nanya harga ke customer. Mendukung banyak barang
// sekaligus dalam satu order (misal kertas A4 dan A5 bareng). Barang yang
// customer cuma TANYA doang (mau_dipesan: false, lihat groqService.js) gak
// ikut diproses sebagai order -- cuma di-cek stock-nya buat dilaporkan lewat
// infoTambahan, biar gak ke-mix ke perhitungan order yang lagi berjalan.
function cekKelengkapanOrder(daftarStock, analysis) {
  const daftarBarangTersedia = daftarStock.filter((s) => s.status === 'masih').map((s) => s.nama);

  const semuaBarang = analysis.barang || [];
  const barangUntukDipesan = semuaBarang.filter((b) => b.mau_dipesan !== false);
  const barangCumaDitanya = semuaBarang.filter((b) => b.mau_dipesan === false);
  const infoTambahan = barangCumaDitanya.map((b) => checkStock(daftarStock, b.produk, b.produk_cocok));

  if (barangUntukDipesan.length === 0) {
    return {
      lengkap: false,
      situasi: infoTambahan.length > 0 ? 'hanya_tanya_tanpa_pesan' : 'butuh_nama_barang_jelas',
      daftarBarangTersedia,
      infoTambahan,
    };
  }

  const barangTidakDitemukan = [];
  const barangHabis = [];
  const barangBelumJumlah = [];
  const barangValid = [];

  for (const b of barangUntukDipesan) {
    const hasil = checkStock(daftarStock, b.produk, b.produk_cocok);
    if (!hasil.ditemukan) {
      barangTidakDitemukan.push(b.produk || '(tidak disebutkan)');
      continue;
    }
    if (!hasil.tersedia) {
      barangHabis.push(hasil.nama);
      continue;
    }
    if (!b.jumlah_lembar || b.jumlah_lembar <= 0) {
      barangBelumJumlah.push(hasil.nama);
      continue;
    }
    barangValid.push({ nama: hasil.nama, harga: hasil.harga, jumlahLembar: b.jumlah_lembar });
  }

  if (barangTidakDitemukan.length > 0) {
    return { lengkap: false, situasi: 'butuh_nama_barang_jelas', produkTidakDitemukan: barangTidakDitemukan, daftarBarangTersedia, infoTambahan };
  }
  if (barangHabis.length > 0) {
    return { lengkap: false, situasi: 'barang_habis_saat_order', nama: barangHabis, infoTambahan };
  }
  if (barangBelumJumlah.length > 0) {
    return { lengkap: false, situasi: 'butuh_jumlah_lembar', namaBarang: barangBelumJumlah, infoTambahan };
  }

  return { lengkap: true, barangValid, infoTambahan };
}

// Balasan kutipan harga (belum dikonfirmasi) -- template tetap (bukan AI)
// karena isinya struk sungguhan, salah eja boleh, salah angka tidak boleh.
// infoTambahan (barang yang cuma ditanya, bukan mau dipesan) ditempel di
// akhir sebagai teks terpisah, gak ikut ke perhitungan total.
function buildQuoteReply(barangValid, jasaTambahanList, infoTambahan) {
  const order = calculateOrder({ barangValid, jasaTambahanList });
  return `Berikut rincian harga dari ${env.storeName}:\n${formatRincianText(order.rincian, order.total)}\n\nApakah pesanan ini bisa dilanjutkan, kak?${formatInfoTambahanText(infoTambahan)}`;
}

function hitungDetailOrder(barangValid, jasaTambahanList) {
  const order = calculateOrder({ barangValid, jasaTambahanList });
  const detail = order.rincian
    .filter((item) => !item.error)
    .map((item) => `${item.nama} ${item.jumlah} ${item.satuan}`)
    .join(', ');
  return { order, detail };
}

// Begitu customer benar-benar mengkonfirmasi mau order (bukan cuma tanya
// harga) DAN metode pembayaran sudah jelas -- order beneran ditulis/ditambah
// ke database yang sama dipakai dashboard. Kalau nomor ini masih punya order
// aktif (status belum "selesai"), barang baru DITAMBAHKAN ke order itu
// (bukan bikin baris baru) -- sesuai permintaan: order yang masih berjalan
// gak boleh kepecah jadi banyak baris cuma karena customer nambah barang.
async function simpanOrder({ barangValid, jasaTambahanList, nomorUntukOrder, namaCustomer, orderAktifId, status }) {
  const { order, detail } = hitungDetailOrder(barangValid, jasaTambahanList);

  if (orderAktifId) {
    const order_ = await supabaseService.tambahKeOrderAktif(orderAktifId, {
      detailTambahan: detail,
      totalTambahan: order.total,
      status,
    });
    return { order, detail, orderTersimpan: order_ };
  }

  const order_ = await supabaseService.buatOrder({
    namaCustomer: namaCustomer || 'Customer WA',
    nomorWaJid: nomorUntukOrder,
    detail,
    total: order.total,
    status,
  });
  return { order, detail, orderTersimpan: order_ };
}

// Dipanggil begitu customer mengkonfirmasi order TAPI metode pembayaran
// belum diketahui -- kalau toko cash-only (gak ada QRIS/rekening di
// Kustomisasi), langsung simpan order berstatus "belum" (siap diproses,
// gak perlu nunggu bukti apa-apa). Kalau ada QRIS/rekening, order BELUM
// disimpan dulu -- tunggu customer pilih metode dulu (lihat lanjutkanPembayaran).
async function mulaiAtauLanjutkanOrder(customerMessage, kelengkapan, analysis, nomor, nomorUntukOrder, namaPengirim, riwayat) {
  const orderAktif = await supabaseService.ambilOrderAktifTerbaru(nomorUntukOrder).catch(() => null);
  const config = await paymentFlow.konfigPembayaran();

  if (!config.adaQris && !config.adaRekening) {
    const { order, detail, orderTersimpan } = await simpanOrder({
      barangValid: kelengkapan.barangValid,
      jasaTambahanList: analysis.jasa_tambahan,
      nomorUntukOrder,
      namaCustomer: namaPengirim,
      orderAktifId: orderAktif?.id || null,
      status: 'belum',
    }).catch((error) => {
      console.error('[Order] Gagal simpan order dari WA:', error.message);
      return { orderTersimpan: null };
    });

    resetRiwayat(nomor);

    if (!orderTersimpan) {
      const { detail: detailGagal } = hitungDetailOrder(kelengkapan.barangValid, analysis.jasa_tambahan);
      return { text: await susunBalasanAlami(customerMessage, { situasi: 'order_gagal_disimpan', rincianText: detailGagal }, riwayat) };
    }

    // detail/total di sini SENGAJA punya order.total (cuma bagian yang baru
    // ditambahkan/dipesan kali ini), BUKAN orderTersimpan.total (total
    // kumulatif seluruh order termasuk yang sudah pernah dibayar sebelumnya)
    // -- customer nanya/bayar buat porsi yang baru ini aja.
    return {
      text: await susunBalasanAlami(
        customerMessage,
        {
          situasi: 'order_dikonfirmasi_cash_only',
          namaToko: env.storeName,
          detailOrder: detail,
          total: order.total,
          sedangNambahOrder: Boolean(orderAktif),
          infoTambahan: kelengkapan.infoTambahan,
        },
        riwayat
      ),
    };
  }

  // Ada metode selain cash -- tunda simpan order, tanya metode dulu.
  paymentFlow.mulaiTungguMetode(nomor, {
    barangValid: kelengkapan.barangValid,
    jasaTambahanList: analysis.jasa_tambahan,
    orderAktifId: orderAktif?.id || null,
    namaPengirim,
  });

  const opsi = ['cash'];
  if (config.adaQris) opsi.push('qris');
  if (config.adaRekening) opsi.push('transfer');

  const { order, detail } = hitungDetailOrder(kelengkapan.barangValid, analysis.jasa_tambahan);

  return {
    text: await susunBalasanAlami(
      customerMessage,
      {
        situasi: 'tanya_metode_pembayaran',
        opsiPembayaran: opsi,
        sedangNambahOrder: Boolean(orderAktif),
        rincianText: detail,
        total: order.total,
        infoTambahan: kelengkapan.infoTambahan,
      },
      riwayat
    ),
  };
}

// Dipanggil begitu customer sudah menyebut metode pembayaran (dideteksi
// deterministik di handleIncomingMessage, bukan lewat klasifikasi AI --
// biar gak meleset kayak kasus intent lain yang pernah salah).
async function lanjutkanPembayaran(customerMessage, tunggu, metode, nomor, nomorUntukOrder, riwayat) {
  const status = metode === 'cash' ? 'belum' : 'menunggu_bayar';

  const { order, detail, orderTersimpan } = await simpanOrder({
    barangValid: tunggu.barangValid,
    jasaTambahanList: tunggu.jasaTambahanList,
    nomorUntukOrder,
    namaCustomer: tunggu.namaPengirim,
    orderAktifId: tunggu.orderAktifId,
    status,
  }).catch((error) => {
    console.error('[Order] Gagal simpan order dari WA:', error.message);
    return { orderTersimpan: null };
  });

  paymentFlow.hapusTungguMetode(nomor);

  if (!orderTersimpan) {
    return { text: await susunBalasanAlami(customerMessage, { situasi: 'order_gagal_disimpan' }, riwayat) };
  }

  resetRiwayat(nomor);

  // order.total/detail di sini = cuma porsi yang barusan dipesan/dibayar
  // (delta), BUKAN orderTersimpan.total yang kumulatif -- lihat catatan di
  // mulaiAtauLanjutkanOrder.
  if (metode === 'cash') {
    return {
      text: await susunBalasanAlami(
        customerMessage,
        { situasi: 'order_dikonfirmasi_cash', namaToko: env.storeName, detailOrder: detail, total: order.total },
        riwayat
      ),
    };
  }

  if (metode === 'qris') {
    const qris = await supabaseService.ambilQrisConfig();
    const text = await susunBalasanAlami(
      customerMessage,
      { situasi: 'kirim_info_qris', rincianText: detail, total: order.total },
      riwayat
    );
    return { text, gambarUrl: qris?.gambar_url || null };
  }

  // transfer
  const daftarRekening = await supabaseService.ambilDaftarRekening();
  const text = await susunBalasanAlami(
    customerMessage,
    {
      situasi: 'kirim_info_rekening',
      rincianText: detail,
      total: order.total,
      daftarRekening: daftarRekening.map((r) => ({ bank: r.nama_bank, nomor: r.nomor_rekening, atasNama: r.atas_nama })),
    },
    riwayat
  );
  return { text };
}

// Titik masuk utama: menerima teks pesan customer + nomor pengirim + nama WA
// pengirim (kalau ada), mengembalikan { text, gambarUrl }. Riwayat obrolan
// singkat per nomor disimpan lewat conversationStore supaya AI "ingat"
// konteks lanjutan. Status pembayaran/order yang sudah final disimpan di
// database (bukan cuma riwayat obrolan yang bisa direset) supaya tahan bot
// restart -- lihat paymentFlow.js & supabaseService.js.
async function handleIncomingMessage(customerMessage, nomor = 'unknown', namaPengirim = null, nomorUntukOrder = nomor, adaGambar = false, infoFile = null) {
  const riwayat = ambilRiwayat(nomor);

  // 0. Customer minta ngobrol sama admin langsung -- prioritas paling tinggi,
  // langsung aktifkan mode admin (bot diam total buat kontak ini) apapun
  // state lain yang lagi berjalan.
  if (!adaGambar && KATA_MINTA_ADMIN.test(customerMessage)) {
    paymentFlow.hapusTungguMetode(nomor);
    paymentFlow.batalkanTimerReminder(nomor);
    adminMode.aktifkanModeAdmin(nomor);
    const balasan = 'Baik kak, saya hubungkan ke admin kami ya. Mohon ditunggu sebentar 🙏';
    tambahPesan(nomor, 'user', customerMessage);
    tambahPesan(nomor, 'assistant', balasan);
    return { text: balasan };
  }

  const orderAktif = await supabaseService.ambilOrderAktifTerbaru(nomorUntukOrder).catch(() => null);

  // 1. Gambar masuk & ada order yang lagi nunggu bukti bayar -- langsung
  //    dianggap bukti (gak wajib ada kata "sudah" segala, gambar aja cukup).
  if (adaGambar && orderAktif?.status === 'menunggu_bayar') {
    paymentFlow.batalkanTimerReminder(nomor);
    await supabaseService.updateStatusOrder(orderAktif.id, 'belum');
    const balasan = await susunBalasanAlami(
      customerMessage || '(kirim gambar)',
      { situasi: 'bukti_pembayaran_diterima' },
      riwayat
    );
    // Order ini sudah beneran lunas & tercatat -- riwayat obrolan yang
    // dipakai buat NEGOSIASI barang tadi harus dibuang di sini juga (bukan
    // cuma pas order pertama kali dikonfirmasi), soalnya baru DI SINI-lah
    // titik order itu benar-benar selesai secara pembayaran. Kalau lupa
    // direset di sini, permintaan tambah barang berikutnya bakal ke-mix
    // sama barang yang udah lunas ini (bug yang pernah kejadian).
    resetRiwayat(nomor);
    tambahPesan(nomor, 'user', customerMessage || '[gambar bukti pembayaran]');
    tambahPesan(nomor, 'assistant', balasan);
    return { text: balasan };
  }

  // 2. File (PDF/gambar) baru masuk buat diprint -- INTERUPSI apapun state
  //    lain yang lagi jalan (lagi nunggu metode pembayaran, dll), soalnya
  //    customer bisa aja nyusul kirim file kapan aja secara natural, gak
  //    harus nunggu obrolan sebelumnya kelar dulu. Ditanya ukuran kertas,
  //    TANPA sebut nama file/jumlah halaman (baru ditampilkan pas kalkulasi
  //    di langkah 3). Beberapa file sekaligus/berturut ditampung ke batch
  //    yang sama, cuma ditanya SEKALI -- file berikutnya gak dibales apa-apa
  //    (text: null), supaya gak spam pertanyaan yang sama berkali-kali.
  if (infoFile) {
    const { sudahAdaSebelumnya } = filePrintFlow.tambahFile(nomor, infoFile);
    tambahPesan(nomor, 'user', customerMessage || '[kirim file]');
    if (sudahAdaSebelumnya) {
      return { text: null };
    }
    const balasan = 'Oke kak, mau diprint pakai ukuran kertas apa?';
    tambahPesan(nomor, 'assistant', balasan);
    return { text: balasan };
  }

  // 3. Lagi nunggu customer jawab ukuran kertas buat file (atau kumpulan
  //    file) yang barusan dikirim -- dicoba dicocokkan ke stock pakai AI
  //    (buat handle typo/istilah beda), sama seperti pencocokan produk di
  //    order biasa. Jumlah halaman SEMUA file di batch digabung sebelum
  //    dikali harga kertas (lihat filePrintFlow.tetapkanUkuran).
  const fileMenungguUkuran = filePrintFlow.ambilMenungguUkuran(nomor);
  if (fileMenungguUkuran && customerMessage.trim()) {
    const daftarStockUkuran = await getAllStock();
    const analysisUkuran = await analyzeMessage(customerMessage, daftarStockUkuran, []);
    const kandidat = analysisUkuran.barang.find((b) => b.produk_cocok);
    const hasilCek = kandidat ? checkStock(daftarStockUkuran, kandidat.produk, kandidat.produk_cocok) : null;

    if (hasilCek?.ditemukan && hasilCek.tersedia) {
      const hasilUkuran = filePrintFlow.tetapkanUkuran(nomor, { nama: hasilCek.nama, harga: hasilCek.harga });
      const { order } = hitungDetailOrder(hasilUkuran.barangValid, []);
      const balasan = `Sebentar ya kak, saya cek dulu jumlah halaman filenya... oke, totalnya ada ${hasilUkuran.totalHalaman} halaman, diprint pakai ${hasilCek.nama} (${formatRupiah(hasilCek.harga)}/lembar). Totalnya ${formatRupiah(order.total)}. Mau dilanjutkan kak?`;
      tambahPesan(nomor, 'user', customerMessage);
      tambahPesan(nomor, 'assistant', balasan);
      return { text: balasan };
    }

    const balasan = `Maaf kak, ukuran kertas itu gak ada di kami. Mau pakai yang mana ya kak?`;
    tambahPesan(nomor, 'user', customerMessage);
    tambahPesan(nomor, 'assistant', balasan);
    return { text: balasan };
  }

  // 4. Harga file udah dihitung & ditunjukkan, tinggal nunggu konfirmasi
  //    lanjut/tidak dari customer. Kalau kebetulan ada order teks yang
  //    masih nunggu metode pembayaran (paymentFlow.tunggu) pas ini
  //    dikonfirmasi, GABUNGKAN barang file ini ke situ -- jangan bikin
  //    alur/order terpisah yang saling tabrakan, biar kayak manusia yang
  //    nyatet semuanya jadi satu pesanan.
  const fileMenungguKonfirmasi = filePrintFlow.ambilMenungguKonfirmasi(nomor);
  if (fileMenungguKonfirmasi) {
    if (paymentFlow.deteksiPembatalan(customerMessage)) {
      filePrintFlow.hapusSemua(nomor);
      const balasan = 'Oke kak, gapapa. Kalau mau print filenya nanti, tinggal kirim ulang aja ya.';
      tambahPesan(nomor, 'user', customerMessage);
      tambahPesan(nomor, 'assistant', balasan);
      return { text: balasan };
    }
    // Deteksi "customer beneran setuju lanjut" pakai AI (analysis.konfirmasi_deal)
    // yang sama dipakai buat order lewat teks -- BUKAN keyword sederhana lagi.
    // Sebelumnya pakai regex kata umum kayak "jadi"/"ya"/"oke" yang ternyata
    // gampang salah tangkap -- pesan "jadi totalnya berapa ya" (nanya doang)
    // kebaca sebagai konfirmasi gara-gara ada kata "jadi" & "ya" di situ,
    // order langsung ke-final-in sepihak tanpa customer beneran bilang oke.
    const daftarStockKonfirmasi = await getAllStock();
    const analysisKonfirmasi = await analyzeMessage(customerMessage, daftarStockKonfirmasi, riwayat);

    if (analysisKonfirmasi.konfirmasi_deal) {
      filePrintFlow.hapusSemua(nomor);
      const tungguTeksAktif = paymentFlow.ambilTungguMetode(nomor);
      let barangGabungan = fileMenungguKonfirmasi.barangValid;
      let jasaTambahanGabungan = [];
      if (tungguTeksAktif) {
        // Ada order teks yang masih nunggu dipilih metode pembayarannya --
        // gabung ke situ, bukan bikin order/tanya metode terpisah lagi.
        barangGabungan = [...tungguTeksAktif.barangValid, ...fileMenungguKonfirmasi.barangValid];
        jasaTambahanGabungan = tungguTeksAktif.jasaTambahanList || [];
        paymentFlow.hapusTungguMetode(nomor);
      }
      const kelengkapanFile = { lengkap: true, barangValid: barangGabungan, infoTambahan: [] };
      const analysisFile = { jasa_tambahan: jasaTambahanGabungan };
      const hasil = await mulaiAtauLanjutkanOrder(customerMessage, kelengkapanFile, analysisFile, nomor, nomorUntukOrder, namaPengirim, riwayat);
      tambahPesan(nomor, 'user', customerMessage);
      tambahPesan(nomor, 'assistant', hasil.text);
      return hasil;
    }
    if (paymentFlow.deteksiPembatalan(customerMessage)) {
      filePrintFlow.hapusSemua(nomor);
      const balasan = 'Oke kak, gapapa. Kalau mau print filenya nanti, tinggal kirim ulang aja ya.';
      tambahPesan(nomor, 'user', customerMessage);
      tambahPesan(nomor, 'assistant', balasan);
      return { text: balasan };
    }
    // Customer nanya sesuatu (misal "totalnya berapa ya") atau belum jelas
    // -- jawab pertanyaannya secara natural, TETAP dikunci ke rincian file
    // yang sudah dihitung (bukan dikarang ulang), jangan langsung dianggap
    // konfirmasi.
    const { order: orderFileSaatIni } = hitungDetailOrder(fileMenungguKonfirmasi.barangValid, []);
    const balasan = await susunBalasanAlami(
      customerMessage,
      { situasi: 'rincian_sudah_pernah_dikasih_sebelumnya', rincianTerakhir: formatRincianText(orderFileSaatIni.rincian, orderFileSaatIni.total) },
      riwayat
    );
    tambahPesan(nomor, 'user', customerMessage);
    tambahPesan(nomor, 'assistant', balasan);
    return { text: balasan };
  }

  // 5. Lagi nunggu customer pilih metode pembayaran dari order yang barusan
  //    dikonfirmasi -- dicek deterministik (keyword), BUKAN lewat intent AI,
  //    supaya gak meleset.
  const tunggu = paymentFlow.ambilTungguMetode(nomor);
  if (tunggu) {
    const config = await paymentFlow.konfigPembayaran();
    const metode = paymentFlow.deteksiMetodeDariTeks(customerMessage, config);
    if (metode) {
      const hasil = await lanjutkanPembayaran(customerMessage, tunggu, metode, nomor, nomorUntukOrder, riwayat);
      tambahPesan(nomor, 'user', customerMessage);
      tambahPesan(nomor, 'assistant', hasil.text);
      return hasil;
    }
    if (paymentFlow.deteksiPembatalan(customerMessage)) {
      paymentFlow.hapusTungguMetode(nomor);
      const balasan = await susunBalasanAlami(
        customerMessage,
        { situasi: 'batal_tambahan_order', adaOrderSebelumnya: Boolean(tunggu.orderAktifId) },
        riwayat
      );
      tambahPesan(nomor, 'user', customerMessage);
      tambahPesan(nomor, 'assistant', balasan);
      return { text: balasan };
    }
    // Belum jelas mau metode apa -- ingetin lagi opsi yang tersedia (dikasih
    // tau eksplisit opsi apa aja yang bener-bener valid, JANGAN diserahkan
    // ke AI tanpa data -- pernah kejadian AI ngarang jawaban "cash only"
    // padahal QRIS/rekening ada, gara-gara gak dikasih konteks opsinya).
    // Tetap simpan status menunggu (jangan dihapus, biar pesan berikutnya
    // masih bisa nyambung milih metode).
    const opsi = ['cash'];
    if (config.adaQris) opsi.push('qris');
    if (config.adaRekening) opsi.push('transfer');
    const balasan = await susunBalasanAlami(
      customerMessage,
      { situasi: 'menunggu_pilihan_metode_pembayaran', opsiPembayaran: opsi },
      riwayat
    );
    tambahPesan(nomor, 'user', customerMessage);
    tambahPesan(nomor, 'assistant', balasan);
    return { text: balasan };
  }

  // 6. Customer ngaku sudah bayar (kata kunci) tapi belum kirim gambar --
  //    tunggu sampai kapanpun, cuma diingetin sekali di menit ke-3.
  if (!adaGambar && orderAktif?.status === 'menunggu_bayar' && paymentFlow.deteksiKlaimSudahBayar(customerMessage)) {
    paymentFlow.mulaiTimerReminder(nomor, async () => {
      const whatsappService = require('../services/whatsappService');
      await whatsappService.kirimPesanKe(nomor, 'Bisa kirim gambar bukti pembayaran kak?');
    });
    const balasan = await susunBalasanAlami(
      customerMessage,
      { situasi: 'klaim_sudah_bayar_minta_bukti' },
      riwayat
    );
    tambahPesan(nomor, 'user', customerMessage);
    tambahPesan(nomor, 'assistant', balasan);
    return { text: balasan };
  }

  // Pesan gambar tanpa caption yang gak masuk kondisi di atas (gak ada order
  // yang lagi nunggu bayar, gak ada file yang lagi diproses) -- gak ada teks
  // buat dianalisis, balas singkat tanpa panggil AI.
  if (!customerMessage.trim() && adaGambar) {
    const balasan = 'Maaf kak, gambarnya diterima tapi boleh dijelasin juga maksudnya apa?';
    tambahPesan(nomor, 'user', '[gambar]');
    tambahPesan(nomor, 'assistant', balasan);
    return { text: balasan };
  }

  const daftarStock = await getAllStock();
  const analysis = await analyzeMessage(customerMessage, daftarStock, riwayat);

  let hasil;

  if (analysis.intent === 'cek_stock') {
    const daftarBarangDicek = analysis.barang.filter((b) => b && b.produk);
    if (daftarBarangDicek.length === 0) {
      hasil = { text: await susunBalasanAlami(customerMessage, { situasi: 'customer_tanya_stock_tapi_tidak_sebut_nama_barang' }, riwayat) };
    } else if (daftarBarangDicek.length === 1) {
      const hasilCek = checkStock(daftarStock, daftarBarangDicek[0].produk, daftarBarangDicek[0].produk_cocok);
      hasil = { text: await susunBalasanAlami(customerMessage, { situasi: 'hasil_cek_stock_satu_barang', ...hasilCek }, riwayat) };
    } else {
      const daftarHasil = daftarBarangDicek.map((b) => checkStock(daftarStock, b.produk, b.produk_cocok));
      hasil = { text: await susunBalasanAlami(customerMessage, { situasi: 'hasil_cek_stock_banyak_barang', daftarHasil }, riwayat) };
    }
  } else if (analysis.intent === 'lihat_semua_stock') {
    hasil = {
      text: await susunBalasanAlami(
        customerMessage,
        {
          situasi: 'daftar_semua_stock',
          daftarBarang: daftarStock.map((s) => ({
            nama: s.nama,
            harga: Number(s.harga),
            tersedia: s.status === 'masih',
          })),
        },
        riwayat
      ),
    };
  } else if (analysis.intent === 'tanya_harga_atau_order') {
    const kelengkapan = cekKelengkapanOrder(daftarStock, analysis);
    if (!kelengkapan.lengkap) {
      const { lengkap, ...situasiUntukAi } = kelengkapan;
      hasil = { text: await susunBalasanAlami(customerMessage, situasiUntukAi, riwayat) };
    } else if (analysis.konfirmasi_deal) {
      hasil = await mulaiAtauLanjutkanOrder(customerMessage, kelengkapan, analysis, nomor, nomorUntukOrder, namaPengirim, riwayat);
    } else {
      const teksQuote = buildQuoteReply(kelengkapan.barangValid, analysis.jasa_tambahan, kelengkapan.infoTambahan);
      // Kalau rincian yang barusan dihitung PERSIS sama dengan balasan terakhir
      // yang sudah dikirim (customer belum konfirmasi, cuma komentar/klarifikasi
      // seperti "iya kan 500 berarti perlembar"), jangan kirim ulang quote yang
      // sama mentah-mentah -- serahkan ke AI buat menanggapi komentarnya secara
      // natural, tetap dikunci ke rincian yang sama (bukan dikarang ulang).
      const balasanTerakhir = riwayat.length > 0 ? riwayat[riwayat.length - 1] : null;
      const rincianSudahDikasih = balasanTerakhir?.role === 'assistant' && balasanTerakhir.content === teksQuote;
      hasil = {
        text: rincianSudahDikasih
          ? await susunBalasanAlami(customerMessage, { situasi: 'rincian_sudah_pernah_dikasih_sebelumnya', rincianTerakhir: teksQuote }, riwayat)
          : teksQuote,
      };
    }
  } else if (analysis.intent === 'permintaan_khusus') {
    // Kasus di luar 4 kotak lama (nego harga, komplain, custom, tanya
    // pengiriman/waktu proses, dll) -- gak dihardcode satu-satu, tapi
    // dikasih data stock asli + ringkasan permintaan biar AI bisa jawab
    // adaptif per kasus. Angka/keputusan (diskon, dll) tetap dikunci lewat
    // instruksi di susunBalasanAlami, bukan diserahkan bebas ke AI.
    hasil = {
      text: await susunBalasanAlami(
        customerMessage,
        {
          situasi: 'permintaan_khusus_customer',
          namaToko: env.storeName,
          permintaanKhusus: analysis.permintaanKhusus,
          daftarBarangTersedia: daftarStock
            .filter((s) => s.status === 'masih')
            .map((s) => ({ nama: s.nama, harga: Number(s.harga) })),
        },
        riwayat
      ),
    };
  } else if (riwayat.length === 0) {
    // Obrolan baru mulai (belum ada riwayat sama sekali) -- sapaan pembuka
    // dibikin tetap/deterministik (bukan AI) biar wording-nya konsisten
    // setiap kali, termasuk nawarin opsi langsung ke admin.
    hasil = { text: `Halo kak! Saya adalah asisten AI WA ${env.storeName}. Ada yang bisa dibantu kak? Atau ingin langsung dihubungkan dengan admin?` };
  } else {
    hasil = { text: await susunBalasanAlami(customerMessage, { situasi: 'obrolan_umum_atau_sapaan', namaToko: env.storeName }, riwayat) };
  }

  tambahPesan(nomor, 'user', customerMessage);
  tambahPesan(nomor, 'assistant', hasil.text);

  return hasil;
}

module.exports = { handleIncomingMessage };
