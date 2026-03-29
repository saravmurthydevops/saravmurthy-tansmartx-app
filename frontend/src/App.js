import React, { useEffect, useMemo, useState } from 'react';
const API = 'http://localhost:4010';

export default function App() {
  const [catalog, setCatalog] = useState({});
  const [provider, setProvider] = useState('Azure');
  const [category, setCategory] = useState('Compute');
  const [selected, setSelected] = useState([]);
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState('');
  const [cost, setCost] = useState({ monthly: '$0+', hourly: '$0.00+', items: [] });

  useEffect(() => {
    fetch(`${API}/api/catalog`).then(r => r.json()).then(setCatalog).catch(console.error);
  }, []);

  const providers = useMemo(() => Object.keys(catalog || {}), [catalog]);
  const categories = useMemo(() => catalog[provider] ? Object.keys(catalog[provider].categories || {}) : [], [catalog, provider]);
  const services = useMemo(() => {
    const list = catalog[provider]?.categories?.[category] || [];
    return list.filter(s => (`${s.name} ${s.description} ${(s.tags||[]).join(' ')}`).toLowerCase().includes(search.toLowerCase()));
  }, [catalog, provider, category, search]);

  useEffect(() => {
    fetch(`${API}/api/pricing`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ provider, services: selected })
    }).then(r => r.json()).then(setCost).catch(console.error);
  }, [provider, selected]);

  function toggleService(service) {
    setActive(service);
    setSelected(prev => prev.some(s => s.name === service.name) ? prev.filter(s => s.name !== service.name) : [...prev, service]);
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>TanSmartX v3 PRO</h1>
          <p>Enterprise catalog + architecture preview</p>
        </div>
        <input className="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services..." />
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
            <div className="tabs">{providers.map(item => <button key={item} className={`tab ${provider===item?'active':''}`} onClick={() => {setProvider(item); setCategory(Object.keys(catalog[item].categories)[0]);}}>{item}</button>)}</div>
            <div className="label">Categories</div>
            <div className="tabs">{categories.map(item => <button key={item} className={`tab ${category===item?'active':''}`} onClick={() => setCategory(item)}>{item}</button>)}</div>
          </div>

          <div className="card">
            <div className="label">Service Catalog</div>
            <div className="grid">
              {services.map(service => {
                const picked = selected.some(s => s.name === service.name);
                return (
                  <div key={service.name} className={`svc ${picked ? 'picked' : ''}`}>
                    <div className="svcType">{service.name}</div>
                    <p>{service.description}</p>
                    <div className="tags">{(service.tags || []).map(tag => <span className="tag" key={tag}>{tag}</span>)}</div>
                    <div className="price"><strong>{service.starting_monthly}</strong><small>{service.starting_hourly}</small></div>
                    <div className="actions">
                      <button className="ghost" onClick={() => setActive(service)}>Details</button>
                      <button className="primary" onClick={() => toggleService(service)}>{picked ? 'Remove' : 'Add'}</button>
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
              {['Users','Internet', ...selected.map(s => s.name)].map((node, i, arr) => (
                <React.Fragment key={node+i}>
                  <div className="node">{node}</div>
                  {i < arr.length - 1 && <div className="arrow">→</div>}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="label">Service Options</div>
            {!active ? <div className="placeholder">Select a service to view suggested options.</div> :
              <div className="options">
                <div className="optTitle">{provider} / {active.name}</div>
                {Object.entries(active.options || {}).map(([k, v]) => (
                  <div className="opt" key={k}><small>{k}</small><strong>{Array.isArray(v) ? v.join(', ') : String(v)}</strong></div>
                ))}
              </div>
            }
          </div>

          <div className="card">
            <div className="label">Estimated Cost</div>
            {(cost.items || []).map(item => <div className="cost" key={item.name}><span>{item.name}</span><strong>{item.monthly}</strong></div>)}
            <div className="total"><div><strong>Monthly:</strong> {cost.monthly}</div><div><strong>Hourly:</strong> {cost.hourly}</div></div>
          </div>
        </section>
      </main>
    </div>
  );
}
