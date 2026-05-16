const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { resolveShop } = require('../middleware/shopMiddleware');
const productController = require('../controllers/productController');

router.use(protect, resolveShop);

router.get('/', productController.getProducts);
router.post('/', productController.createProduct);
router.post('/bulk', productController.bulkCreateProducts);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
