const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { resolveShop } = require('../middleware/shopMiddleware');
const activityLogger = require('../middleware/activityLogger');
const manufacturingController = require('../controllers/manufacturingController');

router.use(protect, resolveShop, activityLogger);

router.get('/', manufacturingController.getImages);
router.post('/', manufacturingController.createImage);
router.post('/bulk', manufacturingController.createImagesBulk);
router.delete('/:id', manufacturingController.deleteImage);

module.exports = router;
