import React, { useEffect, useMemo, useState } from "react";

const API = window.location.origin;

export default function App() {
  const [catalog, setCatalog] = useState({});
  const [provider, setProvider] = useState("Azure");
  const [category, setCategory] = useState("Compute");
  const [selected, setSelected] = useState([]);
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [environment, setEnvironment] = useState("Production");
  const [topology, setTopology] = useState("Standard 3-Tier");
  const [internetFacing, setInternetFacing] = useState(true);
  const [highAvailability, setHighAvailability] = useState(true);
  const [region, setRegion] = useState("Auto");

  useEffect(() => {
    fetch(`${API}/api/catalog`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API request failed: ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        setCatalog(json);

        const providerList = Object.keys(json || {});
        const firstProvider = providerList[0] || "Azure";
        const firstCategory =
          Object.keys(json[firstProvider]?.categories || {})[0] || "Compute";

        setProvider(firstProvider);
        setCategory(firstCategory);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load TanSmartX enterprise catalog.");
        setLoading(false);
      });
  }, []);

  const providers = useMemo(() => Object.keys(catalog || {}), [catalog]);

  const providerSummary = useMemo(() => {
    return catalog?.[provider]?.summary || {};
  }, [catalog, provider]);

  const categories = useMemo(() => {
    return Object.keys(catalog?.[provider]?.categories || {});
  }, [catalog, provider]);

  const allProviderServices = useMemo(() => {
    const categoryMap = catalog?.[provider]?.categories || {};
    return Object.values(categoryMap).flat();
  }, [catalog, provider]);

  const regions = useMemo(() => {
    const raw = allProviderServices
      .map((s) => s.region)
      .filter(Boolean)
      .filter((value, index, arr) => arr.indexOf(value) === index);

    return ["Auto", ...raw];
  }, [allProviderServices]);

  const services = useMemo(() => {
    const list = catalog?.[provider]?.categories?.[category] || [];
    return list.filter((s) => {
      const matchesSearch = `${s.name} ${s.description} ${(s.tags || []).join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesRegion = region === "Auto" || s.region === region;

      return matchesSearch && matchesRegion;
    });
  }, [catalog, provider, category, search, region]);

  const estimatedCost = useMemo(() => {
    const items = selected.map((item) => {
      const monthly = item.starting_monthly || item.price || "RM 0/month";
      return {
        name: item.name,
        monthly,
      };
    });

    const total = selected.reduce((sum, item) => {
      const raw = item.starting_monthly || item.price || "";
      const value = Number(String(raw).replace(/[^\d.]/g, ""));
      return sum + (Number.isNaN(value) ? 0 : value);
    }, 0);

    const multiplier =
      environment === "Production"
        ? highAvailability
          ? 1.35
          : 1.15
        : environment === "Staging"
        ? 0.7
        : 0.45;

    return {
      monthly: `RM ${(total * multiplier).toFixed(2)}/month`,
      items,
    };
  }, [selected, environment, highAvailability]);

  function toggleService(service) {
    setActive(service);
    setSelected((prev) =>
      prev.some((s) => s.name === service.name)
        ? prev.filter((s) => s.name !== service.name)
        : [...prev, service]
    );
  }

  const recommendations = useMemo(() => {
    const selectedNames = selected.map((s) => s.name).join(" ");

    const result = [];

    if (internetFacing) {
      result.push(
        provider === "Azure"
          ? "Add Front Door or Application Gateway for secure internet ingress"
          : provider === "AWS"
          ? "Add CloudFront or Application Load Balancer for secure internet ingress"
          : "Add Cloud Load Balancer for public entry and traffic distribution"
      );
    }

    if (
      /AKS|EKS|GKE|Kubernetes/i.test(selectedNames) &&
      !selected.some((s) =>
        /Application Gateway|Application Load Balancer|Cloud Load Balancing/i.test(
          s.name
        )
      )
    ) {
      result.push("Kubernetes platforms should sit behind a load balancer and private network layer");
    }

    if (
      /SQL|PostgreSQL|RDS/i.test(selectedNames) &&
      highAvailability
    ) {
      result.push("Use HA database deployment with backups and private connectivity");
    }

    if (topology === "Standard 3-Tier") {
      result.push("Separate edge, application, and data layers for cleaner architecture and governance");
    }

    if (environment === "Production") {
      result.push("Production should include monitoring, backup, and availability design");
    }

    if (result.length === 0) {
      result.push("Start with a load balancer, application tier, and managed database baseline");
    }

    return result;
  }, [provider, selected, internetFacing, highAvailability, topology, environment]);

  const architecture = useMemo(() => {
    const edge =
      provider === "Azure"
        ? internetFacing
          ? ["Front Door", "Application Gateway / WAF"]
          : ["Internal Application Gateway"]
        : provider === "AWS"
        ? internetFacing
          ? ["CloudFront", "Application Load Balancer / WAF"]
          : ["Internal Load Balancer"]
        : internetFacing
        ? ["Cloud Load Balancer", "Cloud Armor / Edge Security"]
        : ["Internal Load Balancer"];

    const network =
      provider === "AWS"
        ? ["VPC", highAvailability ? "Multi-AZ Subnets" : "Application Subnets"]
        : ["VNet", highAvailability ? "Multi-Zone Subnets" : "Application Subnets"];

    const appServices = selected.filter((s) =>
      [
        "AKS",
        "EKS",
        "GKE",
        "App Service",
        "Cloud Run",
        "Elastic Beanstalk",
        "Virtual Machines",
        "EC2",
        "Compute Engine",
      ].some((name) => s.name.includes(name))
    );

    const dataServices = selected.filter((s) =>
      [
        "SQL",
        "PostgreSQL",
        "RDS",
        "Storage",
        "Blob",
        "S3",
        "Cloud Storage",
      ].some((name) => s.name.includes(name))
    );

    const operations = [
      "Monitoring",
      "Logging",
      highAvailability ? "Backup / DR" : "Backups",
    ];

    return {
      users: ["End Users", environment],
      edge,
      network,
      app: appServices.length ? appServices.map((s) => s.name) : ["Application Tier"],
      data: dataServices.length ? dataServices.map((s) => s.name) : ["Data Services"],
      ops: operations,
    };
  }, [provider, selected, internetFacing, highAvailability, environment]);

  const proposalSummary = useMemo(() => {
    const selectedText = selected.length
      ? selected.map((s) => s.name).join(", ")
      : "a baseline architecture";

    return `This ${environment.toLowerCase()} ${provider} design uses ${selectedText}. The solution is organized into user, edge/security, network, application, data, and operations layers. ${
      highAvailability
        ? "High availability is enabled for stronger resilience."
        : "This design uses a lighter availability profile."
    } ${internetFacing ? "Internet-facing access is enabled." : "The solution is designed for internal/private access."}`;
  }, [environment, provider, selected, highAvailability, internetFacing]);

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>TanSmartX v3 PRO</h1>
          <p>Enterprise catalog + architecture preview</p>
        </div>
        <input
          className="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search services..."
        />
      </header>

      <section className="hero">
        <div className="chip">Fast to cloud • curated enterprise catalog</div>
        <h2>Design cloud solutions with confidence.</h2>
        <p>
          Choose a provider, explore services, assemble architecture, and
          estimate cost.
        </p>
      </section>

      {loading && (
        <section className="card" style={{ margin: "16px" }}>
          <div className="label">Loading</div>
          <p>Loading enterprise catalog...</p>
        </section>
      )}

      {error && (
        <section className="card" style={{ margin: "16px" }}>
          <div className="label">Error</div>
          <p>{error}</p>
        </section>
      )}

      <main className="layout">
        <section>
          <div className="card">
            <div className="label">Providers</div>
            <div className="tabs">
              {providers.map((item) => (
                <button
                  key={item}
                  className={`tab ${provider === item ? "active" : ""}`}
                  onClick={() => {
                    setProvider(item);
                    const nextCategory =
                      Object.keys(catalog?.[item]?.categories || {})[0] ||
                      "Compute";
                    setCategory(nextCategory);
                    setSelected([]);
                    setActive(null);
                    setRegion("Auto");
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="label">Categories</div>
            <div className="tabs">
              {categories.map((item) => (
                <button
                  key={item}
                  className={`tab ${category === item ? "active" : ""}`}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="label">Architecture Controls</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "12px",
              }}
            >
              <div className="opt">
                <small>Region</small>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  style={selectStyle}
                >
                  {regions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="opt">
                <small>Environment</small>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  style={selectStyle}
                >
                  <option>Production</option>
                  <option>Staging</option>
                  <option>Development</option>
                </select>
              </div>

              <div className="opt">
                <small>Topology</small>
                <select
                  value={topology}
                  onChange={(e) => setTopology(e.target.value)}
                  style={selectStyle}
                >
                  <option>Standard 3-Tier</option>
                  <option>Microservices Platform</option>
                  <option>Simple Web App</option>
                </select>
              </div>

              <div className="opt">
                <small>Exposure</small>
                <select
                  value={internetFacing ? "Internet-facing" : "Private only"}
                  onChange={(e) => setInternetFacing(e.target.value === "Internet-facing")}
                  style={selectStyle}
                >
                  <option>Internet-facing</option>
                  <option>Private only</option>
                </select>
              </div>
            </div>

            <div className="tabs" style={{ marginTop: "14px" }}>
              <button
                className={`tab ${highAvailability ? "active" : ""}`}
                onClick={() => setHighAvailability((v) => !v)}
              >
                {highAvailability ? "HA Enabled" : "HA Disabled"}
              </button>
            </div>

            <div className="summary-grid">
              <div className="opt">
                <small>Provider</small>
                <strong>{provider}</strong>
              </div>
              <div className="opt">
                <small>Regions</small>
                <strong>{providerSummary.regions || "Global"}</strong>
              </div>
              <div className="opt">
                <small>Focus</small>
                <strong>{providerSummary.focus || "Enterprise workloads"}</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="label">Service Catalog</div>
            <div className="grid">
              {services.map((service) => {
                const picked = selected.some((s) => s.name === service.name);

                return (
                  <div
                    key={service.name}
                    className={`svc ${picked ? "picked" : ""}`}
                  >
                    <div className="svcType">{service.name}</div>
                    <p>{service.description}</p>

                    <div className="tags">
                      {(service.tags || []).map((tag) => (
                        <span className="tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="price">
                      <strong>
                        {service.starting_monthly || service.price || "RM 0/month"}
                      </strong>
                      <small>
                        {service.starting_hourly || service.region || ""}
                      </small>
                    </div>

                    <div className="actions">
                      <button className="ghost" onClick={() => setActive(service)}>
                        Details
                      </button>
                      <button
                        className="primary"
                        onClick={() => toggleService(service)}
                      >
                        {picked ? "Remove" : "Add"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          <div className="card">
            <div className="label">Client Solution Summary</div>
            <div className="proposal-box">
              <div className="proposal-title">
                Proposed {provider} Architecture
              </div>
              <p>{proposalSummary}</p>
            </div>
          </div>

          <div className="card">
            <div className="label">Architecture Recommendations</div>
            <div className="options">
              {recommendations.map((item) => (
                <div className="opt" key={item}>
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
  <div className="label">Architecture Preview</div>

  <div className="diagram-enterprise">
    <Layer title="Users" items={["End Users"]} />

    <Layer
      title="Edge / Security"
      items={[
        provider === "Azure"
          ? "Front Door / App Gateway"
          : provider === "AWS"
          ? "CloudFront / ALB"
          : "Cloud Load Balancer",
      ]}
    />

    <Layer
      title="Network"
      items={[provider === "AWS" ? "VPC" : "VNet"]}
    />

    <Layer
      title="Application Layer"
      items={
        selected.length
          ? selected.map((s) => s.name)
          : ["Application Tier"]
      }
    />

    <Layer
      title="Data Layer"
      items={
        selected.some((s) => s.name.includes("SQL"))
          ? ["Database"]
          : ["Data Services"]
      }
    />

    <Layer
      title="Operations"
      items={["Monitoring", "Logging", "Backup"]}
    />
  </div>
</div>
          <div className="card">
            <div className="label">Service Options</div>
            {!active ? (
              <div className="placeholder">
                Select a service to view enterprise details.
              </div>
            ) : (
              <div className="options">
                <div className="optTitle">
                  {provider} / {active.name}
                </div>

                <div className="opt">
                  <small>Description</small>
                  <strong>{active.description}</strong>
                </div>

                <div className="opt">
                  <small>Starting Monthly</small>
                  <strong>{active.starting_monthly || active.price || "N/A"}</strong>
                </div>

                <div className="opt">
                  <small>Starting Hourly</small>
                  <strong>{active.starting_hourly || "N/A"}</strong>
                </div>

                <div className="opt">
                  <small>Region</small>
                  <strong>{active.region || "Standard region set"}</strong>
                </div>

                <div className="opt">
                  <small>Tags</small>
                  <strong>{(active.tags || []).join(", ") || "N/A"}</strong>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <div className="label">Estimated Cost</div>
            {estimatedCost.items.map((item) => (
              <div className="cost" key={item.name}>
                <span>{item.name}</span>
                <strong>{item.monthly}</strong>
              </div>
            ))}
            <div className="total">
              <div>
                <strong>Monthly:</strong> {estimatedCost.monthly}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Layer({ title, items }) {
  return (
    <div className="layer">
      <div className="layer-title">{title}</div>
      {items.map((node) => (
        <div className="node" key={node}>
          {node}
        </div>
      ))}
    </div>
  );
}

const selectStyle = {
  width: "100%",
  marginTop: "8px",
  padding: "10px 12px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "#e8f1ff",
  outline: "none",
};
function Layer({ title, items }) {
  return (
    <div className="layer">
      <div className="layer-title">{title}</div>
      {items.map((node) => (
        <div className="node" key={node}>
          {node}
        </div>
      ))}
    </div>
  );
}
