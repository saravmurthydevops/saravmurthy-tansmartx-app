import React, { useEffect, useMemo, useState } from "react";

const API = window.location.origin;

export default function App() {
  const [data, setData] = useState(null);
  const [provider, setProvider] = useState("Azure");
  const [category, setCategory] = useState("Compute");
  const [selected, setSelected] = useState([]);
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/api`)
      .then((r) => {
        if (!r.ok) {
          throw new Error("Failed to load API data");
        }
        return r.json();
      })
      .then((json) => {
        setData(json);
        if (json.provider) setProvider(json.provider);
        if (json.categories?.length) setCategory(json.categories[0]);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load TanSmartX data from backend.");
      });
  }, []);

  const categories = useMemo(() => data?.categories || [], [data]);

  const services = useMemo(() => {
    const list = data?.services || [];
    return list.filter((s) =>
      `${s.name} ${s.description} ${(s.tags || []).join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [data, search]);

  const estimatedCost = useMemo(() => {
    const total = selected.reduce((sum, item) => {
      const value = Number(String(item.price || "").replace(/[^\d.]/g, ""));
      return sum + (isNaN(value) ? 0 : value);
    }, 0);

    return {
      monthly: `RM ${total}/month`,
      items: selected.map((item) => ({
        name: item.name,
        monthly: item.price || "RM 0/month",
      })),
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

  const architectureNodes = selected.length
    ? ["Users", "Internet", ...selected.map((s) => s.name)]
    : data?.architecture || ["Users", "Internet"];

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
              <button className="tab active">{provider}</button>
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
                      <strong>{service.price}</strong>
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
            <div className="diagram">
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
                Select a service to view details.
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
                  <small>Price</small>
                  <strong>{active.price}</strong>
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
