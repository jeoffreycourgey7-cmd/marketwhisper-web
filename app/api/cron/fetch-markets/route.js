import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

function detectCategory(title) {
  const t = title.toLowerCase();
  if (t.match(/bitcoin|crypto|eth|btc|solana|blockchain|token|coin|defi|matic|xrp|dogecoin|shiba|binance|coinbase|doge/)) return "Crypto";
  if (t.match(/trump|biden|election|president|democrat|republican|congress|senate|vote|political|govern|minister|prime|chancellor|party|poll|kamala|harris|musk|white house|mayor|governor|legislation|bill|law|policy|macron|modi|xi|putin|zelensky|parliament/)) return "Politique";
  if (t.match(/fed|inflation|gdp|recession|economy|stock|market|dollar|rate|bank|economic|trade|tariff|oil|gold|s&p|nasdaq|dow|interest|debt|budget|fiscal|monetary|price|cost|supply/)) return "Économie";
  if (t.match(/ai|artificial intelligence|openai|gpt|chatgpt|google|apple|microsoft|tech|software|elon|tesla|spacex|robot|meta|amazon|nvidia|chip|semiconductor|startup|app|iphone|android/)) return "Tech";
  if (t.match(/war|ukraine|russia|china|taiwan|israel|gaza|nato|military|conflict|ceasefire|iran|nuclear|bomb|attack|troops|weapon|sanction|missile|army|invasion|coup|regime/)) return "Géopolitique";
  if (t.match(/nba|nfl|soccer|football|tennis|champions league|world cup|olympic|cricket|formula 1|f1|nhl|mlb|fifa|uefa|ligue 1|premier league|laliga|liga|bundesliga|serie a|basketball|baseball|golf|boxing|mma|ufc|super bowl|playoff|championship|tournament|match|game|team|player|win|score|final|semifinal/)) return "Sport";
  if (t.match(/oscar|grammy|emmy|celebrity|movie|film|music|award|entertainment|actor|actress|singer|album|box office|netflix|disney|hollywood/)) return "Divertissement";
  return "Autre";
}

async function fetchAllMarkets() {
  let allMarkets = [];
  let offset = 0;
  const limit = 100;
  const maxMarkets = 2000;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=${limit}&offset=${offset}&order=volumeNum&ascending=false`,
      { headers: { Accept: "application/json" } }
    );
    if (!response.ok) break;
    const markets = await response.json();
    if (markets.length === 0 || markets.length < limit || allMarkets.length >= maxMarkets) {
      hasMore = false;
    } else {
      allMarkets = [...allMarkets, ...markets];
      offset += limit;
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return allMarkets;
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
     return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const markets = await fetchAllMarkets();

    const transformed = markets
      .filter((m) => m.question && m.outcomePrices && parseFloat(m.volumeNum || 0) > 10000)
      .map((market) => {
        const prices = JSON.parse(market.outcomePrices || '["0.5","0.5"]');
        const yesPrice = parseFloat(prices[0]) * 100;
        return {
          id: market.id,
          title: market.question,
          category: detectCategory(market.question || ""),
          yes_probability: Math.round(yesPrice * 100) / 100,
          no_probability: Math.round((100 - yesPrice) * 100) / 100,
          volume: parseFloat(market.volumeNum || 0),
          change_24h: parseFloat(market.oneDayPriceChange || 0) * 100,
          is_hot: parseFloat(market.volumeNum || 0) > 500000,
          end_date: market.endDate || null,
          updated_at: new Date().toISOString(),
        };
      });

    const batchSize = 100;
    let saved = 0;
    for (let i = 0; i < transformed.length; i += batchSize) {
      const batch = transformed.slice(i, i + batchSize);
      const { error } = await supabase.from("markets").upsert(batch, { onConflict: "id" });
      if (!error) saved += batch.length;
    }

    return new Response(JSON.stringify({ success: true, saved }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}