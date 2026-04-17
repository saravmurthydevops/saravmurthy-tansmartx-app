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
