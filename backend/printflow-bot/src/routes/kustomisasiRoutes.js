const express = require('express');
const multer = require('multer');
const kustomisasiController = require('../controllers/kustomisasiController');
const { requireAuth } = require('../middlewares/authMiddleware');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = express.Router();

router.use(requireAuth);

router.get('/', kustomisasiController.ambilSemua);
router.post('/qris', upload.single('file'), kustomisasiController.uploadQris);
router.delete('/qris', kustomisasiController.hapusQris);
router.post('/rekening', kustomisasiController.tambahRekening);
router.delete('/rekening/:id', kustomisasiController.hapusRekening);

module.exports = router;
