const express = require('express');
const router = express.Router();
router.post('/', (req, res) => {
  const services = req.body.services || [];
  res.json({ nodes: ['Users', 'Internet', ...services.map((s) => s.name)] });
});
module.exports = router;
