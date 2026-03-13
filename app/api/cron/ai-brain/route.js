import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function analyzeMarket(market) {
  const prompt = `Tu es un analyste expert en marchés de prédiction Polymarket. Tu cherches les opportunités où le marché sous-évalue ou sur-évalue une probabilité.

MARCHÉ : ${market.title}
CATÉGORIE : ${market.category}
COTE ACTUELLE : OUI ${market.yes_probability}% / NON ${market.no_probability}%
VOLUME : $${Math.round(market.volume / 1000)}k
DATE DE FIN : ${market.end_date || "Non définie"}

INSTRUCTIONS :
1. Analyse si la cote actuelle reflète correctement la réalité
2. Estime la vraie probabilité selon ton analyse
3. Si l'écart entre la cote actuelle et ta vraie probabilité est supérieur à 10 points → c'est une opportunité
4. Ne signale PAS les marchés où la cote est déjà à 95%+ ou 5%- car ils sont quasi résolus

Réponds UNIQUEMENT en JSON valide :
{
  "is_opportunity": true ou false,
  "verdict": "OUI" ou "NON",
  "current_probability": nombre,
  "real_probability": nombre,
  "edge": nombre,
  "confidence": nombre entre 50 et 95,
  "rationale": "explication en français de 2-3 phrases max",
  "analyst": "MW Alpha" ou "MW Delta" ou "MW Sigma"
}`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].text.trim();
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const { data: markets, error } = await supabase
      .from("markets")
      .select("*")
      .gt("yes_probability", 5)
      .lt("yes_probability", 95)
 .or(`end_date.gte.${new Date().toISOString()},end_date.is.null`)
      .order("volume", { ascending: false })
      .limit(20);

    if (error) return Response.json({ error: error.message }, { status: 500 });

    let opportunities = 0;

    for (const market of markets) {
      try {
        const analysis = await analyzeMarket(market);
        if (analysis.is_opportunity) {
          await supabase.from("predictions").delete().eq("market_id", market.id);
          await supabase.from("predictions").insert({
            market_id: market.id,
            verdict: analysis.verdict,
            confidence: analysis.confidence,
            rationale: analysis.rationale,
            analyst: analysis.analyst,
            is_premium: true,
            created_at: new Date().toISOString(),
          });
          opportunities++;
        }
        await sleep(1000);
      } catch (err) {
        console.error("Erreur analyse:", err.message);
      }
    }

    return new Response(JSON.stringify({ success: true, opportunities }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}