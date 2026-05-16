const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { resolveShop } = require('../middleware/shopMiddleware');
const activityLogger = require('../middleware/activityLogger');
const bultyController = require('../controllers/bultyController');

router.use(protect, resolveShop, authorize('admin'), activityLogger);

router.get('/', bultyController.getBulties);
router.post('/', bultyController.createBulty);
router.put('/:id', bultyController.updateBulty);
router.delete('/:id', bultyController.deleteBulty);

module.exports = router;
