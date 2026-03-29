const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/catalog', require('./routes/catalog'));
app.use('/api/pricing', require('./routes/pricing'));
app.use('/api/diagram', require('./routes/diagram'));

const PORT = process.env.PORT || 4010;
app.listen(PORT, () => console.log(`TanSmartX v3 PRO backend running on http://localhost:${PORT}`));
