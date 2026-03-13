const express = require('express');
const router = express.Router();
const confusionController = require('../controllers/confusionController');

router.post('/analyze', confusionController.analyze);

module.exports = router;
