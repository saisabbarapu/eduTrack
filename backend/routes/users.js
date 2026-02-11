const express = require('express');
const { getAll, getGuides } = require('../controllers/userController');
const { auth, role } = require('../middleware/auth');

const router = express.Router();
router.get('/', auth, role('admin'), getAll);
router.get('/guides', auth, getGuides);

module.exports = router;
