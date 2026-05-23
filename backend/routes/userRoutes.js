const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, authorize('super-admin', 'admin'), getUsers);

router
  .route('/:id')
  .put(protect, authorize('super-admin', 'admin'), updateUser)
  .delete(protect, authorize('super-admin', 'admin'), deleteUser);

module.exports = router;
