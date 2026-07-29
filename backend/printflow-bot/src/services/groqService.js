const Groq = require('groq-sdk');
const env = require('../config/env');
const { buatSystemPromptAnalisis, buatSystemPromptBalasan, normalisasiAnalysis } = require('./aiPrompts');

const groq = new Groq({ apiKey: env.groqApiKey });

// riwayat: array {role: 'user'|'assistant', content} dari obrolan sebelumnya
// dengan nomor yang sama (lihat conversationStore.js), disisipkan sebagai
// giliran chat asli sebelum pesan customer saat ini, supaya AI benar-benar
// "ingat" konteksnya lewat kemampuan multi-turn model, bukan lewat state
// buatan sendiri yang gampang meleset.
async function analyzeMessage(customerMessage, daftarStock = [], riwayat = []) {
  const completion = await groq.chat.completions.create({
    model: env.groqModel,
    messages: [
      { role: 'system', content: buatSystemPromptAnalisis(daftarStock) },
      ...riwayat,
      { role: 'user', content: customerMessage },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = {};
  }

  return normalisasiAnalysis(data);
}

// Menyusun balasan akhir dengan bahasa natural (bukan template kaku), tapi
// tetap dikunci ke fakta yang diberikan lewat "konteks" -- AI cuma boleh
// mengarang cara bicara, bukan mengarang angka/status/data. Dipisah dari
// analyzeMessage supaya prompt ekstraksi (butuh presisi, temperature rendah)
// tidak tercampur dengan prompt mengobrol (butuh variasi, temperature lebih
// tinggi).
async function susunBalasanAlami(pesanCustomer, konteks, riwayat = []) {
  const completion = await groq.chat.completions.create({
    model: env.groqModel,
    messages: [
      { role: 'system', content: buatSystemPromptBalasan(konteks, env.storeName) },
      ...riwayat,
      { role: 'user', content: pesanCustomer },
    ],
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content?.trim() || 'Maaf kak, boleh diulangi lagi pertanyaannya?';
}

module.exports = { analyzeMessage, susunBalasanAlami };
