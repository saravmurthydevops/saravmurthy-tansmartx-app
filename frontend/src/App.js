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

        const providers = Object.keys(json || {});
        const firstProvider = providers[0] || "Azure";
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

  const categories = useMemo(() => {
    return Object.keys(catalog?.[provider]?.categories || {});
  }, [catalog, provider]);

  const services = useMemo(() => {
    const list = catalog?.[provider]?.categories?.[category] || [];
    return list.filter((s) =>
      `${s.name} ${s.description} ${(s.tags || []).join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [catalog, provider, category, search]);

  const estimatedCost = useMemo(() => {
    const items = selected.map((item) => {
      const monthly =
        item.starting_monthly || item.price || "RM 0/month";
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

    return {
      monthly: `RM ${total.toFixed(2)}/month`,
      items,
    };
  }, [selected]);

  function toggleService(service) {
    setActive(service);
    setSelected((prev) =>
      prev.some((s) => s.name === service.name)
        ? prev.filter((s) => s.name !== service.name)
        : [...prev, service]
    );
  }

 const architectureNodes = useMemo(() => {
  const nodes = ["Users", "Internet"];

  // Edge Layer
  if (provider === "Azure") {
    nodes.push("Front Door / App Gateway");
  } else if (provider === "AWS") {
    nodes.push("CloudFront / ALB");
  } else {
    nodes.push("Cloud Load Balancer");
  }

  // Network Layer
  nodes.push(provider === "AWS" ? "VPC" : "VNet");

  // Detect workloads
  const hasK8s = selected.some(
    (s) =>
      s.name.includes("AKS") ||
      s.name.includes("EKS") ||
      s.name.includes("GKE") ||
      s.name.includes("Kubernetes")
  );

  const hasWeb = selected.some(
    (s) =>
      s.name.includes("App Service") ||
      s.name.includes("Cloud Run") ||
      s.name.includes("Elastic Beanstalk") ||
      s.name.includes("App")
  );

  const hasDB = selected.some(
    (s) =>
      s.name.includes("SQL") ||
      s.name.includes("PostgreSQL") ||
      s.name.includes("RDS") ||
      (s.tags || []).some((tag) =>
        ["sql", "managed-db", "postgres", "mysql", "ha"].includes(tag)
      )
  );

  const hasStorage = selected.some(
    (s) =>
      s.name.includes("Storage") ||
      s.name.includes("S3") ||
      s.name.includes("Blob") ||
      (s.tags || []).some((tag) =>
        ["object-storage", "backup", "archive"].includes(tag)
      )
  );

  // App Layer
  if (hasK8s) nodes.push("Kubernetes Cluster");
  if (hasWeb) nodes.push("Application Layer");

  // Data Layer
  if (hasDB) nodes.push("Database");
  if (hasStorage) nodes.push("Storage");

  // Default fallback
  if (!hasK8s && !hasWeb && !hasDB && !hasStorage) {
    nodes.push("Application Tier", "Database");
  }

  return nodes;
}, [provider, selected]);

  const providerSummary = catalog?.[provider]?.summary || {};

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

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "12px",
                marginTop: "20px",
              }}
            >
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
            <div className="label">Architecture Preview</div>
            <div className="diagram" style={{ flexWrap: "wrap", rowGap: "14px" }}>
              {architectureNodes.map((node, i) => (
                <React.Fragment key={`${node}-${i}`}>
                  <div className="node">{node}</div>
                  {i < architectureNodes.length - 1 && (
                    <div className="arrow">→</div>
                  )}
                </React.Fragment>
              ))}
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
