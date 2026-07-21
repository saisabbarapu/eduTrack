const express = require("express");
const { auth, role } = require("../middleware/auth");
const { create, getByProject } = require("../controllers/reviewController");

const router = express.Router();
router.use(auth);

router.post("/", role("guide"), create);
router.get("/project/:projectId", getByProject);

module.exports = router;
