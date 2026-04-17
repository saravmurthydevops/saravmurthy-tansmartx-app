import React, { useEffect, useMemo, useState } from "react";

const API = window.location.origin;

export default function App() {
  const [catalog, setCatalog] = useState({});
  const [provider, setProvider] = useState("Azure");
  const [category, setCategory] = useState("Compute");
  const [selected, setSelected] = useState([]);
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState("");
  const [cost, setCost] = useState({ monthly: "RM 0.00", hourly: "", items: [] });

  useEffect(() => {
    fetch(`${API}/api/catalog`)
      .then((r) => r.json())
      .then(setCatalog)
      .catch(console.error);
  }, []);

  const providers = useMemo(() => Object.keys(catalog || {}), [catalog]);

  const categories = useMemo(() => {
    return catalog[provider] ? Object.keys(catalog[provider].categories || {}) : [];
  }, [catalog, provider]);

  const services = useMemo(() => {
    const list = catalog[provider]?.categories?.[category] || [];
    return list.filter((s) =>
      `${s.name} ${s.description} ${(s.tags || []).join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [catalog, provider, category, search]);

  useEffect(() => {
    fetch(`${API}/api/pricing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, services: selected }),
    })
      .then((r) => r.json())
      .then(setCost)
      .catch(console.error);
  }, [provider, selected]);

  function toggleService(service) {
    setActive(service);
    setSelected((prev) =>
      prev.some((s) => s.name === service.name)
        ? prev.filter((s) => s.name !== service.name)
        : [...prev, service]
    );
  }

  const architecture = useMemo(() => {
    return {
      users: ["End Users"],
      edge: [
        provider === "Azure"
          ? "Front Door / App Gateway"
          : provider === "AWS"
          ? "CloudFront / ALB"
          : "Cloud Load Balancer",
      ],
      network: [provider === "AWS" ? "VPC" : "VNet"],
      app: selected.length ? selected.map((s) => s.name) : ["Application Tier"],
      data: selected.some((s) =>
        ["SQL", "PostgreSQL", "RDS"].some((name) => s.name.includes(name))
      )
        ? ["Database"]
        : selected.some((s) =>
            ["Storage", "Blob", "S3", "Cloud Storage"].some((name) =>
              s.name.includes(name)
            )
          )
        ? ["Storage"]
        : ["Data Services"],
      ops: ["Monitoring", "Logging", "Backup"],
    };
  }, [provider, selected]);

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
        <p>Choose a provider, explore services, assemble architecture, and estimate cost.</p>
      </section>

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
                    setCategory(Object.keys(catalog[item]?.categories || {})[0] || "Compute");
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
          </div>

          <div className="card">
            <div className="label">Service Catalog</div>
            <div className="grid">
              {services.map((service) => {
                const picked = selected.some((s) => s.name === service.name);
                return (
                  <div key={service.name} className={`svc ${picked ? "picked" : ""}`}>
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
                      <strong>{service.starting_monthly}</strong>
                      <small>{service.starting_hourly}</small>
                    </div>

                    <div className="actions">
                      <button className="ghost" onClick={() => setActive(service)}>
                        Details
                      </button>
                      <button className="primary" onClick={() => toggleService(service)}>
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
            <div className="diagram-enterprise">
              <Layer title="Users" items={architecture.users} />
              <Layer title="Edge / Security" items={architecture.edge} />
              <Layer title="Network" items={architecture.network} />
              <Layer title="Application Layer" items={architecture.app} />
              <Layer title="Data Layer" items={architecture.data} />
              <Layer title="Operations" items={architecture.ops} />
            </div>
          </div>

          <div className="card">
            <div className="label">Service Options</div>
            {!active ? (
              <div className="placeholder">Select a service to view enterprise details.</div>
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
                  <strong>{active.starting_monthly || "N/A"}</strong>
                </div>

                <div className="opt">
                  <small>Starting Hourly</small>
                  <strong>{active.starting_hourly || "N/A"}</strong>
                </div>

                <div className="opt">
                  <small>Region</small>
                  <strong>{active.region || "N/A"}</strong>
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
            {(cost.items || []).map((item) => (
              <div className="cost" key={item.name}>
                <span>{item.name}</span>
                <strong>{item.monthly}</strong>
              </div>
            ))}
            <div className="total">
              <div>
                <strong>Monthly:</strong> {cost.monthly}
              </div>
              {cost.hourly ? (
                <div>
                  <strong>Hourly:</strong> {cost.hourly}
                </div>
              ) : null}
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
