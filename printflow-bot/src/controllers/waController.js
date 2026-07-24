const waState = require('../services/waState');
const { logoutWhatsApp, kirimTesKeDiriSendiri } = require('../services/whatsappService');

function status(req, res) {
  res.json(waState.getState());
}

function events(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (state) => res.write(`data: ${JSON.stringify(state)}\n\n`);
  send(waState.getState());

  const unsubscribe = waState.onUpdate(send);
  req.on('close', unsubscribe);
}

async function logout(req, res) {
  try {
    await logoutWhatsApp();
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}

async function debugSendSelf(req, res) {
  try {
    const hasil = await kirimTesKeDiriSendiri();
    res.json({ ok: true, hasil });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}

module.exports = { status, events, logout, debugSendSelf };
