const express = require('express');
const orderController = require('../controllers/orderController');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', orderController.ambilSemua);
router.get('/events', orderController.events);
router.post('/', orderController.tambah);
router.patch('/:id/status', orderController.ubahStatus);
router.delete('/aktif', orderController.hapusSemuaAktif);
router.delete('/riwayat', orderController.hapusSemuaRiwayat);

module.exports = router;
