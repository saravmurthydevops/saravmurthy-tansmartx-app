const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.json({
    provider: "Azure",
    categories: ["Compute", "Storage", "Database", "Networking", "AI / ML"],
    services: [
      {
        name: "Virtual Machines",
        description: "Azure VM platform for business workloads.",
        price: "RM 220/month",
        tags: ["b-series", "d-series"]
      },
      {
        name: "AKS",
        description: "Managed Kubernetes service.",
        price: "RM 300/month",
        tags: ["kubernetes", "containers"]
      },
      {
        name: "Azure SQL",
        description: "Managed SQL database service.",
        price: "RM 180/month",
        tags: ["sql", "managed db"]
      }
    ],
    architecture: [
      "Users",
      "Internet",
      "Application Gateway",
      "AKS",
      "Azure SQL"
    ]
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`TanSmartX backend listening on port ${port}`);
});
