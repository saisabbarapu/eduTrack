const express = require('express');
const multer = require('../config/multer');
const { auth, role } = require('../middleware/auth');
const {
  create,
  getAll,
  getTaggedForGuide,
  getOne,
  tagGuide,
  guideResponse,
  updateProgress,
  updateMilestone,
  completeProject,
  uploadFinalReport,
  adminStats
} = require('../controllers/projectController');

const router = express.Router();

router.use(auth);

router.post('/', role('student'), multer.fields([{ name: 'proposalPdf', maxCount: 1 }]), create);
router.get('/', getAll);
router.get('/tagged', role('guide'), getTaggedForGuide);
router.get('/admin-stats', role('admin'), adminStats);
router.get('/:id', getOne);
router.patch('/:id/tag-guide', role('student'), tagGuide);
router.patch('/:id/guide-response', role('guide'), guideResponse);
router.patch('/:id/progress', role('student'), updateProgress);
router.patch('/:id/milestones/:milestoneId', updateMilestone);
router.patch('/:id/complete', role('guide'), completeProject);
router.post('/:id/final-report', role('student'), multer.single('finalReportPdf'), uploadFinalReport);

module.exports = router;
