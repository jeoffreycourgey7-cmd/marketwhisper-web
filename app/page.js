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
  .stat { border-left: 2px solid var(--gold); padding-left: 1rem; }
  .stat-val { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 700; color: var(--gold-light); }
  .stat-label { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0.2rem; }
  .pulse { width: 6px; height: 6px; background: var(--gold); border-radius: 50%; animation: pulse 1.5s ease-in-out infinite; display: inline-block; }
  @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 2rem; }
  .modal { background: var(--surface); border: 1px solid rgba(201,168,76,0.3); padding: 2.5rem; max-width: 480px; width: 100%; position: relative; animation: modalIn 0.3s ease; }
  @keyframes modalIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .modal::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--premium); }
  .plan { border: 1px solid var(--border); padding: 1.2rem; margin-bottom: 0.8rem; cursor: pointer; transition: all 0.2s; display: flex; justify-content: space-between; align-items: center; }
  .plan:hover, .plan.selected { border-color: var(--gold); background: rgba(201,168,76,0.05); }
  .loading { display: flex; align-items: center; justify-content: center; height: 200px; font-family: 'DM Mono', monospace; font-size: 0.8rem; color: var(--muted); letter-spacing: 0.1em; }
  footer { border-top: 1px solid var(--border); padding: 2rem; text-align: center; font-family: 'DM Mono', monospace; font-size: 0.7rem; color: var(--muted); letter-spacing: 0.05em; }
`;

export default function MarketWhisper() {
  const [page, setPage] = useState("home");
  const [filter, setFilter] = useState("Tous");
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [markets, setMarkets] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [{ data: m }, { data: p }] = await Promise.all([
        supabase.from("markets").select("*").order("volume", { ascending: false }).gt("yes_probability", 5)
.lt("yes_probability", 95)
.limit(500),
        supabase.from("predictions").select("*, markets(title)").order("created_at", { ascending: false }).limit(20),
      ]);
      if (m) setMarkets(m);
      if (p) setPredictions(p);
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

  const handleCheckout = async (plan) => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Erreur checkout:', err);
    }
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
            <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "2rem", lineHeight: 1.6 }}>Accédez aux analyses IA avant que le marché ne réagisse.</div>
            <div style={{ marginBottom: "1.5rem" }}>
              {["🎯 Analyses IA — cotes sous-évaluées", "⚡ Opportunités détectées en temps réel", "📊 Score de confiance par analyse", "🔒 Accès prioritaire aux nouveaux marchés"].map(p => (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: "0.7rem", fontSize: "0.82rem", color: "var(--muted)", padding: "0.4rem 0" }}>
                  <span style={{ color: "var(--gold)", fontSize: "0.75rem" }}>✦</span>{p}
                </div>
              ))}
            </div>
            {[
              { id: "monthly", name: "Mensuel", desc: "Sans engagement", price: "19", period: "/mois" },
              { id: "yearly", name: "Annuel", desc: "Économisez 40%", price: "9", period: "/mois" }
            ].map(plan => (
              <div key={plan.id} className={`plan ${selectedPlan === plan.id ? "selected" : ""}`} onClick={() => setSelectedPlan(plan.id)}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: "0.95rem" }}>{plan.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.2rem" }}>{plan.desc}</div>
                </div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--gold-light)" }}>{plan.price}€ <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "var(--muted)" }}>{plan.period}</span></div>
              </div>
            ))}
            <button className="btn-premium" style={{ width: "100%", padding: "0.9rem", fontSize: "0.8rem", marginTop: "0.5rem" }} onClick={() => handleCheckout(selectedPlan)}>Commencer — Essai 7 jours gratuit</button>
            <div style={{ textAlign: "center", marginTop: "0.8rem", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "var(--muted)" }}>Annulation à tout moment · Paiement sécurisé Stripe</div>
          </div>
        </div>
      )}

      <nav>
        <div className="logo">Market<span>Whisper</span></div>
        <ul className="nav-links">
          {[["home", "Marchés"], ["tips", "Analyses Premium"], ["stats", "Stats"]].map(([id, label]) => (
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
            {/* HERO */}
            <div style={{ padding: "4rem 0 3rem", textAlign: "center", borderBottom: "1px solid var(--border)", marginBottom: "3rem" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "var(--gold)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1rem" }}>✦ MarketWhisper</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "3rem", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: "1rem" }}>
                L'intelligence des marchés<br />
                <span style={{ fontStyle: "italic", background: "var(--premium)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>avant tout le monde.</span>
              </div>
              <div style={{ color: "var(--muted)", fontSize: "1rem", marginBottom: "3rem" }}>Analyses en temps réel sur les marchés de prédiction Polymarket.</div>

              {/* 3 CARTES */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "3rem" }}>

                {/* GRATUIT */}
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "2rem", textAlign: "left" }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "var(--muted)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.8rem" }}>Accès Gratuit</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 900, marginBottom: "0.3rem" }}>0€</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "var(--muted)", marginBottom: "1.5rem" }}>Pour toujours</div>
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.2rem", marginBottom: "1.5rem" }}>
                    {["📊 Tous les marchés Polymarket", "📈 Cotes OUI / NON en temps réel", "📉 Mouvement de la journée"].map(f => (
                      <div key={f} style={{ fontSize: "0.82rem", color: "var(--muted)", padding: "0.4rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ color: "var(--green)", fontSize: "0.7rem" }}>✓</span>{f}
                      </div>
                    ))}
                  </div>
                  <button className="btn-outline" style={{ width: "100%", padding: "0.8rem", fontSize: "0.75rem" }}>Accéder gratuitement</button>
                </div>

                {/* PREMIUM */}
                <div style={{ background: "var(--surface)", border: "1px solid rgba(201,168,76,0.4)", padding: "2rem", textAlign: "left", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "var(--premium)" }} />
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "var(--gold)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.8rem" }}>✦ Premium</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 900, marginBottom: "0.3rem", background: "var(--premium)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>19€</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "var(--muted)", marginBottom: "1.5rem" }}>Par mois · Sans engagement</div>
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.2rem", marginBottom: "1.5rem" }}>
                    {["✦ Tout l'accès gratuit inclus", "🎯 Analyses IA — cotes sous-évaluées", "⚡ Opportunités détectées en temps réel", "📊 Score de confiance par analyse", "🔒 Accès prioritaire aux nouveaux marchés"].map(f => (
                      <div key={f} style={{ fontSize: "0.82rem", color: "var(--text)", padding: "0.4rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ color: "var(--gold)", fontSize: "0.7rem" }}>✦</span>{f}
                      </div>
                    ))}
                  </div>
                  <button className="btn-premium" style={{ width: "100%", padding: "0.8rem", fontSize: "0.75rem" }} onClick={() => setShowModal(true)}>Commencer — 7 jours gratuits</button>
                </div>

                {/* BOT */}
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "2rem", textAlign: "left", position: "relative", opacity: 0.7 }}>
                  <div style={{ position: "absolute", top: "1rem", right: "1rem", fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "var(--muted)", background: "var(--surface2)", border: "1px solid var(--border)", padding: "0.2rem 0.5rem", letterSpacing: "0.1em" }}>BIENTÔT</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "var(--muted)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.8rem" }}>Bot Trading</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 900, marginBottom: "0.3rem" }}>???</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "var(--muted)", marginBottom: "1.5rem" }}>Lancement prochain</div>
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.2rem", marginBottom: "1.5rem" }}>
                    {["🤖 Trading automatique sur Polymarket", "📡 Signaux envoyés en temps réel", "🔐 Clé API reste sur votre ordi", "⚡ Exécution instantanée des ordres", "📊 Tableau de bord de performance"].map(f => (
                      <div key={f} style={{ fontSize: "0.82rem", color: "var(--muted)", padding: "0.4rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ color: "var(--muted)", fontSize: "0.7rem" }}>○</span>{f}
                      </div>
                    ))}
                  </div>
                  <button className="btn-outline" style={{ width: "100%", padding: "0.8rem", fontSize: "0.75rem", opacity: 0.5, cursor: "not-allowed" }}>Bientôt disponible</button>
                </div>

              </div>

              {/* STATS */}
              <div style={{ display: "flex", justifyContent: "center", gap: "3rem" }}>
                <div className="stat"><div className="stat-val">{markets.length}</div><div className="stat-label">Marchés suivis</div></div>
                <div className="stat"><div className="stat-val">{predictions.length}</div><div className="stat-label">Opportunités détectées</div></div>
                <div className="stat"><div className="stat-val">78%</div><div className="stat-label">Taux de succès</div></div>
              </div>
            </div>

            {/* MARCHÉS */}
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
                {filtered.map(m => (
                  <div key={m.id} className={`market-card ${m.is_hot ? "hot" : ""}`}>
                    <div className="market-cat">{m.category}</div>
                    <div className="market-title">{m.title}</div>
                    <div className="odds-bar"><div className="odds-fill" style={{ width: `${m.yes_probability}%` }} /></div>
                    <div className="odds-labels">
                      <span className="yes">OUI {m.yes_probability}%</span>
                      <span className="no">NON {m.no_probability}%</span>
                    </div>
                    <div className="market-footer">
                      <span className="volume">Vol. ${formatVolume(m.volume)}</span>
                      <span className={`change ${m.change_24h >= 0 ? "up" : "down"}`}>{m.change_24h >= 0 ? "+" : ""}{m.change_24h?.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {page === "tips" && (
          <div style={{ paddingTop: "2rem" }}>
            <div className="section-header">
              <div className="section-title">Analyses <span style={{ fontStyle: "italic", background: "var(--premium)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Premium</span></div>
              <div className="section-count">{predictions.length} opportunités actives</div>
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
                {/* Carte premium lockée */}
                <div className="tip-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: "200px", cursor: "pointer" }} onClick={() => setShowModal(true)}>
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🔒</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.95rem", marginBottom: "0.3rem", color: "var(--gold-light)" }}>Accès Premium requis</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "var(--muted)", marginBottom: "1rem" }}>+{Math.max(0, 20 - predictions.length)} analyses supplémentaires</div>
                  <button className="btn-premium" style={{ fontSize: "0.7rem", padding: "0.4rem 1rem" }}>S'abonner</button>
                </div>
              </div>
            )}
          </div>
        )}

        {page === "stats" && (
          <div style={{ paddingTop: "2rem" }}>
            <div className="section-header">
              <div className="section-title">Performance <span style={{ fontStyle: "italic", background: "var(--premium)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>& Stats</span></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
              {[
                { val: markets.length, label: "Marchés suivis", sub: "Mis à jour en continu" },
                { val: predictions.length, label: "Opportunités détectées", sub: "Par l'IA MW Alpha" },
                { val: "78%", label: "Taux de succès", sub: "+3% ce mois" },
                { val: "2026", label: "Année de lancement", sub: "MarketWhisper" },
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