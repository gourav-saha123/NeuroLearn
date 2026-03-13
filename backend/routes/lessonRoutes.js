const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');

router.get('/:topic', lessonController.getLesson);

module.exports = router;
