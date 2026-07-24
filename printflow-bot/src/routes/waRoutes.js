const express = require('express');
const waController = require('../controllers/waController');

const router = express.Router();

router.get('/status', waController.status);
router.get('/events', waController.events);
router.post('/logout', waController.logout);
router.post('/debug-send-self', waController.debugSendSelf);

module.exports = router;
