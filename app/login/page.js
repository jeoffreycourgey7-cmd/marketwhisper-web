'use client'
import { useState } from "react";
import { supabase } from "../../lib/supabase";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --bg: #080b10; --surface: #0e1318; --surface2: #131920;
    --border: rgba(255,255,255,0.06); --gold: #c9a84c; --gold-light: #e8c97a;
    --green: #3ddc97; --red: #ff5f5f; --text: #e8e8e0; --muted: #6b7280;
    --premium: linear-gradient(135deg, #c9a84c, #e8c97a, #c9a84c);
  }
  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; min-height: 100vh; }
  input { width: 100%; background: var(--surface2); border: 1px solid var(--border); color: var(--text); padding: 0.8rem 1rem; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; outline: none; margin-bottom: 1rem; transition: border-color 0.2s; }
  input:focus { border-color: var(--gold); }
  input::placeholder { color: var(--muted); }
  .btn-premium { background: var(--premium); color: #080b10; border: none; padding: 0.9rem; font-family: 'DM Mono', monospace; font-size: 0.8rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: opacity 0.2s; width: 100%; }
  .btn-premium:hover { opacity: 0.85; }
  .btn-outline { background: none; border: 1px solid var(--border); color: var(--muted); padding: 0.9rem; font-family: 'DM Mono', monospace; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; width: 100%; margin-top: 0.5rem; }
  .btn-outline:hover { border-color: var(--gold); color: var(--gold); }
  .plan-card { border: 1px solid var(--border); padding: 1.2rem; cursor: pointer; transition: all 0.2s; margin-bottom: 0.8rem; display: flex; justify-content: space-between; align-items: center; }
  .plan-card:hover { border-color: var(--gold); }
  .plan-card.selected { border-color: var(--gold); background: rgba(201,168,76,0.05); }
  .plan-card.selected-premium { border-color: var(--gold); background: rgba(201,168,76,0.08); position: relative; overflow: hidden; }
  .plan-card.selected-premium::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--premium); }
  .error { color: var(--red); font-family: 'DM Mono', monospace; font-size: 0.75rem; margin-bottom: 1rem; }
  .success { color: var(--green); font-family: 'DM Mono', monospace; font-size: 0.75rem; margin-bottom: 1rem; }
  .password-rule { font-family: 'DM Mono', monospace; font-size: 0.65rem; margin-bottom: 0.3rem; }
  .rule-ok { color: var(--green); }
  .rule-fail { color: var(--muted); }
`;

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
const hasLength = password.length >= 8;
const hasNumber = /[0-9]/.test(password);
const passwordValid = hasUppercase && hasSpecial && hasLength && hasNumber;

  const handleCheckout = async (selectedPlan) => {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: selectedPlan })
    });
    const data = await response.json();
    if (data.url) window.location.href = data.url;
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    if (!firstName || !lastName) { setError("Prénom et nom requis."); setLoading(false); return; }
    if (!passwordValid) { setError("Le mot de passe ne respecte pas les règles."); setLoading(false); return; }
    if (password !== confirmPassword) { setError("Les mots de passe ne correspondent pas."); setLoading(false); return; }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName, phone: phone || null }
        }
      });
      if (error) throw error;

      if (plan === "monthly" || plan === "yearly") {
        await handleCheckout(plan);
      } else {
        setMessage("Compte créé ! Vérifie ton email pour confirmer.");
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{style}</style>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ width: "100%", maxWidth: "460px" }}>

          {/* LOGO */}
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <a href="/" style={{ textDecoration: "none" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 900, background: "var(--premium)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Market<span style={{ fontWeight: 400, fontStyle: "italic" }}>Whisper</span>
              </div>
            </a>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "var(--muted)", letterSpacing: "0.15em", marginTop: "0.5rem" }}>
              {mode === "login" ? "CONNEXION" : "CRÉER UN COMPTE"}
            </div>
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid rgba(201,168,76,0.2)", padding: "2rem", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "var(--premium)" }} />

            {mode === "login" ? (
              <>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
                {error && <div className="error">❌ {error}</div>}
                <button className="btn-premium" onClick={handleLogin} disabled={loading}>{loading ? "Chargement..." : "Se connecter"}</button>
                <button className="btn-outline" onClick={() => { setMode("register"); setError(""); }}>Pas encore de compte ? S'inscrire</button>
              </>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                  <input type="text" placeholder="Prénom *" value={firstName} onChange={e => setFirstName(e.target.value)} style={{ marginBottom: 0 }} />
                  <input type="text" placeholder="Nom *" value={lastName} onChange={e => setLastName(e.target.value)} style={{ marginBottom: 0 }} />
                </div>
                <div style={{ marginBottom: "1rem" }} />
                <input type="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} />
                <input type="tel" placeholder="Téléphone (optionnel)" value={phone} onChange={e => setPhone(e.target.value)} />
                <input type="password" placeholder="Mot de passe *" value={password} onChange={e => setPassword(e.target.value)} />

                {password.length > 0 && (
                  <div style={{ marginBottom: "1rem", padding: "0.8rem", background: "var(--surface2)", border: "1px solid var(--border)" }}>
                    <div className={`password-rule ${hasLength ? "rule-ok" : "rule-fail"}`}>{hasLength ? "✓" : "○"} Au moins 8 caractères</div>
                    <div className={`password-rule ${hasUppercase ? "rule-ok" : "rule-fail"}`}>{hasUppercase ? "✓" : "○"} Au moins 1 majuscule</div>
                    <div className={`password-rule ${hasSpecial ? "rule-ok" : "rule-fail"}`}>{hasSpecial ? "✓" : "○"} Au moins 1 caractère spécial (!@#$...)</div>
<div className={`password-rule ${hasNumber ? "rule-ok" : "rule-fail"}`}>{hasNumber ? "✓" : "○"} Au moins 1 chiffre</div>
                  </div>
                )}

                <input type="password" placeholder="Confirmer le mot de passe *" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />

                {/* CHOIX DU PLAN */}
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "var(--gold)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.8rem" }}>Choisir un plan</div>

                <div className={`plan-card ${plan === "free" ? "selected" : ""}`} onClick={() => setPlan("free")}>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>Gratuit</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.2rem" }}>Accès aux marchés et cotes</div>
                  </div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700 }}>0€</div>
                </div>

                <div className={`plan-card ${plan === "monthly" ? "selected-premium" : ""}`} onClick={() => setPlan("monthly")}>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 500, color: plan === "monthly" ? "var(--gold-light)" : "var(--text)" }}>✦ Premium Mensuel</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.2rem" }}>Analyses IA + opportunités</div>
                  </div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700, color: "var(--gold-light)" }}>19€<span style={{ fontSize: "0.7rem", color: "var(--muted)", fontFamily: "'DM Mono', monospace" }}>/mois</span></div>
                </div>

                <div className={`plan-card ${plan === "yearly" ? "selected-premium" : ""}`} onClick={() => setPlan("yearly")}>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 500, color: plan === "yearly" ? "var(--gold-light)" : "var(--text)" }}>✦ Premium Annuel</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.2rem" }}>Économisez 40% · Sans engagement</div>
                  </div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700, color: "var(--gold-light)" }}>9€<span style={{ fontSize: "0.7rem", color: "var(--muted)", fontFamily: "'DM Mono', monospace" }}>/mois</span></div>
                </div>

                {error && <div className="error">❌ {error}</div>}
                {message && <div className="success">✅ {message}</div>}

                <button className="btn-premium" onClick={handleRegister} disabled={loading}>
                  {loading ? "Chargement..." : plan === "free" ? "Créer mon compte gratuit" : "Créer mon compte et payer"}
                </button>
                <button className="btn-outline" onClick={() => { setMode("login"); setError(""); }}>Déjà un compte ? Se connecter</button>
              </>
            )}
          </div>

          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <a href="/" style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "var(--muted)", textDecoration: "none" }}>← Retour au site</a>
          </div>
        </div>
      </div>
    </>
  );
}