const { startWhatsAppBot } = require('./services/whatsappService');
const { createServer } = require('./app');
const env = require('./config/env');

console.log('Memulai PrintFlow Bot...');

const app = createServer();
app.listen(env.apiPort, () => {
  console.log(`[API] Server status WA berjalan di http://localhost:${env.apiPort}`);
});

startWhatsAppBot().catch((error) => {
  console.error('Gagal memulai bot:', error);
  process.exit(1);
});
