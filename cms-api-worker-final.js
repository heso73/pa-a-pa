/**
 * CMS API — Caribbean Metadata Standard v2.0
 * Cloudflare Worker — Public REST API
 * Caribwood Language Lab — caribbeanmetadata.org
 */

const SUPABASE_URL = 'https://vtbaqvjxfgseykjcinpu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_cZc3a7kaK3M7ZcHRsoTI8w_NQz4Xy0z';

// Client ID OAuth GitHub (public, sans risque — le secret reste dans env.GITHUB_CLIENT_SECRET)
const GITHUB_OAUTH_CLIENT_ID = 'Ov23liUAL8hHWOnbXPwf';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json; charset=utf-8',
};

// ── Vocabulaires CMS v2.0 ──────────────────────────────────────────────────
const VOCABULARIES = {
  languages: {
    hat: 'Créole haïtien',
    gcf: 'Créole guadeloupéen',
    acf: 'Créole antillais (Martinique)',
    jam: 'Jamaican Patois',
    pap: 'Papiamentu (Aruba · Curaçao)',
    srn: 'Sranan Tongo (Suriname)',
    nld: 'Nederlands Caribisch',
    fra: 'Français caribéen',
    eng: 'English Caribbean',
    spa: 'Español caribeño',
  },
  territories: [
    'Haiti','Guadeloupe','Martinique','Guyane','Jamaica','Trinidad',
    'Barbados','Cuba','Dominican Republic','Puerto Rico','Aruba',
    'Curacao','Suriname','Dominica','St Lucia','St Vincent',
    'Grenada','Antigua','Diaspora caribéenne','Caribbean (général)',
  ],
  domains: [
    'music','dance','theatre','literature','oral_tradition',
    'intangible_heritage','religion','gastronomy','carnival',
    'visual_arts','education','general','news','social_media',
  ],
  families: [
    'audiovisual','musical','literary','heritage','visual_arts','performing_arts',
  ],
  cultural_markers: {
    music: ['Gwo Ka','Bèlè','Konpa','Zouk','Calypso','Soca','Reggae','Ska',
            'Dancehall','Tumba','Son Cubano','Salsa','Bachata','Merengue',
            'Kaseko','Kadans','Bouyon'],
    dance_performance: ['Quadrille créole','Danmyé','Kalenda'],
    carnival_heritage: ['Carnival','Mas','Rara'],
    religion_spirituality: ['Vodou','Orisha','Rastafari'],
    heritage: ['Maroon Culture','Chanté Noël'],
    sociohistorical: ["Mémoire de l'esclavage",'Créolisation','Négritude',
                      'Antillanité','Postcolonialité','Marronage'],
  },
};

// ── Complétude & certification (CMS v2.0, spec cms-v2.json) ────────────────
// F04_rhythmic ne s'applique qu'aux œuvres musicales (spec: "cms_cultural_markers
// (music subset)") — les autres familles s'appliquent à tous les types d'œuvre.
const ALL_FAMILIES = ['F01_linguistic', 'F02_cultural', 'F03_narrative', 'F04_rhythmic', 'F05_geographic', 'F06_sociohistorical'];
const NON_MUSICAL_FAMILIES = ALL_FAMILIES.filter(f => f !== 'F04_rhythmic');

// Seuils de conformité — repris tels quels du spec verrouillé (cms_compliance.level.thresholds)
const COMPLIANCE_THRESHOLDS = [
  { level: 'platinum', min: 85 },
  { level: 'gold', min: 65 },
  { level: 'silver', min: 40 },
  { level: 'bronze', min: 20 },
];

function complianceLevel(pct) {
  const t = COMPLIANCE_THRESHOLDS.find(t => pct >= t.min);
  return t ? t.level : null;
}

// Une famille est "remplie" si sa valeur existe ET contient au moins un marqueur
// non vide (corrige le cas où {markers: []} était compté comme rempli).
function isFamilyFilled(value) {
  if (!value || typeof value !== 'object') return false;
  return Object.values(value).some(v => Array.isArray(v) ? v.length > 0 : !!v);
}

// Recalcule la complétude à la lecture, à partir des métadonnées brutes —
// source unique de vérité, indépendante de ce qu'un script d'import a pu
// stocker (families_filled / completude_pct) au moment de la certification.
function computeCompleteness(work, metadataTags) {
  const tags = metadataTags || {};
  const applicable = work.family === 'musical' ? ALL_FAMILIES : NON_MUSICAL_FAMILIES;
  const filled = applicable.filter(f => isFamilyFilled(tags[f]));
  const percentage = applicable.length ? Math.round((filled.length / applicable.length) * 100) : 0;
  return { families_filled: filled.length, total_families: applicable.length, percentage };
}

// ── Router ─────────────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '');
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (method !== 'GET' && method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }
    // POST only allowed on /api/v1/works with valid admin token
    if (method === 'POST') {
      const authHeader = request.headers.get('X-CMS-Admin') || '';
      if (authHeader !== (env.CMS_ADMIN_TOKEN || 'cms2026caribwood')) {
        return json({ error: 'Unauthorized' }, 401);
      }
    }

    // Routes
    if (path === '' || path === '/api/v1') {
      return handleRoot();
    }
    if (path === '/api/v1/vocabularies') {
      return handleVocabularies(url);
    }
    if (path === '/api/v1/vocabularies/languages') {
      return json({ version: '2.0', data: VOCABULARIES.languages });
    }
    if (path === '/api/v1/vocabularies/territories') {
      return json({ version: '2.0', data: VOCABULARIES.territories });
    }
    if (path === '/api/v1/vocabularies/domains') {
      return json({ version: '2.0', data: VOCABULARIES.domains });
    }
    if (path === '/api/v1/vocabularies/markers') {
      return json({ version: '2.0', data: VOCABULARIES.cultural_markers });
    }
    if (path === '/api/v1/schema') {
      return handleSchema();
    }
    if (path === '/api/v1/admin/probe-status' && method === 'POST') {
      return handleProbeStatus(env);
    }
    if (path === '/api/v1/admin/backfill-status' && method === 'POST') {
      return handleBackfillStatus(env);
    }
    if (path.startsWith('/api/v1/works/') && path.endsWith('/verify') && method === 'POST') {
      const id = path.replace('/api/v1/works/', '').replace(/\/verify$/, '');
      return handleVerify(id, request, env);
    }
    if (path === '/api/v1/works') {
      return handleWorks(url);
    }
    if (path.startsWith('/api/v1/works/')) {
      const id = path.replace('/api/v1/works/', '');
      return handleWork(id);
    }
    if (path === '/api/v1/stats') {
      return handleStats();
    }
    if (path === '/api/v1/auth/github/callback') {
      return handleGithubOAuthCallback(url, env);
    }

    return json({ error: 'Not found', available_endpoints: [
      'GET /api/v1',
      'GET /api/v1/vocabularies',
      'GET /api/v1/vocabularies/languages',
      'GET /api/v1/vocabularies/territories',
      'GET /api/v1/vocabularies/domains',
      'GET /api/v1/vocabularies/markers',
      'GET /api/v1/schema',
      'GET /api/v1/works',
      'GET /api/v1/works/:cms_id',
      'POST /api/v1/works/:cms_id/verify (admin, X-CMS-Admin header requis)',
      'POST /api/v1/admin/backfill-status (admin, ponctuel)',
      'GET /api/v1/stats',
    ]}, 404);
  }
};

// ── Handlers ───────────────────────────────────────────────────────────────

function handleRoot() {
  return json({
    name: 'Caribbean Metadata Standard API',
    version: '2.0',
    standard: 'CMS v2.0',
    maintainer: 'Caribwood Language Lab',
    website: 'https://caribbeanmetadata.org',
    description: 'Open REST API for Caribbean audiovisual metadata. Makes Caribbean content correctly identifiable and recommendable by platform algorithms.',
    endpoints: {
      vocabularies: '/api/v1/vocabularies',
      schema: '/api/v1/schema',
      works: '/api/v1/works',
      stats: '/api/v1/stats',
    },
    cors: 'open — CORS * enabled',
    license: 'CC-BY 4.0',
  });
}

function handleVocabularies(url) {
  return json({
    version: '2.0',
    description: 'CMS v2.0 controlled vocabularies — 10 languages, 20 territories, 14 domains, 27+ cultural markers',
    vocabularies: VOCABULARIES,
  });
}

function handleSchema() {
  return json({
    '$schema': 'http://json-schema.org/draft-07/schema#',
    '$id': 'https://caribbeanmetadata.org/api/v1/schema',
    title: 'Caribbean Metadata Standard',
    version: '2.0',
    status: 'locked',
    locked_date: '2026-06-06',
    description: 'Schéma officiel du Caribbean Metadata Standard (CMS) v2.0 — Caribwood Language Lab',
    six_families: {
      F01_linguistic:      { description: 'Langue principale ISO 639-3', alignment: 'dc:language, schema:inLanguage, MARC 041' },
      F02_cultural:        { description: 'Marqueurs culturels caribéens', alignment: 'dc:subject, schema:keywords, EBUCore genre' },
      F03_narrative:       { description: 'Domaine et type de contenu', alignment: 'dc:type, schema:genre, EBUCore contentType' },
      F04_rhythmic:        { description: 'Marqueurs musicaux et rythmiques', alignment: 'EBUCore audioFormat (extension CMS)' },
      F05_geographic:      { description: 'Territoire caribéen d\'origine', alignment: 'dc:coverage, schema:locationCreated, MARC 651' },
      F06_sociohistorical: { description: 'Mémoire, histoire, résistance', alignment: 'dc:subject, schema:about, MARC 650' },
    },
    required_fields: ['cms_id', 'lang_code', 'cms_territory', 'cms_domain', 'title', 'family'],
    cms_id_pattern: '^CMS-[A-Z]{3}-[0-9]{4}-[A-Z0-9]{8}$',
    completeness: {
      description: 'Complétude calculée sur les familles applicables au type d\'œuvre — F04_rhythmic ne compte que pour les œuvres musicales (5 familles pour les autres types)',
      formula: 'families_filled / applicable_families * 100',
      note: 'Indicateur technique objectif — pas un jugement sur la valeur culturelle de l\'œuvre',
    },
    compliance_levels: {
      description: 'Niveau de conformité CMS — une œuvre est "certified" si elle atteint au moins le niveau bronze',
      thresholds: { bronze: '>= 20%', silver: '>= 40%', gold: '>= 65%', platinum: '>= 85%' },
    },
  });
}

async function handleWorks(url) {
  const params = url.searchParams;
  const territory = params.get('territory');
  const family = params.get('family');
  const language = params.get('language');
  const domain = params.get('domain');
  const limit = Math.min(parseInt(params.get('limit') || '20'), 100);
  const offset = parseInt(params.get('offset') || '0');

  let query = `works?select=id,title,title_original,family,year,territory,languages,description,status,created_at,creators(name,type,territory)&order=created_at.desc&limit=${limit}&offset=${offset}`;

  // Verrou de visibilité : une œuvre importée (status='pending') n'est pas
  // publique tant qu'elle n'a pas été relue — par l'IA ou par un humain
  // (status='validated' dans les deux cas ; works_status_check n'autorise
  // que 'pending' | 'in_review' | 'validated' | 'rejected'). Corrige le fait
  // que l'API
  // exposait auparavant tout le corpus, y compris les imports bruts non relus.
  query += `&status=eq.validated`;

  if (territory) query += `&territory=eq.${encodeURIComponent(territory)}`;
  if (family) query += `&family=eq.${encodeURIComponent(family)}`;
  if (language) query += `&languages=cs.{${encodeURIComponent(language)}}`;

  try {
    const data = await sbFetch(query);

    // Récupérer aussi les certifications pour la complétude
    const workIds = data.map(w => w.id);
    let certs = [];
    if (workIds.length > 0) {
      const certQuery = `certifications?work_id=in.(${workIds.join(',')})&select=work_id,cms_id,metadata_json,issued_at&revoked=eq.false`;
      certs = await sbFetch(certQuery).catch(() => []);
    }
    const certMap = {};
    certs.forEach(c => { certMap[c.work_id] = c; });

    const works = data.map(w => formatWork(w, certMap[w.id]));

    return json({
      version: '2.0',
      total: works.length,
      limit,
      offset,
      filters_applied: { territory, family, language, domain },
      works,
    });
  } catch (e) {
    return json({ error: 'Database error', message: e.message }, 500);
  }
}

async function handleWork(cmsId) {
  // Validation format CMS ID
  if (!/^CMS-[A-Z]{2,5}-\d{4}-[A-Z0-9]{8}$/.test(cmsId.toUpperCase())) {
    // Peut-être un UUID direct
    if (!/^[0-9a-f-]{36}$/.test(cmsId)) {
      return json({ error: 'Invalid identifier format. Use CMS-XXX-YYYY-XXXXXXXX or UUID.' }, 400);
    }
  }

  try {
    let cert, work;

    if (cmsId.startsWith('CMS-')) {
      const certs = await sbFetch(`certifications?cms_id=eq.${encodeURIComponent(cmsId.toUpperCase())}&select=*,works(*,creators(name,type,territory))&limit=1`);
      if (!certs || certs.length === 0) return json({ error: 'Work not found', cms_id: cmsId }, 404);
      cert = certs[0];
      work = cert.works;
    } else {
      const works = await sbFetch(`works?id=eq.${cmsId}&select=*,creators(name,type,territory)&limit=1`);
      if (!works || works.length === 0) return json({ error: 'Work not found', id: cmsId }, 404);
      work = works[0];
      const certs = await sbFetch(`certifications?work_id=eq.${cmsId}&select=*&revoked=eq.false&limit=1`);
      cert = certs && certs.length > 0 ? certs[0] : null;
    }

    // Même verrou que sur le listing : une fiche importée mais pas encore
    // relue (IA ou humaine) n'est pas accessible publiquement, même par ID direct.
    if (work.status !== 'validated') {
      return json({ error: 'Work not found or not yet published', id: cmsId }, 404);
    }

    return json(formatWork(work, cert, true));
  } catch (e) {
    return json({ error: 'Database error', message: e.message }, 500);
  }
}

async function handleStats() {
  try {
    const [works, certs] = await Promise.all([
      sbFetch('works?select=territory,family,languages,status'),
      // On joint désormais works(family) pour pouvoir recalculer la complétude
      // en tenant compte de l'applicabilité de F04_rhythmic par type d'œuvre.
      sbFetch('certifications?select=metadata_json,issued_at,works(family)&revoked=eq.false'),
    ]);

    const territories = {};
    const families = {};
    let pendingCount = 0;
    works.forEach(w => {
      if (w.status !== 'validated') { pendingCount++; return; } // exclu des stats publiques, comme du listing
      if (w.territory) territories[w.territory] = (territories[w.territory] || 0) + 1;
      if (w.family) families[w.family] = (families[w.family] || 0) + 1;
    });

    const recomputed = certs.map(c => {
      const pct = computeCompleteness(c.works || {}, c.metadata_json?.metadata_tags).percentage;
      return { percentage: pct, level: complianceLevel(pct) };
    });

    const registeredCount = recomputed.length;
    const certifiedCount = recomputed.filter(r => r.level !== null).length;

    const avgCompleteness = recomputed.length
      ? Math.round(recomputed.reduce((a, r) => a + r.percentage, 0) / recomputed.length)
      : 0;
    const fullyComplete = recomputed.filter(r => r.percentage === 100).length;
    const byLevel = { bronze: 0, silver: 0, gold: 0, platinum: 0, unregistered: 0 };
    recomputed.forEach(r => { byLevel[r.level || 'unregistered']++; });

    return json({
      version: '2.0',
      generated_at: new Date().toISOString(),
      totals: {
        works: works.length,
        published_works: works.length - pendingCount,
        pending_review: pendingCount,
        registered_works: registeredCount,   // toute ligne de certification en base (ex-imports inclus)
        certified_works: certifiedCount,     // atteint au moins le niveau bronze du spec
        territories_represented: Object.keys(territories).length,
        families_represented: Object.keys(families).length,
      },
      completeness: {
        average_pct: avgCompleteness,
        fully_complete: fullyComplete,
        by_compliance_level: byLevel,
        description: 'Percentage of applicable CMS families filled per work (F04_rhythmic excluded for non-musical works)',
      },
      by_territory: territories,
      by_family: families,
    });
  } catch (e) {
    return json({ error: 'Database error', message: e.message }, 500);
  }
}

// ── OAuth GitHub (CMS Builder) ────────────────────────────────────────────
async function handleGithubOAuthCallback(url, env) {
  const code = url.searchParams.get('code');
  if (!code) return json({ error: 'missing_code', error_description: 'Paramètre code manquant' }, 400);

  if (!env.GITHUB_CLIENT_SECRET) {
    return json({ error: 'server_misconfigured', error_description: 'GITHUB_CLIENT_SECRET non configuré sur le Worker' }, 500);
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        client_id: GITHUB_OAUTH_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const data = await tokenRes.json();
    if (data.error) {
      return json({ error: data.error, error_description: data.error_description || null }, 400);
    }
    return json({ access_token: data.access_token, token_type: data.token_type, scope: data.scope });
  } catch (e) {
    return json({ error: 'oauth_exchange_failed', message: e.message }, 500);
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatWork(work, cert, full = false) {
  const meta = cert?.metadata_json || {};
  const completeness = computeCompleteness(work, meta.metadata_tags);
  const level = complianceLevel(completeness.percentage);

  // registered = une ligne de certification existe en base (signal brut, ex-import).
  // certified  = en plus, le contenu atteint au moins le niveau "bronze" du spec.
  // C'est la distinction qui manquait : avant, certified = !!cert uniquement,
  // ce qui faisait passer des fiches à 0% de complétude pour "certifiées".
  const registered = !!cert;
  const certified = registered && level !== null;

  const base = {
    cms_id: cert?.cms_id || null,
    id: work.id,
    title: work.title,
    title_original: work.title_original || null,
    family: work.family,
    year: work.year,
    territory: work.territory,
    languages: work.languages || [],
    creator: work.creators ? {
      name: work.creators.name,
      type: work.creators.type,
      territory: work.creators.territory,
    } : null,
    completeness,
    compliance_level: level,          // bronze | silver | gold | platinum | null
    registered,                        // nouveau champ : présence brute en base
    certified,                         // désormais conditionné à compliance_level
    certified_at: certified ? (cert?.issued_at || null) : null,
    standard: 'CMS v2.0',
    registry: 'https://caribbeanmetadata.org/certification.html',
  };

  if (full) {
    base.description = work.description || null;
    base.metadata_tags = meta.metadata_tags || {};
  }

  return base;
}

// Rattrapage ponctuel : les œuvres créées avant la mise en place du filtre
// de statut n'ont jamais eu leur `status` mis à jour, y compris celles
// travaillées à la main via CMS Builder. On repasse en 'validated'
// toute œuvre qui atteint déjà un niveau de conformité réel (bronze+),
// sans toucher aux imports Wikidata vides qui restent 'pending'.
// Sonde une seule œuvre test avec plusieurs valeurs candidates jusqu'à
// trouver celle acceptée par la contrainte works_status_check, sans
// jamais laisser la fiche dans un état incohérent (remise à 'pending' à
// la fin, quel que soit le résultat).
async function handleProbeStatus(env) {
  if (!env.SUPABASE_SERVICE_KEY) {
    return json({ error: 'SUPABASE_SERVICE_KEY non configuré' }, 500);
  }
  const testWorkId = 'cdcdda5c-0492-489b-9a1e-a3c97fedc4cd'; // Citadelle Laferrière, déjà connue
  const candidates = ['published', 'active', 'approved', 'verified', 'complete', 'completed', 'reviewed', 'live', 'certified', 'public'];
  const results = [];
  let found = null;

  for (const candidate of candidates) {
    try {
      await sbFetchWrite(`works?id=eq.${testWorkId}`, 'PATCH', { status: candidate }, env);
      results.push({ candidate, ok: true });
      found = candidate;
      break;
    } catch (e) {
      results.push({ candidate, ok: false, error: e.message.slice(0, 120) });
    }
  }

  // Remet la fiche test dans son état d'origine dans tous les cas.
  try { await sbFetchWrite(`works?id=eq.${testWorkId}`, 'PATCH', { status: 'pending' }, env); } catch (_) {}

  return json({ found_valid_value: found, attempts: results });
}

async function handleBackfillStatus(env) {
  if (!env.SUPABASE_SERVICE_KEY) {
    return json({ error: 'SUPABASE_SERVICE_KEY non configuré — voir Paramètres > Variables et secrets sur ce Worker' }, 500);
  }
  try {
    const certs = await sbFetch('certifications?select=work_id,metadata_json&revoked=eq.false');
    const worksMeta = await sbFetch('works?select=id,family,status');
    const familyById = {};
    worksMeta.forEach(w => { familyById[w.id] = w.family; });

    let updated = 0;
    const details = [];
    for (const c of certs) {
      const family = familyById[c.work_id];
      const tags = c.metadata_json?.metadata_tags || {};
      const pct = computeCompleteness({ family }, tags).percentage;
      const level = complianceLevel(pct);
      const currentStatus = worksMeta.find(w => w.id === c.work_id)?.status;
      if (level !== null && currentStatus === 'pending') {
        try {
          await sbFetchWrite(`works?id=eq.${c.work_id}`, 'PATCH', { status: 'validated' }, env);
          updated++;
          details.push({ work_id: c.work_id, level, ok: true });
        } catch (e) {
          details.push({ work_id: c.work_id, level, ok: false, error: e.message });
        }
      }
    }
    return json({ status: 'done', updated, details });
  } catch (e) {
    return json({ error: 'Database error', message: e.message }, 500);
  }
}

async function handleVerify(idOrCmsId, request, env) {
  if (!env.SUPABASE_SERVICE_KEY) {
    return json({ error: 'SUPABASE_SERVICE_KEY non configuré — voir Paramètres > Variables et secrets sur ce Worker' }, 500);
  }
  try {
    let body = {};
    try { body = await request.json(); } catch (_) { /* corps optionnel */ }
    const reviewer = body.reviewer || 'non renseigné';

    // Retrouve la fiche, que l'ID soit un CMS_ID ou un UUID interne.
    let cert;
    if (idOrCmsId.toUpperCase().startsWith('CMS-')) {
      const certs = await sbFetch(`certifications?cms_id=eq.${encodeURIComponent(idOrCmsId.toUpperCase())}&select=id,work_id,metadata_json&revoked=eq.false&limit=1`);
      cert = certs && certs[0];
    } else {
      const certs = await sbFetch(`certifications?work_id=eq.${encodeURIComponent(idOrCmsId)}&select=id,work_id,metadata_json&revoked=eq.false&limit=1`);
      cert = certs && certs[0];
    }
    if (!cert) return json({ error: 'Certification introuvable pour cet identifiant' }, 404);

    const updatedMeta = { ...(cert.metadata_json || {}), human_reviewed_by: reviewer, human_reviewed_at: new Date().toISOString() };

    // Marque la certification comme vérifiée humainement.
    await sbFetchWrite(`certifications?id=eq.${cert.id}`, 'PATCH', {
      cms_verified: true,
      metadata_json: updatedMeta,
    }, env);
    // Fait passer la fiche œuvre au statut le plus haut de visibilité/confiance.
    await sbFetchWrite(`works?id=eq.${cert.work_id}`, 'PATCH', { status: 'validated' }, env);

    return json({ status: 'verified', work_id: cert.work_id, cms_verified: true, reviewer });
  } catch (e) {
    return json({ error: 'Database error', message: e.message }, 500);
  }
}

async function sbFetchWrite(path, method, body, env) {
  const key = env.SUPABASE_SERVICE_KEY;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => '');
    throw new Error(`Supabase write error ${r.status}: ${detail}`);
  }
}

async function sbFetch(path) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!r.ok) throw new Error(`Supabase error ${r.status}`);
  return r.json();
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: CORS_HEADERS,
  });
}
