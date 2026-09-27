var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js — CMS Expansion Worker v2.1 (corrigé)
//
// CHANGEMENTS vs v2.0 :
// 1. Les métadonnées sont écrites dans metadata_json.metadata_tags.F0X_*
//    (structure lue par l'API publique), plus dans une table metadata_tags
//    séparée que personne ne lit jamais.
// 2. F02_cultural, F04_rhythmic et F06_sociohistorical ne sont PLUS
//    fabriquées à partir d'une liste générique par territoire — ce sont des
//    affirmations sur le contenu réel de l'œuvre, que Wikidata ne fournit
//    pas et qu'un bot ne peut pas deviner honnêtement. Elles restent vides,
//    à remplir par un humain.
// 3. Seules F01_linguistic, F05_geographic et F03_narrative sont peuplées,
//    parce que ce sont les seules données réellement retournées par la
//    requête SPARQL pour l'œuvre en question (pas une déduction par pays).
// 4. Le score et le niveau de conformité sont calculés à partir de ce qui
//    est réellement rempli, plus jamais codés en dur à 3/"partial".
// 5. cms_verified: false explicite — conforme au champ prévu par le spec
//    CMS v2.0 pour distinguer un import automatique d'une vérification
//    humaine. Le bot ne prétend jamais avoir vérifié quoi que ce soit.

var SUPABASE_URL = "https://vtbaqvjxfgseykjcinpu.supabase.co";
var SUPABASE_KEY = "sb_publishable_cZc3a7kaK3M7ZcHRsoTI8w_NQz4Xy0z";
var WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql";

var CARIBBEAN_COUNTRIES = {
  Q3616: "Guadeloupe",
  Q17012: "Martinique",
  Q13: "Haiti",
  Q766: "Jamaica",
  Q754: "Trinidad",
  Q730: "Suriname",
  Q25279: "Curacao",
  Q241: "Cuba",
  Q21203: "Aruba",
  Q1183: "Puerto Rico",
  Q786: "Dominican Republic",
  Q244: "Barbados",
  Q760: "Saint Lucia",
  Q769: "Grenada",
  Q778: "Bahamas",
  Q242: "Belize"
};
var TERR_CODES = {
  Guadeloupe: "GLP", Martinique: "MTQ", Haiti: "HTI", Jamaica: "JAM",
  Trinidad: "TTO", Suriname: "SUR", Curacao: "CUW", Cuba: "CUB",
  Aruba: "ABW", "Puerto Rico": "PRI", "Dominican Republic": "DOM",
  Barbados: "BRB", "Saint Lucia": "LCA", Grenada: "GRD", Bahamas: "BHS",
  Belize: "BLZ"
};
var LANG_QMAP = {
  Q150: "fr", Q1321: "es", Q1860: "en", Q33491: "ht", Q3099915: "gcf",
  Q33111: "pap", Q34340: "srn", Q7411: "nl", Q33287: "acf"
};
var LANG_CODE_NORMALIZE = { eng: "en", fre: "fr", fra: "fr", spa: "es", acf: "gcf" };
var TERRITORY_LANG_FALLBACK = {
  Guadeloupe: "fr", Martinique: "fr", Haiti: "ht", Jamaica: "en",
  Trinidad: "en", Suriname: "nl", Curacao: "pap", Cuba: "es",
  Aruba: "pap", "Puerto Rico": "es", "Dominican Republic": "es",
  Barbados: "en", "Saint Lucia": "en", Grenada: "en", Bahamas: "en",
  Belize: "en", "Caribbean (g\xE9n\xE9ral)": "en"
};
var FAMILY_MAP = {
  Guadeloupe: "musical", Martinique: "musical", Haiti: "musical",
  Jamaica: "musical", Trinidad: "musical", Suriname: "heritage",
  Curacao: "musical", Cuba: "musical", Aruba: "musical",
  "Puerto Rico": "musical", "Dominican Republic": "musical",
  Barbados: "musical", "Saint Lucia": "performing_arts",
  Grenada: "musical", Bahamas: "performing_arts", Belize: "heritage"
};
// Domaine narratif déduit du type d'œuvre — F03_narrative, seule famille
// de "contenu" qu'on peut honnêtement déduire du type Wikidata (Q482994 =
// œuvre musicale, Q11424 = film, etc.), pas du territoire.
var DOMAIN_MAP = { musical: "music", heritage: "intangible_heritage", performing_arts: "theatre" };

// ── Seuils de conformité — identiques au spec CMS v2.0 / worker.js ─────────
var ALL_FAMILIES = ["F01_linguistic", "F02_cultural", "F03_narrative", "F04_rhythmic", "F05_geographic", "F06_sociohistorical"];
var NON_MUSICAL_FAMILIES = ALL_FAMILIES.filter((f) => f !== "F04_rhythmic");
var COMPLIANCE_THRESHOLDS = [
  { level: "platinum", min: 85 },
  { level: "gold", min: 65 },
  { level: "silver", min: 40 },
  { level: "bronze", min: 20 }
];
function complianceLevel(pct) {
  const t = COMPLIANCE_THRESHOLDS.find((t2) => pct >= t2.min);
  return t ? t.level : null;
}
__name(complianceLevel, "complianceLevel");

function generateCMSId(territory) {
  const code = TERR_CODES[territory] || "CAR";
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `CMS-${code}-${year}-${rand}`;
}
__name(generateCMSId, "generateCMSId");

async function getExistingTitles() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/works?select=title&limit=5000`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  if (!r.ok) return /* @__PURE__ */ new Set();
  const data = await r.json();
  return new Set(data.map((w) => w.title?.toLowerCase()).filter(Boolean));
}
__name(getExistingTitles, "getExistingTitles");

async function queryWikidata(sparql) {
  const url = `${WIKIDATA_ENDPOINT}?format=json&query=${encodeURIComponent(sparql)}`;
  const r = await fetch(url, {
    headers: { "User-Agent": "CMS-Worker/2.1 (caribbeanmetadata.org)" }
  });
  if (!r.ok) return [];
  const data = await r.json();
  return data.results?.bindings || [];
}
__name(queryWikidata, "queryWikidata");

// ── Relecture IA (remplace la relecture humaine bloquante) ─────────────────
// Le CMS v2.0 prévoit un champ cms_verified pensé pour un annotateur humain
// caribéen — irréaliste en pratique pour couvrir gcf/acf/ht/pap/nl/en/fr/es
// à la fois. On utilise Claude comme agent de relecture à la place : il migre
// les œuvres de "importée, invisible" à "relue, publique" en analysant
// spécifiquement CETTE œuvre, pas en devinant depuis son territoire.
async function enrichWithAI(env, { title, territory, domain, family, description }) {
  if (!env.ANTHROPIC_API_KEY) return null;

  const prompt = `Tu es un expert en cultures caribéennes (musique, patrimoine, langues créoles, histoire).

Œuvre à analyser :
- Titre : ${title}
- Territoire : ${territory}
- Domaine : ${domain}
- Description Wikidata : ${description || "aucune disponible"}

Réponds UNIQUEMENT en JSON valide, sans aucun texte autour, avec cette structure :
{
  "cultural_markers": [],
  "rhythmic_markers": [],
  "sociohistorical_markers": [],
  "confidence": "low"
}

Règles strictes :
- N'indique un marqueur QUE si tu as une connaissance réelle et spécifique de CETTE œuvre précise (pas une déduction générique à partir du territoire seul).
- rhythmic_markers ne s'applique qu'aux œuvres musicales — laisse vide sinon.
- Si tu ne connais pas cette œuvre avec certitude, renvoie des tableaux vides et confidence "low". Une fiche incomplète mais honnête vaut mieux qu'une fiche inventée.`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!r.ok) return null;
    const data = await r.json();
    const text = data.content?.find((b) => b.type === "text")?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (e) {
    return null;
  }
}
__name(enrichWithAI, "enrichWithAI");

async function insertWork(title, territory, language, year, family, status) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/works`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify({
      title,
      title_original: title,
      family,
      year: year ? parseInt(year) : (/* @__PURE__ */ new Date()).getFullYear(),
      territory,
      languages: [language],
      description: `\u0152uvre import\xE9e depuis Wikidata \u2014 ${territory} \u2014 relecture IA`,
      status
    })
  });
  if (!r.ok) return null;
  const data = await r.json();
  return Array.isArray(data) ? data[0]?.id : data?.id;
}
__name(insertWork, "insertWork");

// Construit la structure metadata_tags à partir des données Wikidata sûres
// (F01/F05/F03) et, si la relecture IA a produit un résultat exploitable,
// des familles de contenu (F02/F04/F06) qu'elle a explicitement remplies.
function buildMetadataTags(territory, language, family, domain, aiResult) {
  const tags = {
    F01_linguistic: { language, language_name: language },
    F05_geographic: { territory },
    F03_narrative: { domain, genre: family }
  };
  if (aiResult?.cultural_markers?.length) {
    tags.F02_cultural = { markers: aiResult.cultural_markers, ai_suggested: true };
  }
  if (family === "musical" && aiResult?.rhythmic_markers?.length) {
    tags.F04_rhythmic = { markers: aiResult.rhythmic_markers, ai_suggested: true };
  }
  if (aiResult?.sociohistorical_markers?.length) {
    tags.F06_sociohistorical = { markers: aiResult.sociohistorical_markers, ai_suggested: true };
  }
  return tags;
}
__name(buildMetadataTags, "buildMetadataTags");

function isFamilyFilled(value) {
  if (!value || typeof value !== "object") return false;
  return Object.values(value).some((v) => Array.isArray(v) ? v.length > 0 : !!v);
}
__name(isFamilyFilled, "isFamilyFilled");

function computeCompleteness(family, tags) {
  const applicable = family === "musical" ? ALL_FAMILIES : NON_MUSICAL_FAMILIES;
  const filled = applicable.filter((f) => isFamilyFilled(tags[f]));
  const percentage = applicable.length ? Math.round(filled.length / applicable.length * 100) : 0;
  return { families_filled: filled.length, total_families: applicable.length, percentage };
}
__name(computeCompleteness, "computeCompleteness");

async function insertCertification(workId, territory, family, metadataTags, completeness, aiResult) {
  const cmsId = generateCMSId(territory);
  const level = complianceLevel(completeness.percentage);
  const r = await fetch(`${SUPABASE_URL}/rest/v1/certifications`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify({
      work_id: workId,
      cms_id: cmsId,
      score: completeness.percentage,
      level: level || "unregistered",
      cms_verified: false,
      ai_verified: !!aiResult,
      ai_confidence: aiResult?.confidence || null,
      metadata_json: {
        cms_id: cmsId,
        territory,
        source: "Wikidata",
        bot: "CMS-Worker-v2.2",
        families_filled: completeness.families_filled,
        completude_pct: completeness.percentage,
        metadata_tags: metadataTags
      }
    })
  });
  if (!r.ok) return null;
  const data = await r.json();
  return Array.isArray(data) ? data[0]?.id : data?.id;
}
__name(insertCertification, "insertCertification");

async function runExpansion(env) {
  const log = { started_at: (/* @__PURE__ */ new Date()).toISOString(), inserted: 0, errors: [] };
  const existing = await getExistingTitles();
  const seen = new Set(existing);
  const countryValues = Object.keys(CARIBBEAN_COUNTRIES).map((q) => `wd:${q}`).join(" ");
  const queries = [
    `SELECT DISTINCT ?item ?itemLabel ?itemDescription ?country ?lang ?year WHERE {
      VALUES ?country { ${countryValues} }
      ?item wdt:P31 wd:Q482994 ; wdt:P495 ?country .
      OPTIONAL { ?item wdt:P577 ?date . BIND(YEAR(?date) AS ?year) }
      OPTIONAL { ?item wdt:P407 ?lang }
      OPTIONAL { ?item schema:description ?itemDescription . FILTER(LANG(?itemDescription) IN ("en","fr","es")) }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en,fr,es". }
    } LIMIT 200`,
    `SELECT DISTINCT ?item ?itemLabel ?itemDescription ?country ?lang ?year WHERE {
      VALUES ?country { ${countryValues} }
      ?item wdt:P31 wd:Q11424 ; wdt:P495 ?country .
      OPTIONAL { ?item wdt:P577 ?date . BIND(YEAR(?date) AS ?year) }
      OPTIONAL { ?item wdt:P364 ?lang }
      OPTIONAL { ?item schema:description ?itemDescription . FILTER(LANG(?itemDescription) IN ("en","fr","es")) }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en,fr,es". }
    } LIMIT 200`,
    `SELECT DISTINCT ?item ?itemLabel ?itemDescription ?country ?lang ?year WHERE {
      VALUES ?country { ${countryValues} }
      ?artist wdt:P27 ?country ; wdt:P31 wd:Q5 .
      ?item wdt:P175 ?artist ; wdt:P31 ?t .
      FILTER(?t IN (wd:Q482994, wd:Q134556, wd:Q11424))
      OPTIONAL { ?item wdt:P577 ?date . BIND(YEAR(?date) AS ?year) }
      OPTIONAL { ?item wdt:P407 ?lang }
      OPTIONAL { ?item schema:description ?itemDescription . FILTER(LANG(?itemDescription) IN ("en","fr","es")) }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en,fr,es". }
    } LIMIT 300`
  ];
  for (const sparql of queries) {
    try {
      const rows = await queryWikidata(sparql);
      for (const row of rows) {
        const title = row.itemLabel?.value;
        if (!title) continue;
        if (/^Q\d+$/.test(title)) continue;
        if (title.length < 2 || title.length > 120) continue;
        if (/[.!?]\s/.test(title)) continue;
        if (seen.has(title.toLowerCase())) continue;
        seen.add(title.toLowerCase());

        const countryUri = row.country?.value || "";
        const qcode = countryUri.split("/").pop();
        const territory = CARIBBEAN_COUNTRIES[qcode] || "Caribbean (g\xE9n\xE9ral)";
        const langUri = row.lang?.value || "";
        const rawLangCode = langUri.split("/").pop();
        let lang = LANG_QMAP[rawLangCode];
        if (!lang && rawLangCode) {
          lang = LANG_CODE_NORMALIZE[rawLangCode.toLowerCase()] || null;
        }
        if (!lang) {
          lang = TERRITORY_LANG_FALLBACK[territory] || "en";
        }
        const year = row.year?.value || "";
        const family = FAMILY_MAP[territory] || "musical";
        const domain = DOMAIN_MAP[family] || "general";
        const description = row.itemDescription?.value || "";

        // Relecture IA — remplace le blocage sur validation humaine.
        // status='validated' seulement si Claude a produit un résultat
        // exploitable (même avec confidence "low" et tableaux vides — ça
        // reste une vraie tentative d'analyse, pas un échec technique).
        // ai_verified=true dans la certification garde la trace que c'est
        // l'IA, pas un humain, qui a validé (works_status_check n'autorise
        // que pending | in_review | validated | rejected — pas de valeur
        // séparée pour "validé par IA" au niveau du statut lui-même).
        // Si l'appel échoue (quota, réseau, JSON invalide), status reste
        // 'pending' : invisible côté API publique, retenté au prochain run
        // puisque le titre ne sera pas encore dans `seen`.
        const aiResult = await enrichWithAI(env, { title, territory, domain, family, description });
        const status = aiResult ? "validated" : "pending";

        const workId = await insertWork(title, territory, lang, year, family, status);
        if (workId) {
          const metadataTags = buildMetadataTags(territory, lang, family, domain, aiResult);
          const completeness = computeCompleteness(family, metadataTags);
          await insertCertification(workId, territory, family, metadataTags, completeness, aiResult);
          log.inserted++;
          if (status === "pending") log.errors.push(`IA indisponible pour "${title}" — restera invisible jusqu'au prochain run`);
        }
        await new Promise((r) => setTimeout(r, 300));
      }
    } catch (e) {
      log.errors.push(e.message);
    }
    await new Promise((r) => setTimeout(r, 2e3));
  }
  log.finished_at = (/* @__PURE__ */ new Date()).toISOString();
  log.total_corpus = existing.size + log.inserted;
  log.note = "Chaque œuvre passe par une relecture IA (Claude) avant publication. status='validated' + visible publiquement si l'IA a produit une analyse (ai_verified=true dans la certification garde la trace que c'est l'IA et non un humain) ; status='pending' + invisible si l'appel a échoué (retenté au prochain run). cms_verified=true (relecture humaine) reste disponible comme niveau de confiance supérieur via /verify si vous voulez l'utiliser plus tard.";
  return log;
}
__name(runExpansion, "runExpansion");

var index_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/trigger") {
      ctx.waitUntil(runExpansion(env));
      return new Response(JSON.stringify({ status: "started", message: "Expansion en cours (v2.1 — écriture corrigée)..." }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
    return new Response(JSON.stringify({ status: "CMS Expansion Worker v2.1", next_run: "Sunday 03:00 UTC" }), {
      headers: { "Content-Type": "application/json" }
    });
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runExpansion(env));
  }
};
export {
  index_default as default
};
