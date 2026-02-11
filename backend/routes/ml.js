const express = require('express');
const { auth } = require('../middleware/auth');
const { delayRisk, duplicateCheck, performanceRisk, getReport } = require('../controllers/mlController');

const router = express.Router();
router.use(auth);

router.get('/delay-risk/:id', delayRisk);
router.post('/duplicate-check', duplicateCheck);
router.get('/performance-risk/:id', performanceRisk);
router.get('/report/:id', getReport);

module.exports = router;
