const express = require('express');
const router = express.Router();
const { getTranslations } = require('../controllers/localizationController');

router.get('/translations/:lang', getTranslations);

module.exports = router;
