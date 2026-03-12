export default function Success() {
  return (
    <div style={{ background: "#080b10", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center", border: "1px solid rgba(201,168,76,0.3)", padding: "3rem", maxWidth: "480px" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
        <div style={{ fontFamily: "serif", fontSize: "1.8rem", color: "#e8c97a", marginBottom: "1rem" }}>Bienvenue sur MarketWhisper Premium !</div>
        <div style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "2rem", lineHeight: 1.6 }}>
          Ton accès premium est activé. Tu vas recevoir les alertes breaking news en temps réel.
        </div>
        <a href="/" style={{ background: "linear-gradient(135deg, #c9a84c, #e8c97a)", color: "#080b10", padding: "0.8rem 2rem", textDecoration: "none", fontFamily: "monospace", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Accéder au site →
        </a>
      </div>
    </div>
  )
}