const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { resolveShop } = require('../middleware/shopMiddleware');
const manufacturingController = require('../controllers/manufacturingController');

router.use(protect, resolveShop);

router.get('/', manufacturingController.getImages);
router.post('/', manufacturingController.createImage);
router.post('/bulk', manufacturingController.createImagesBulk);
router.delete('/:id', manufacturingController.deleteImage);

module.exports = router;
