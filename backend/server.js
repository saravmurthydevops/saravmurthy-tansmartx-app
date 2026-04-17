const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const catalog = {
  Azure: {
    categories: {
      Compute: [
        {
          name: "Virtual Machines",
          description: "Azure VM platform for business workloads.",
          starting_monthly: "RM 220",
          starting_hourly: "RM 0.30/hr",
          region: "Southeast Asia",
          tags: ["b-series", "d-series", "windows", "linux"]
        },
        {
          name: "AKS",
          description: "Managed Kubernetes service.",
          starting_monthly: "RM 300",
          starting_hourly: "RM 0.41/hr",
          region: "Southeast Asia",
          tags: ["kubernetes", "containers"]
        },
        {
          name: "App Service",
          description: "Managed web app hosting.",
          starting_monthly: "RM 160",
          starting_hourly: "RM 0.22/hr",
          region: "Southeast Asia",
          tags: ["paas", "web"]
        }
      ],
      Database: [
        {
          name: "Azure SQL",
          description: "Managed SQL database.",
          starting_monthly: "RM 180",
          starting_hourly: "RM 0.25/hr",
          region: "Southeast Asia",
          tags: ["sql", "managed-db"]
        }
      ]
    }
  },

  AWS: {
    categories: {
      Compute: [
        {
          name: "EC2",
          description: "Elastic compute.",
          starting_monthly: "RM 230",
          starting_hourly: "RM 0.31/hr",
          region: "ap-southeast-1",
          tags: ["ec2"]
        }
      ]
    }
  },

  GCP: {
    categories: {
      Compute: [
        {
          name: "Compute Engine",
          description: "Virtual machines.",
          starting_monthly: "RM 225",
          starting_hourly: "RM 0.30/hr",
          region: "asia-southeast1",
          tags: ["vm"]
        }
      ]
    }
  }
};

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.json({ message: "TanSmartX backend running" });
});

app.get("/catalog", (req, res) => {
  res.json(catalog);
});

app.post("/pricing", (req, res) => {
  const { services = [] } = req.body;

  const items = services.map((service) => ({
    name: service.name,
    monthly: service.starting_monthly || "RM 0"
  }));

  const total = services.reduce((sum, service) => {
    const raw = service.starting_monthly || "";
    const value = Number(String(raw).replace(/[^\d.]/g, ""));
    return sum + (Number.isNaN(value) ? 0 : value);
  }, 0);

  res.json({
    monthly: `RM ${total.toFixed(2)}`,
    hourly: "Calculated",
    items
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`TanSmartX backend running on port ${port}`);
});
