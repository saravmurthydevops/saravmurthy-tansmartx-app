const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const catalog = {
  Azure: {
    summary: {
      regions: "60+",
      focus: "Enterprise Microsoft workloads",
    },
    categories: {
      Compute: [
        {
          name: "Virtual Machines",
          description: "Azure VM platform for business workloads.",
          starting_monthly: "RM 220",
          starting_hourly: "RM 0.30/hr",
          region: "Southeast Asia",
          tags: ["b-series", "d-series", "windows", "linux"],
        },
        {
          name: "AKS",
          description: "Managed Kubernetes service for container platforms.",
          starting_monthly: "RM 300",
          starting_hourly: "RM 0.41/hr",
          region: "Southeast Asia",
          tags: ["kubernetes", "containers", "microservices"],
        },
        {
          name: "App Service",
          description: "Managed web app hosting for APIs and frontends.",
          starting_monthly: "RM 160",
          starting_hourly: "RM 0.22/hr",
          region: "Southeast Asia",
          tags: ["paas", "web", "api"],
        },
      ],
      Storage: [
        {
          name: "Blob Storage",
          description: "Scalable object storage for enterprise data.",
          starting_monthly: "RM 45",
          starting_hourly: "RM 0.06/hr",
          region: "Southeast Asia",
          tags: ["object-storage", "backup", "archive"],
        },
      ],
      Database: [
        {
          name: "Azure SQL",
          description: "Managed SQL database service.",
          starting_monthly: "RM 180",
          starting_hourly: "RM 0.25/hr",
          region: "Southeast Asia",
          tags: ["sql", "managed-db", "ha"],
        },
        {
          name: "PostgreSQL Flexible Server",
          description: "Managed PostgreSQL with HA and scaling options.",
          starting_monthly: "RM 210",
          starting_hourly: "RM 0.29/hr",
          region: "Southeast Asia",
          tags: ["postgres", "managed-db", "ha"],
        },
      ],
      Networking: [
        {
          name: "Application Gateway",
          description: "Layer 7 load balancing and WAF.",
          starting_monthly: "RM 130",
          starting_hourly: "RM 0.18/hr",
          region: "Southeast Asia",
          tags: ["waf", "load-balancer", "security"],
        },
      ],
      "AI / ML": [
        {
          name: "Azure OpenAI",
          description: "Enterprise AI model platform for application integration.",
          starting_monthly: "RM 500",
          starting_hourly: "Usage-based",
          region: "Global",
          tags: ["llm", "ai", "genai"],
        },
      ],
    },
  },

  AWS: {
    summary: {
      regions: "30+",
      focus: "Cloud-native and large-scale workloads",
    },
    categories: {
      Compute: [
        {
          name: "EC2",
          description: "Elastic compute for enterprise applications.",
          starting_monthly: "RM 230",
          starting_hourly: "RM 0.31/hr",
          region: "ap-southeast-1",
          tags: ["ec2", "linux", "windows"],
        },
        {
          name: "EKS",
          description: "Managed Kubernetes service on AWS.",
          starting_monthly: "RM 320",
          starting_hourly: "RM 0.44/hr",
          region: "ap-southeast-1",
          tags: ["kubernetes", "containers", "microservices"],
        },
        {
          name: "Elastic Beanstalk",
          description: "Managed application deployment service.",
          starting_monthly: "RM 150",
          starting_hourly: "RM 0.20/hr",
          region: "ap-southeast-1",
          tags: ["paas", "web", "deployment"],
        },
      ],
      Storage: [
        {
          name: "S3",
          description: "Scalable object storage for backup and applications.",
          starting_monthly: "RM 40",
          starting_hourly: "RM 0.05/hr",
          region: "ap-southeast-1",
          tags: ["object-storage", "archive", "backup"],
        },
      ],
      Database: [
        {
          name: "RDS for PostgreSQL",
          description: "Managed PostgreSQL for transactional workloads.",
          starting_monthly: "RM 205",
          starting_hourly: "RM 0.28/hr",
          region: "ap-southeast-1",
          tags: ["postgres", "rds", "managed-db"],
        },
      ],
      Networking: [
        {
          name: "Application Load Balancer",
          description: "Layer 7 load balancing for HTTP and HTTPS traffic.",
          starting_monthly: "RM 125",
          starting_hourly: "RM 0.17/hr",
          region: "ap-southeast-1",
          tags: ["alb", "load-balancer", "http"],
        },
      ],
      "AI / ML": [
        {
          name: "Amazon Bedrock",
          description: "Foundation model platform for generative AI workloads.",
          starting_monthly: "RM 520",
          starting_hourly: "Usage-based",
          region: "selected regions",
          tags: ["genai", "llm", "bedrock"],
        },
      ],
    },
  },

  GCP: {
    summary: {
      regions: "35+",
      focus: "Data, Kubernetes, and modern application platforms",
    },
    categories: {
      Compute: [
        {
          name: "Compute Engine",
          description: "Virtual machines for enterprise and application workloads.",
          starting_monthly: "RM 225",
          starting_hourly: "RM 0.30/hr",
          region: "asia-southeast1",
          tags: ["vm", "linux", "windows"],
        },
        {
          name: "GKE",
          description: "Managed Kubernetes for production container platforms.",
          starting_monthly: "RM 315",
          starting_hourly: "RM 0.43/hr",
          region: "asia-southeast1",
          tags: ["kubernetes", "containers", "platform"],
        },
        {
          name: "Cloud Run",
          description: "Serverless containers for APIs and microservices.",
          starting_monthly: "RM 140",
          starting_hourly: "Usage-based",
          region: "asia-southeast1",
          tags: ["serverless", "containers", "api"],
        },
      ],
      Storage: [
        {
          name: "Cloud Storage",
          description: "Object storage for data, backup, and static assets.",
          starting_monthly: "RM 42",
          starting_hourly: "RM 0.05/hr",
          region: "asia-southeast1",
          tags: ["object-storage", "backup", "archive"],
        },
      ],
      Database: [
        {
          name: "Cloud SQL",
          description: "Managed relational database for applications.",
          starting_monthly: "RM 190",
          starting_hourly: "RM 0.26/hr",
          region: "asia-southeast1",
          tags: ["sql", "managed-db", "mysql"],
        },
      ],
      Networking: [
        {
          name: "Cloud Load Balancing",
          description: "Global and regional load balancing for applications.",
          starting_monthly: "RM 120",
          starting_hourly: "RM 0.16/hr",
          region: "global",
          tags: ["load-balancer", "global", "networking"],
        },
      ],
      "AI / ML": [
        {
          name: "Vertex AI",
          description: "Managed ML and generative AI platform on Google Cloud.",
          starting_monthly: "RM 510",
          starting_hourly: "Usage-based",
          region: "selected regions",
          tags: ["ai", "ml", "genai"],
        },
      ],
    },
  },
};

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.json({ message: "TanSmartX backend is running" });
});

app.get("/api/catalog", (req, res) => {
  res.json(catalog);
});

app.post("/api/pricing", (req, res) => {
  const { services = [] } = req.body;

  const items = services.map((service) => ({
    name: service.name,
    monthly: service.starting_monthly || service.price || "RM 0",
  }));

  const total = services.reduce((sum, service) => {
    const raw = service.starting_monthly || service.price || "";
    const value = Number(String(raw).replace(/[^\d.]/g, ""));
    return sum + (Number.isNaN(value) ? 0 : value);
  }, 0);

  res.json({
    monthly: `RM ${total.toFixed(2)}`,
    hourly: "Calculated from selected services",
    items,
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`TanSmartX backend listening on port ${port}`);
});
