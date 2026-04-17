const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/* =========================================
   🧠 SIMPLE IN-MEMORY DB (upgrade to Postgres later)
========================================= */
let projects = [];

/* =========================================
   📦 CATALOG (your existing one – unchanged)
========================================= */
const catalog = require("./catalog.json");
// 👉 optional: move your big catalog into catalog.json later

/* =========================================
   ❤️ HEALTH
========================================= */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* =========================================
   📦 GET CATALOG
========================================= */
app.get("/api/catalog", (req, res) => {
  res.json(catalog);
});

/* =========================================
   💰 PRICING ENGINE (ENHANCED)
========================================= */
app.post("/api/pricing", (req, res) => {
  const { services = [], environment = "dev" } = req.body;

  const multiplier =
    environment === "prod" ? 1.5 :
    environment === "staging" ? 1.2 : 1;

  const items = services.map((s) => {
    const base = Number(
      String(s.starting_monthly || "0").replace(/[^\d.]/g, "")
    );

    const cost = base * multiplier;

    return {
      name: s.name,
      monthly: `RM ${cost.toFixed(2)}`
    };
  });

  const total = items.reduce((sum, i) => {
    const val = Number(i.monthly.replace(/[^\d.]/g, ""));
    return sum + val;
  }, 0);

  res.json({
    monthly: `RM ${total.toFixed(2)}`,
    environment,
    items
  });
});

/* =========================================
   🧠 RECOMMENDATION ENGINE (NEW)
========================================= */
app.post("/api/recommend", (req, res) => {
  const { provider, services = [] } = req.body;

  let architecture = {
    users: ["End Users"],
    edge: [],
    network: [],
    app: [],
    data: [],
    ops: ["Monitoring", "Logging", "Backup"]
  };

  // EDGE
  if (provider === "Azure") {
    architecture.edge.push("Front Door", "Application Gateway");
    architecture.network.push("VNet");
  } else if (provider === "AWS") {
    architecture.edge.push("CloudFront", "ALB");
    architecture.network.push("VPC");
  } else {
    architecture.edge.push("Cloud Load Balancer");
    architecture.network.push("VPC Network");
  }

  // APP LAYER
  architecture.app = services.map((s) => s.name);

  // DATA LAYER AUTO DETECT
  services.forEach((s) => {
    if (s.name.includes("SQL") || s.name.includes("Postgre")) {
      architecture.data.push("Database Tier");
    }
    if (s.name.includes("Storage") || s.name.includes("S3")) {
      architecture.data.push("Storage Tier");
    }
  });

  if (architecture.data.length === 0) {
    architecture.data.push("Data Services");
  }

  res.json(architecture);
});

/* =========================================
   💾 PROJECT SAVE (NEW)
========================================= */
app.post("/api/projects", (req, res) => {
  const { name, provider, services } = req.body;

  const project = {
    id: Date.now().toString(),
    name,
    provider,
    services,
    created: new Date()
  };

  projects.push(project);

  res.json(project);
});

/* =========================================
   📂 PROJECT LIST
========================================= */
app.get("/api/projects", (req, res) => {
  res.json(projects);
});

/* =========================================
   🚀 START
========================================= */
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 TanSmartX SaaS backend running on ${port}`);
});
