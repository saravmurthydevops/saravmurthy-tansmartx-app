const express = require('express');
const router = express.Router();
const catalog = require('../data/catalog.json');

router.get('/', (req, res) => res.json(catalog.providers));
module.exports = router;
