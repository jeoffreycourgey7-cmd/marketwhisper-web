'use client'
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const categories = ["Tous", "Politique", "Économie", "Crypto", "Tech", "Géopolitique", "Autre"];

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --bg: #080b10; --surface: #0e1318; --surface2: #131920;
    --border: rgba(255,255,255,0.06); --gold: #c9a84c; --gold-light: #e8c97a;
    --green: #3ddc97; --red: #ff5f5f; --text: #e8e8e0; --muted: #6b7280;
    --premium: linear-gradient(135deg, #c9a84c, #e8c97a, #c9a84c);
  }
  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; min-height: 100vh; overflow-x: hidden; }
  .noise { position: fixed; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E"); pointer-events: none; z-index: 0; }
  nav { position: sticky; top: 0; z-index: 100; background: rgba(8,11,16,0.92); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); padding: 0 2rem; display: flex; align-items: center; justify-content: space-between; height: 64px; }
  .logo { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 900; background: var(--premium); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.02em; }
  .logo span { font-weight: 400; font-style: italic; }
  .nav-links { display: flex; gap: 2rem; list-style: none; }
  .nav-links button { background: none; border: none; color: var(--muted); font-family: 'DM Sans', sans-serif; font-size: 0.85rem; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: color 0.2s; padding: 0; }
  .nav-links button:hover, .nav-links button.active { color: var(--text); }
  .nav-right { display: flex; align-items: center; gap: 1rem; }
  .btn-premium { background: var(--premium); color: #080b10; border: none; padding: 0.5rem 1.2rem; font-family: 'DM Mono', monospace; font-size: 0.75rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: opacity 0.2s, transform 0.2s; }
  .btn-premium:hover { opacity: 0.85; transform: translateY(-1px); }
  .btn-outline { background: none; border: 1px solid var(--border); color: var(--muted); padding: 0.5rem 1.2rem; font-family: 'DM Mono', monospace; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
  .btn-outline:hover { border-color: var(--gold); color: var(--gold); }
  .ticker { background: var(--surface); border-bottom: 1px solid var(--border); padding: 0.5rem 0; overflow: hidden; white-space: nowrap; }
  .ticker-inner { display: inline-flex; gap: 3rem; animation: ticker 40s linear infinite; font-family: 'DM Mono', monospace; font-size: 0.75rem; color: var(--muted); }
  .ticker-item { display: flex; gap: 0.5rem; }
  .ticker-item .up { color: var(--green); }
  .ticker-item .down { color: var(--red); }
  @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  main { max-width: 1280px; margin: 0 auto; padding: 0 2rem 4rem; position: relative; z-index: 1; }
  .hero { padding: 4rem 0 3rem; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; border-bottom: 1px solid var(--border); margin-bottom: 3rem; }
  .hero-title { font-family: 'Playfair Display', serif; font-size: 3.5rem; font-weight: 900; line-height: 1.1; letter-spacing: -0.03em; }
  .hero-title .accent { background: var(--premium); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-style: italic; }
  .hero-sub { color: var(--muted); font-size: 1rem; line-height: 1.7; margin-top: 1.2rem; max-width: 400px; }
  .hero-stats { display: flex; gap: 2rem; margin-top: 2rem; }
  .stat { border-left: 2px solid var(--gold); padding-left: 1rem; }
  .stat-val { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 700; color: var(--gold-light); }
  .stat-label { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0.2rem; }
  .section-header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 1.5rem; }
  .section-title { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 700; letter-spacing: -0.02em; }
  .section-count { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: var(--muted); letter-spacing: 0.1em; }
  .filters { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
  .filter-btn { background: none; border: 1px solid var(--border); color: var(--muted); padding: 0.35rem 0.9rem; font-family: 'DM Mono', monospace; font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
  .filter-btn:hover { border-color: var(--gold); color: var(--gold); }
  .filter-btn.active { border-color: var(--gold); color: var(--gold); background: rgba(201,168,76,0.08); }
  .markets-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 3rem; }
  .market-card { background: var(--surface); border: 1px solid var(--border); padding: 1.2rem; cursor: pointer; transition: all 0.25s; position: relative; overflow: hidden; }
  .market-card:hover { border-color: rgba(201,168,76,0.3); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
  .market-card.hot::after { content: 'HOT'; position: absolute; top: 0.8rem; right: 0.8rem; font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.1em; color: var(--gold); background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.3); padding: 0.15rem 0.4rem; }
  .market-cat { font-family: 'DM Mono', monospace; font-size: 0.65rem; color: var(--muted); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 0.6rem; }
  .market-title { font-size: 0.9rem; line-height: 1.4; margin-bottom: 1rem; color: var(--text); }
  .odds-bar { height: 3px; background: var(--surface2); margin-bottom: 0.7rem; overflow: hidden; }
  .odds-fill { height: 100%; background: var(--gold); transition: width 0.5s ease; }
  .odds-labels { display: flex; justify-content: space-between; font-family: 'DM Mono', monospace; font-size: 0.75rem; }
  .yes { color: var(--green); } .no { color: var(--red); }
  .market-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 0.8rem; padding-top: 0.8rem; border-top: 1px solid var(--border); }
  .volume { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: var(--muted); }
  .change { font-family: 'DM Mono', monospace; font-size: 0.7rem; }
  .change.up { color: var(--green); } .change.down { color: var(--red); }
  .tips-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  .tip-card { background: var(--surface); border: 1px solid var(--border); padding: 1.2rem; position: relative; overflow: hidden; transition: all 0.25s; }
  .tip-card:hover { border-color: rgba(201,168,76,0.3); transform: translateY(-2px); }
  .tip-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--premium); }
  .verdict { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; font-style: italic; }
  .verdict.oui { color: var(--green); } .verdict.non { color: var(--red); }
  .breaking-grid { display: flex; flex-direction: column; gap: 0; border: 1px solid rgba(201,168,76,0.2); overflow: hidden; }
  .breaking-card { background: var(--surface); border-bottom: 1px solid var(--border); transition: background 0.2s; }
  .breaking-card:hover { background: var(--surface2); }
  .breaking-lock { background: rgba(8,11,16,0.95); border-bottom: 1px solid var(--border); padding: 2rem; text-align: center; border-top: 2px solid rgba(201,168,76,0.3); }
  .premium-badge { display: inline-flex; align-items: center; gap: 0.4rem; background: var(--premium); color: #080b10; padding: 0.4rem 1rem; font-family: 'DM Mono', monospace; font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 500; cursor: pointer; border: none; }
  .pulse { width: 6px; height: 6px; background: var(--gold); border-radius: 50%; animation: pulse 1.5s ease-in-out infinite; display: inline-block; }
  @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 2rem; }
  .modal { background: var(--surface); border: 1px solid rgba(201,168,76,0.3); padding: 2.5rem; max-width: 480px; width: 100%; position: relative; animation: modalIn 0.3s ease; }
  @keyframes modalIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .modal::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--premium); }
  .plan { border: 1px solid var(--border); padding: 1.2rem; margin-bottom: 0.8rem; cursor: pointer; transition: all 0.2s; display: flex; justify-content: space-between; align-items: center; }
  .plan:hover, .plan.selected { border-color: var(--gold); background: rgba(201,168,76,0.05); }
  footer { border-top: 1px solid var(--border); padding: 2rem; text-align: center; font-family: 'DM Mono', monospace; font-size: 0.7rem; color: var(--muted); letter-spacing: 0.05em; }
  .loading { display: flex; align-items: center; justify-content: center; height: 200px; font-family: 'DM Mono', monospace; font-size: 0.8rem; color: var(--muted); letter-spacing: 0.1em; }
`;

export default function MarketWhisper() {
  const [page, setPage] = useState("home");
  const [filter, setFilter] = useState("Tous");
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [markets, setMarkets] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [breakingNews, setBreakingNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const [{ data: m }, { data: p }, { data: b }] = await Promise.all([
        supabase.from("markets").select("*").order("volume", { ascending: false }).limit(50),
        supabase.from("predictions").select("*, markets(title)").order("created_at", { ascending: false }).limit(10),
        supabase.from("breaking_news").select("*, markets(title, yes_probability, no_probability)").order("published_at", { ascending: false }).limit(5),
      ]);

      if (m) setMarkets(m);
      if (p) setPredictions(p);
      if (b) setBreakingNews(b);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filtered = filter === "Tous" ? markets : markets.filter(m => m.category === filter);

  const formatVolume = (v) => {
    if (!v) return "0";
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
    return v.toString();
  };

  return (
    <>
      <style>{style}</style>
      <div className="noise" />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", color: "var(--muted)", fontSize: "1.2rem", cursor: "pointer" }} onClick={() => setShowModal(false)}>✕</button>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "var(--gold)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.3rem" }}>Accès Premium</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 900, marginBottom: "0.5rem" }}>
              Market<span style={{ fontStyle: "italic", background: "var(--premium)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Whisper</span>
            </div>
            <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "2rem", lineHeight: 1.6 }}>Accédez aux alertes en temps réel avant que le marché ne réagisse.</div>
            <div style={{ marginBottom: "1.5rem" }}>
              {["🔔 Alertes breaking news en temps réel", "⚡ Notifications Telegram instantanées", "🎯 Pronostics exclusifs MW Alpha & Delta", "📊 Analyses de marché approfondies", "📧 Digest email quotidien"].map(p => (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: "0.7rem", fontSize: "0.82rem", color: "var(--muted)", padding: "0.4rem 0" }}>
                  <span style={{ color: "var(--gold)", fontSize: "0.75rem" }}>✦</span>{p}
                </div>
              ))}
            </div>
            {[{ id: "monthly", name: "Mensuel", desc: "Sans engagement", price: "19", period: "/mois" }, { id: "yearly", name: "Annuel", desc: "Économisez 40%", price: "9", period: "/mois" }].map(plan => (
              <div key={plan.id} className={`plan ${selectedPlan === plan.id ? "selected" : ""}`} onClick={() => setSelectedPlan(plan.id)}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: "0.95rem" }}>{plan.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.2rem" }}>{plan.desc}</div>
                </div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--gold-light)" }}>{plan.price}€ <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "var(--muted)" }}>{plan.period}</span></div>
              </div>
            ))}
            <button className="btn-premium" style={{ width: "100%", padding: "0.9rem", fontSize: "0.8rem", marginTop: "0.5rem" }}>Commencer — Essai 7 jours gratuit</button>
            <div style={{ textAlign: "center", marginTop: "0.8rem", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "var(--muted)" }}>Annulation à tout moment · Paiement sécurisé Stripe</div>
          </div>
        </div>
      )}

      <nav>
        <div className="logo">Market<span>Whisper</span></div>
        <ul className="nav-links">
          {[["home", "Marchés"], ["tips", "Pronostics"], ["breaking", "Breaking News"], ["stats", "Stats"]].map(([id, label]) => (
            <li key={id}><button className={page === id ? "active" : ""} onClick={() => setPage(id)}>{label}</button></li>
          ))}
        </ul>
        <div className="nav-right">
          <button className="btn-outline">Connexion</button>
          <button className="btn-premium" onClick={() => setShowModal(true)}>✦ Premium</button>
        </div>
      </nav>

      {markets.length > 0 && (
        <div className="ticker">
          <div className="ticker-inner">
            {[...markets.slice(0, 10), ...markets.slice(0, 10)].map((m, i) => (
              <div key={i} className="ticker-item">
                <span>{m.title?.slice(0, 40)}…</span>
                <span className={m.change_24h >= 0 ? "up" : "down"}>{m.yes_probability}% OUI {m.change_24h >= 0 ? "+" : ""}{m.change_24h?.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <main>
        {page === "home" && (
          <>
            <div className="hero">
              <div>
                <div className="hero-title">L'intelligence<br />des marchés<br /><span className="accent">avant tout le monde.</span></div>
                <div className="hero-sub">Analyses en temps réel, pronostics d'experts et alertes breaking news sur les marchés Polymarket.</div>
                <div className="hero-stats">
                  <div className="stat"><div className="stat-val">{markets.length}</div><div className="stat-label">Marchés suivis</div></div>
                  <div className="stat"><div className="stat-val">{predictions.length}</div><div className="stat-label">Pronostics actifs</div></div>
                  <div className="stat"><div className="stat-val">{breakingNews.length}</div><div className="stat-label">Alertes générées</div></div>
                </div>
              </div>
              <div style={{ background: "var(--surface)", border: "1px solid rgba(201,168,76,0.2)", padding: "1.5rem", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "var(--premium)" }} />
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "var(--gold)", letterSpacing: "0.15em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <span className="pulse" />Live — Alertes Premium
                </div>
                {breakingNews.slice(0, 1).map(n => (
                  <div key={n.id} style={{ padding: "0.8rem 0", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "0.85rem", marginBottom: "0.4rem" }}>{n.headline}</div>
                    <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "var(--muted)" }}>📊 {n.markets?.title?.slice(0, 38)}…</div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: n.impact_direction === "hausse" ? "var(--green)" : "var(--red)" }}>{n.impact_direction === "hausse" ? "▲" : "▼"} {n.odds_shift}</div>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "0.8rem 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "0.85rem", filter: "blur(4px)", color: "var(--muted)" }}>⚡ Source confidentielle — Décision majeure attendue dans les prochaines heures</div>
                </div>
                <div style={{ textAlign: "center", marginTop: "0.8rem", padding: "0.5rem", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)" }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "var(--gold)" }}>🔒 Accès Premium</div>
                  <button className="btn-premium" style={{ marginTop: "0.6rem", fontSize: "0.65rem", padding: "0.35rem 0.8rem" }} onClick={() => setShowModal(true)}>Débloquer</button>
                </div>
              </div>
            </div>

            <div className="section-header">
              <div className="section-title">Marchés en vedette</div>
              <div className="section-count">{markets.length} marchés actifs</div>
            </div>
            <div className="filters">
              {categories.map(c => (
                <button key={c} className={`filter-btn ${filter === c ? "active" : ""}`} onClick={() => setFilter(c)}>{c}</button>
              ))}
            </div>

            {loading ? <div className="loading">CHARGEMENT DES MARCHÉS...</div> : (
              <div className="markets-grid">
                {filtered.map(m => {
                  const pred = predictions.find(p => p.market_id === m.id);
                  return (
                    <div key={m.id} className={`market-card ${m.is_hot ? "hot" : ""}`}>
                      <div className="market-cat">{m.category}</div>
                      <div className="market-title">{m.title}</div>
                      <div className="odds-bar"><div className="odds-fill" style={{ width: `${m.yes_probability}%` }} /></div>
                      <div className="odds-labels">
                        <span className="yes">OUI {m.yes_probability}%</span>
                        <span className="no">NON {m.no_probability}%</span>
                      </div>
                      {pred && (
                        <div style={{ marginTop: "0.8rem", background: "var(--surface2)", padding: "0.6rem 0.8rem", borderLeft: `2px solid ${pred.verdict === "OUI" ? "var(--green)" : "var(--red)"}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Score MW</span>
                            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.85rem", fontStyle: "italic", color: pred.verdict === "OUI" ? "var(--green)" : "var(--red)", fontWeight: 700 }}>{pred.verdict} — {pred.confidence}%</span>
                          </div>
                          <div style={{ height: "2px", background: "var(--border)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pred.confidence}%`, background: pred.verdict === "OUI" ? "var(--green)" : "var(--red)" }} />
                          </div>
                        </div>
                      )}
                      <div className="market-footer">
                        <span className="volume">Vol. ${formatVolume(m.volume)}</span>
                        <span className={`change ${m.change_24h >= 0 ? "up" : "down"}`}>{m.change_24h >= 0 ? "+" : ""}{m.change_24h?.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {page === "tips" && (
          <div style={{ paddingTop: "2rem" }}>
            <div className="section-header">
              <div className="section-title">Pronostics <span style={{ fontStyle: "italic", background: "var(--premium)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MW Alpha</span></div>
              <div className="section-count">{predictions.length} pronostics actifs</div>
            </div>
            {loading ? <div className="loading">CHARGEMENT...</div> : (
              <div className="tips-grid">
                {predictions.map(t => (
                  <div key={t.id} className="tip-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.8rem" }}>
                      <div style={{ fontSize: "0.85rem", flex: 1, paddingRight: "0.5rem" }}>{t.markets?.title?.slice(0, 60) || t.market_id}</div>
                      <div className={`verdict ${t.verdict?.toLowerCase()}`}>{t.verdict}</div>
                    </div>
                    <div style={{ height: "2px", background: "var(--surface2)", marginBottom: "0.5rem", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${t.confidence}%`, background: "var(--gold)" }} />
                    </div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "var(--muted)", letterSpacing: "0.1em", marginBottom: "0.8rem" }}>Confiance — {t.confidence}%</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.5, marginBottom: "0.8rem" }}>{t.rationale}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "var(--muted)", borderTop: "1px solid var(--border)", paddingTop: "0.7rem" }}>
                      <span>{t.analyst}</span>
                      <span>{new Date(t.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {page === "breaking" && (
          <div style={{ paddingTop: "2rem" }}>
            <div className="section-header">
              <div className="section-title">Breaking <span style={{ fontStyle: "italic", background: "var(--premium)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>News</span></div>
              <div className="section-count" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="pulse" style={{ background: "var(--green)" }} />Live
              </div>
            </div>
            <div className="breaking-grid">
              {loading ? <div className="loading">CHARGEMENT...</div> : breakingNews.map(n => (
                <div key={n.id} className="breaking-card" style={{ display: "flex", flexDirection: "column", padding: 0 }}>
                  <div style={{ padding: "1rem 1.5rem 0.8rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.4rem" }}>📡 {n.source}</div>
                      <div style={{ fontSize: "0.9rem", lineHeight: 1.4 }}>{n.headline}</div>
                    </div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.62rem", color: "var(--muted)", whiteSpace: "nowrap" }}>{new Date(n.published_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 0 }}>
                    <div style={{ padding: "0.9rem 1.5rem", borderRight: "1px solid var(--border)" }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.35rem" }}>📊 Pari concerné</div>
                      <div style={{ fontSize: "0.82rem", lineHeight: 1.4 }}>{n.markets?.title || "—"}</div>
                    </div>
                    <div style={{ padding: "0.9rem 1.5rem", borderRight: "1px solid var(--border)", textAlign: "center", minWidth: "140px" }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Cote actuelle</div>
                      <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center", alignItems: "center" }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700, color: "var(--green)" }}>{n.markets?.yes_probability}%</div>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", color: "var(--muted)" }}>OUI</div>
                        </div>
                        <div style={{ color: "var(--border)" }}>/</div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700, color: "var(--red)" }}>{n.markets?.no_probability}%</div>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", color: "var(--muted)" }}>NON</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: "0.9rem 1.5rem", textAlign: "center", minWidth: "220px", background: n.impact_direction === "hausse" ? "rgba(61,220,151,0.05)" : "rgba(255,95,95,0.05)" }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.6rem" }}>✦ Notre prédiction</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.7rem" }}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 900, fontStyle: "italic", color: n.impact_direction === "hausse" ? "var(--green)" : "var(--red)" }}>{n.prediction}</div>
                        <div style={{ width: "1px", height: "2rem", background: "var(--border)" }} />
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", color: "var(--muted)", marginBottom: "0.15rem" }}>mouvement attendu</div>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "1rem", fontWeight: 700, color: n.impact_direction === "hausse" ? "var(--green)" : "var(--red)" }}>{n.impact_direction === "hausse" ? "▲" : "▼"} {n.odds_shift}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="breaking-lock">
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🔒</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", marginBottom: "0.3rem", color: "var(--gold-light)" }}>Alertes Premium en temps réel</div>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "1rem" }}>IA connectée à +500 sources mondiales — soyez alertés avant tout le monde.</div>
                <button className="premium-badge" onClick={() => setShowModal(true)}>✦ Débloquer l'accès Premium</button>
              </div>
            </div>
          </div>
        )}

        {page === "stats" && (
          <div style={{ paddingTop: "2rem" }}>
            <div className="section-header">
              <div className="section-title">Performance <span style={{ fontStyle: "italic", background: "var(--premium)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>& Stats</span></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
              {[
                { val: markets.length, label: "Marchés suivis", sub: "Mis à jour en continu" },
                { val: predictions.length, label: "Pronostics générés", sub: "Par l'IA MW Alpha" },
                { val: breakingNews.length, label: "Alertes premium", sub: "Dernières 24h" },
                { val: "78%", label: "Taux de succès", sub: "+3% ce mois" },
              ].map(s => (
                <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1.5rem", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 700, background: "var(--premium)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.val}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text)", marginTop: "0.3rem" }}>{s.label}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "var(--muted)", marginTop: "0.2rem" }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer>© 2026 MarketWhisper · Contenu informatif uniquement · Pas de conseil financier</footer>
    </>
  );
}