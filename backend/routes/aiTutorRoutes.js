const express = require('express');
const router = express.Router();
const aiTutorController = require('../controllers/aiTutorController');

router.post('/ask', aiTutorController.ask);

module.exports = router;
