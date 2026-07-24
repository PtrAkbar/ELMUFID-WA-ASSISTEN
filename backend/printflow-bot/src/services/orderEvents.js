const { EventEmitter } = require('events');
const { client } = require('../models/supabaseClient');

// Relay perubahan tabel "orders" secara realtime ke dashboard lewat SSE --
// terpisah dari orderModel.dengarkanPerubahanStatus() yang khusus buat
// notifikasi WA customer (cuma dengar event UPDATE). Di sini semua jenis
// perubahan (INSERT/UPDATE/DELETE) diteruskan, dashboard yang urus
// tampilannya masing-masing (order baru masuk, status berubah, dst).
const emitter = new EventEmitter();
let started = false;

function start() {
  if (started || !client) return;
  started = true;

  client
    .channel('dashboard-orders-relay')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
      emitter.emit('change', { type: payload.eventType, row: payload.new || payload.old });
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[OrderEvents] Mendengarkan perubahan order untuk relay SSE dashboard.');
      }
    });
}

function onChange(listener) {
  start();
  emitter.on('change', listener);
  return () => emitter.off('change', listener);
}

module.exports = { onChange };
