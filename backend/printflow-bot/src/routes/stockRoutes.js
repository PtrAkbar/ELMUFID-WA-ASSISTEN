const express = require('express');
const stockController = require('../controllers/stockController');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', stockController.ambilSemua);
router.post('/', stockController.tambah);
router.post('/bulk', stockController.tambahBanyak);
router.patch('/:kode', stockController.ubah);
router.delete('/', stockController.hapusSemua);
router.delete('/:kode', stockController.hapus);

module.exports = router;
