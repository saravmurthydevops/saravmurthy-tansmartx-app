const express = require('express');
const router = express.Router();

function num(value, fallback) {
  if (!value || typeof value !== 'string') return fallback;
  if (value.toLowerCase().includes('usage') || value.toLowerCase().includes('varies')) return fallback;
  const m = value.match(/\$([0-9.]+)/);
  return m ? Number(m[1]) : fallback;
}

router.post('/', (req, res) => {
  const services = req.body.services || [];
  const items = services.map((service, idx) => {
    const base = num(service.starting_monthly, 20 + idx * 12);
    return { name: service.name, monthly: `$${base.toFixed(0)}+` };
  });
  const monthly = items.reduce((sum, item) => sum + Number(item.monthly.replace(/[^0-9.]/g, '')), 0);
  const hourly = monthly ? (monthly / 730).toFixed(2) : '0.00';
  res.json({ monthly: `$${monthly.toFixed(0)}+`, hourly: `$${hourly}+`, items });
});

module.exports = router;
