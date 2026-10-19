# -*- coding: utf-8 -*-
"""Génère les guides de contenu (FR à la racine, EN sous caribbean/guides/).
Usage : python3 tools/build_guides.py   (depuis la racine du dépôt)
Le CSS est repris de seuil-de-rentabilite.html pour rester cohérent."""
import json, re, os, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://heso73.github.io/pa-a-pa/'
DATE = '2026-10-19'
css = re.search(r'<style>(.*?)</style>', open(os.path.join(ROOT, 'seuil-de-rentabilite.html'), encoding='utf-8').read(), re.S).group(1)
css += "\n.related{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:16px 20px;margin:30px 0}.related ul{margin:8px 0 0;padding-left:1.2em}.related li{margin:6px 0}.crumbs{font-size:.92rem;color:var(--muted);margin:22px 0 0}.crumbs a{color:var(--muted)}\n"

def esc(s): return html.escape(s, quote=False).replace("'", '&#x27;')

def build(lang, slug, title, desc, h1, lead, bullets, sections, faq, related, cta, extra_html=''):
    fr = lang == 'fr'
    if fr:
        url = SITE + slug + '.html'; out = os.path.join(ROOT, slug + '.html'); base = ''
        home_url = SITE; home_name = 'Pa a Pa'; btn = ('Ouvrir l\'application', 'app/')
        locale = 'fr_FR'; brand = 'Pa a Pa'; guides_label = 'Guides'; home_rel = './'
        og_img = SITE + 'icons/og-fr.png'
        inlang = 'fr'
    else:
        url = SITE + 'caribbean/guides/' + slug + '/'; out = os.path.join(ROOT, 'caribbean', 'guides', slug, 'index.html'); base = '../../../'
        home_url = SITE + 'caribbean/'; home_name = 'Pa a Pa Caribbean'; btn = ('Open the app', '../../')
        locale = 'en_US'; brand = 'Pa a Pa Caribbean'; guides_label = 'Guides'; home_rel = '../../'
        og_img = SITE + 'caribbean/icons/og-en.png'
        inlang = 'en'
    os.makedirs(os.path.dirname(out), exist_ok=True)
    body = []
    body.append('<h1>%s</h1>' % esc(h1))
    body.append('<p class="lead">%s</p>' % lead)
    body.append('<div class="box">\n<strong>%s</strong>\n<ul>\n%s\n</ul>\n</div>' % ('En bref' if fr else 'In short', '\n'.join('<li>%s</li>' % b for b in bullets)))
    for h, paras in sections:
        body.append('<h2>%s</h2>' % esc(h))
        for p in paras:
            if isinstance(p, list): body.append('<ul>\n%s\n</ul>' % '\n'.join('<li>%s</li>' % x for x in p))
            elif p.startswith('<'): body.append(p)
            else: body.append('<p>%s</p>' % p)
    if extra_html: body.append(extra_html)
    body.append('<div class="cta">\n<p><strong>%s</strong><br>%s</p>\n<a class="btn" href="%s">%s</a>\n</div>' % (cta[0], cta[1], cta[2], cta[3]))
    body.append('<h2>%s</h2>' % ('Questions fréquentes' if fr else 'Frequently asked questions'))
    for q, a in faq:
        body.append('<details><summary>%s</summary>\n<p>%s</p></details>' % (esc(q), a))
    rel = [(t, u, d) for (t, u, d) in related]
    body.append('<div class="related"><strong>%s</strong>\n<ul>\n%s\n</ul></div>' % ('À lire aussi' if fr else 'Read next', '\n'.join('<li><a href="%s">%s</a> : %s</li>' % (u, esc(t), d) for t, u, d in rel)))
    plain = lambda s: re.sub(r'<[^>]+>', '', s).replace('&#x27;', "'")
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Article", "@id": url + '#article', "headline": h1, "description": desc, "inLanguage": inlang,
         "datePublished": DATE, "dateModified": DATE, "mainEntityOfPage": url,
         "author": {"@type": "Organization", "name": brand, "url": home_url}, "publisher": {"@type": "Organization", "name": brand, "url": home_url},
         "image": og_img},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": home_name, "item": home_url},
            {"@type": "ListItem", "position": 2, "name": h1, "item": url}]},
        {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": plain(a)}} for q, a in faq]}]}
    page = f'''<!DOCTYPE html>
<html lang="{inlang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#061440">
<title>{esc(title)}</title>
<meta name="description" content="{html.escape(desc, quote=True)}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index,follow,max-snippet:-1">
<meta property="og:type" content="article">
<meta property="og:locale" content="{locale}">
<meta property="og:site_name" content="{brand}">
<meta property="og:title" content="{html.escape(title, quote=True)}">
<meta property="og:description" content="{html.escape(desc, quote=True)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{og_img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="192x192" href="{base}{'icons/icon-192.png' if fr else 'caribbean/icons/icon-192.png'}">
<link rel="apple-touch-icon" href="{base}{'icons/apple-touch-icon.png' if fr else 'caribbean/icons/apple-touch-icon.png'}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>{css}</style>
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<script src="{base}stats.js" defer></script>
</head>
<body>
<header class="top">
<div class="wrap">
<a class="brand" href="{home_rel}">{brand}</a>
<a class="btn small" href="{btn[1]}">{btn[0]}</a>
</div>
</header>

<main class="wrap">
<p class="crumbs"><a href="{home_rel}">{home_name}</a> › {esc(h1)}</p>
{chr(10).join(body)}
</main>

<footer>
<div class="wrap">
<p>{brand} : {'outil gratuit pour tester un projet d\'entreprise, sans inscription. Les montants sont des estimations d\'orientation, pas un conseil comptable, fiscal ou juridique.' if fr else 'a free tool to test a business idea, no sign-up. Figures are planning estimates, not accounting, tax or legal advice.'}</p>
<p><a href="{home_rel}">{home_name}</a> · <a href="{base}{'confidentialite.html' if fr else 'caribbean/privacy/'}">{'Confidentialité' if fr else 'Privacy'}</a></p>
</div>
</footer>
</body>
</html>
'''
    open(out, 'w', encoding='utf-8').write(page)
    return url

# ------------------------------------------------------------------ FR
G = {}
def fr(slug, **k): G[slug] = dict(lang='fr', slug=slug, **k)

CTA_BILAN = ('Testez votre projet en quelques minutes', 'Gratuit, sans inscription. Vos réponses restent sur votre appareil.', 'app/', 'Faire le bilan de faisabilité')

RELATED_ALL = {
 'erreurs-creation-entreprise': ('Les 7 erreurs qui font échouer une entreprise', 'erreurs-creation-entreprise.html', 'ce qu\'il faut vérifier avant de se lancer'),
 'comment-creer-son-entreprise-etapes': ('Créer son entreprise : les étapes dans l\'ordre', 'comment-creer-son-entreprise-etapes.html', 'de l\'idée au premier client'),
 'se-payer-quand-on-cree-son-entreprise': ('Combien se payer quand on crée son entreprise ?', 'se-payer-quand-on-cree-son-entreprise.html', 'partir de vos besoins pour fixer le chiffre d\'affaires visé'),
 'charges-fixes-charges-variables': ('Charges fixes et charges variables', 'charges-fixes-charges-variables.html', 'la différence et pourquoi elle change tout'),
 'tresorerie-benefice-chiffre-affaires': ('Chiffre d\'affaires, bénéfice et trésorerie', 'tresorerie-benefice-chiffre-affaires.html', 'ne plus les confondre'),
 'premiers-clients-sans-budget': ('Trouver ses premiers clients sans budget', 'premiers-clients-sans-budget.html', 'six méthodes concrètes'),
 'assurance-professionnelle-creation': ('Assurance professionnelle : en faut-il une pour se lancer ?', 'assurance-professionnelle-creation.html', 'ce qui est obligatoire, ce qui est utile'),
 'previsionnel-financier-simple': ('Faire un prévisionnel financier simple', 'previsionnel-financier-simple.html', 'plan de financement, résultat et trésorerie'),
 'seuil': ('Seuil de rentabilité', 'seuil-de-rentabilite.html', 'combien vendre pour ne pas perdre d\'argent'),
 'prix': ('Prix de revient et prix de vente', 'prix-de-revient-prix-de-vente.html', 'la formule et deux exemples'),
 'bfr': ('Besoin en fonds de roulement', 'calcul-bfr.html', 'pourquoi une entreprise rentable peut manquer d\'argent'),
}
def rel(*keys): return [RELATED_ALL[k] for k in keys]

fr('erreurs-creation-entreprise',
 title='Pourquoi les entreprises échouent : 7 erreurs à éviter avant de se lancer',
 desc='Les sept erreurs qui fragilisent le plus les créateurs d\'entreprise : prix sous le coût, seuil de rentabilité inconnu, trésorerie oubliée, pas de clients. Comment les éviter, avec des exemples.',
 h1='Pourquoi les entreprises échouent : 7 erreurs à éviter avant de se lancer',
 lead='Une entreprise s\'arrête rarement à cause d\'une seule grosse erreur. Ce sont le plus souvent de petites erreurs de calcul ou de préparation, faites tôt, qui s\'additionnent. La bonne nouvelle : elles se repèrent à l\'avance, avec un crayon et quelques chiffres.',
 bullets=['Les erreurs les plus courantes concernent le prix, le seuil de rentabilité, la trésorerie et les clients.', 'Presque toutes se vérifient avant de dépenser le premier euro.', 'Un test de dix minutes, en fin de page, permet de savoir par où commencer.'],
 sections=[
  ('1. Vendre en dessous du coût réel', ['On oublie son propre temps, l\'emballage, le transport, les frais de paiement et les cotisations. Résultat : chaque vente fait perdre de l\'argent, même quand les clients sont contents.', '<strong>À faire :</strong> calculer le prix de revient complet avant de fixer le prix. Le guide <a href="prix-de-revient-prix-de-vente.html">prix de revient et prix de vente</a> donne la formule.']),
  ('2. Ne pas connaître son seuil de rentabilité', ['Sans ce chiffre, impossible de savoir si le chiffre d\'affaires visé suffit à couvrir les coûts, puis à vous payer. Beaucoup de créateurs découvrent après six mois qu\'il aurait fallu vendre deux fois plus.', '<strong>À faire :</strong> calculer le nombre de ventes mensuelles nécessaires. Voir le guide <a href="seuil-de-rentabilite.html">seuil de rentabilité</a>.']),
  ('3. Manquer de trésorerie', ['Une entreprise peut gagner de l\'argent sur le papier et ne plus pouvoir payer ses factures : clients qui paient à 30 jours, stock acheté d\'avance, loyer à régler avant la première vente.', '<strong>À faire :</strong> prévoir un plan de trésorerie mois par mois et garder une réserve. Voir <a href="tresorerie-benefice-chiffre-affaires.html">chiffre d\'affaires, bénéfice et trésorerie</a> et <a href="calcul-bfr.html">le besoin en fonds de roulement</a>.']),
  ('4. Démarrer sans clients', ['On construit d\'abord, on cherche des clients ensuite. Une idée que « tout le monde trouve bien » n\'est pas encore une vente.', '<strong>À faire :</strong> nommer cinq clients réels, puis obtenir de chacun un petit engagement : précommande, acompte ou date ferme. Voir <a href="premiers-clients-sans-budget.html">trouver ses premiers clients sans budget</a>.']),
  ('5. Oublier les impôts et les cotisations', ['L\'argent encaissé n\'est pas tout à vous. Une partie revient à l\'État sous forme de cotisations et d\'impôts, parfois des mois après la vente.', '<strong>À faire :</strong> mettre de côté la part à payer dès l\'encaissement, sur un compte séparé, et connaître les échéances de votre statut.']),
  ('6. Mélanger argent personnel et argent de l\'entreprise', ['Les dépenses personnelles passées sur le compte de l\'activité (et l\'inverse) cachent les vrais chiffres : on ne sait plus si l\'entreprise gagne de l\'argent.', '<strong>À faire :</strong> ouvrir un compte dédié à l\'activité et vous verser un montant fixe chaque mois, comme un salaire. Voir <a href="se-payer-quand-on-cree-son-entreprise.html">combien se payer</a>.']),
  ('7. Grandir trop vite', ['Embaucher, louer un local ou investir avant que les ventes soient régulières fait grimper les charges fixes, donc le seuil de rentabilité. Un mois creux suffit alors à mettre l\'activité en difficulté.', '<strong>À faire :</strong> attendre plusieurs mois de ventes au-dessus du seuil, ajouter une seule chose à la fois et estimer avant de dépenser les ventes supplémentaires que cela doit rapporter.']),
  ('Un test de dix minutes', ['Répondez par écrit à ces cinq questions. Si vous hésitez sur une seule, c\'est par là qu\'il faut commencer :', ['Combien coûte réellement une vente, tout compris ?', 'Combien dois-je vendre par mois pour couvrir mes coûts et me payer ?', 'Combien de mois puis-je tenir sans revenu ?', 'Qui sont mes cinq premiers clients, par leur nom ?', 'Quelle part de ce que j\'encaisse ne m\'appartient pas (cotisations, impôts, taxes) ?']]),
 ],
 faq=[('Quelle est la première cause d\'échec d\'une entreprise ?', 'Les analyses d\'échecs d\'entreprises reviennent surtout sur trois causes : pas assez de clients, une trésorerie insuffisante et des prix mal calculés. L\'ordre varie selon le secteur ; ce guide les traite toutes les trois.'),
      ('Peut-on vérifier son projet avant de se lancer ?', 'Oui. Il faut chiffrer le prix de revient, le seuil de rentabilité et la trésorerie, et tester l\'idée auprès de vrais clients. Pa a Pa propose un bilan de faisabilité gratuit et sans inscription.'),
      ('Faut-il un business plan pour éviter l\'échec ?', 'Un long document n\'est pas indispensable pour commencer, mais un prévisionnel simple (ventes, coûts, trésorerie) l\'est. Voir <a href="previsionnel-financier-simple.html">le guide du prévisionnel financier simple</a>.')],
 related=rel('seuil', 'prix', 'tresorerie-benefice-chiffre-affaires'), cta=CTA_BILAN)

fr('comment-creer-son-entreprise-etapes',
 title='Créer son entreprise : les étapes dans l\'ordre, de l\'idée au premier client',
 desc='Les sept étapes pour créer son entreprise dans l\'ordre : tester l\'idée, chiffrer, choisir le statut, financer, déclarer en ligne, s\'organiser, vendre. Ce qu\'il faut vérifier à chaque étape.',
 h1='Créer son entreprise : les étapes dans l\'ordre',
 lead='Beaucoup de créateurs commencent par la fin : logo, site, statut juridique. Or ce qui décide de la réussite se joue avant : est-ce que des clients paieront, et est-ce que les chiffres tiennent ? Voici les étapes dans un ordre qui évite de dépenser trop tôt.',
 bullets=['Tester l\'idée et chiffrer le projet viennent avant le statut et les démarches.', 'Les formalités de création se font en ligne sur le guichet unique des formalités d\'entreprises, géré par l\'INPI.', 'Certaines activités réglementées exigent une qualification ou une autorisation avant de vendre.'],
 sections=[
  ('1. Tester l\'idée auprès de vrais clients', ['Parlez à cinq personnes ou entreprises qui pourraient acheter. Demandez ce qu\'elles paient aujourd\'hui pour ce besoin, et ce qui leur manque. Cherchez un engagement concret : précommande, acompte, date ferme. Voir <a href="premiers-clients-sans-budget.html">trouver ses premiers clients sans budget</a>.']),
  ('2. Chiffrer le projet', ['Calculez le <a href="prix-de-revient-prix-de-vente.html">prix de revient</a>, le <a href="seuil-de-rentabilite.html">seuil de rentabilité</a> et la trésorerie des premiers mois. Décidez de ce dont vous avez besoin pour vivre : voir <a href="se-payer-quand-on-cree-son-entreprise.html">combien se payer</a>. Si les chiffres ne tiennent pas sur le papier, ils ne tiendront pas dans la réalité.']),
  ('3. Choisir le statut juridique', ['Micro-entreprise, entreprise individuelle, société : le statut change les cotisations, les impôts, la responsabilité et les formalités. Comparez-les avec vos chiffres plutôt que sur des idées toutes faites, et faites confirmer le choix par un expert-comptable ou un conseiller en création.']),
  ('4. Financer le démarrage', ['Listez ce qu\'il faut payer avant la première vente (matériel, stock, assurance, trésorerie de départ) et ce dont vous disposez (apport personnel, emprunt, aides). Les chambres de commerce et d\'industrie et les réseaux d\'accompagnement à la création peuvent vous orienter sur les dispositifs ouverts. Voir <a href="previsionnel-financier-simple.html">faire un prévisionnel financier simple</a>.']),
  ('5. Déclarer l\'entreprise', ['Les formalités de création, de modification et de cessation se font en ligne sur le <a href="https://formalites.entreprises.gouv.fr/" rel="noopener">guichet unique des formalités d\'entreprises</a>, géré par l\'INPI. Avant de déclarer, vérifiez si votre activité est réglementée : certaines exigent un diplôme, une déclaration préalable ou une autorisation avant de vendre.']),
  ('6. S\'organiser', ['Ouvrez un compte dédié à l\'activité, regardez si une <a href="assurance-professionnelle-creation.html">assurance professionnelle</a> est obligatoire ou utile pour votre métier, choisissez un outil de facturation simple et gardez tous vos justificatifs.']),
  ('7. Vendre et piloter', ['Comparez chaque mois votre chiffre d\'affaires à votre seuil de rentabilité et votre trésorerie à vos prévisions. Ajustez prix, coûts et rythme de dépenses. Évitez les <a href="erreurs-creation-entreprise.html">erreurs les plus courantes</a>.']),
  ('L\'ordre n\'est pas rigide', ['Certaines étapes se chevauchent : on peut chiffrer pendant qu\'on teste l\'idée. La règle à retenir : tester et chiffrer avant de dépenser, déclarer quand on est sûr d\'avancer.']),
 ],
 faq=[('Combien de temps faut-il pour créer une entreprise ?', 'La déclaration en ligne peut être rapide, mais la préparation (tester l\'idée, chiffrer, choisir le statut) demande plus de temps et mérite quelques semaines de travail sérieux.'),
      ('Peut-on créer son entreprise en gardant son emploi ?', 'Souvent oui, sous réserve de votre contrat de travail (clause d\'exclusivité ou de non-concurrence, par exemple). C\'est aussi un moyen prudent de tester l\'activité sans perdre son revenu.'),
      ('Faut-il un expert-comptable pour créer son entreprise ?', 'Ce n\'est pas toujours obligatoire au départ, mais un expert-comptable ou un conseiller en création aide à choisir le statut et à éviter des erreurs coûteuses. Pa a Pa ne le remplace pas : il aide à préparer la discussion avec des chiffres.')],
 related=rel('erreurs-creation-entreprise', 'previsionnel-financier-simple', 'premiers-clients-sans-budget'), cta=CTA_BILAN)

fr('se-payer-quand-on-cree-son-entreprise',
 title='Combien se payer quand on crée son entreprise ? Méthode et exemple chiffré',
 desc='Comment fixer sa rémunération de créateur : partir de ses besoins de vie, ajouter les coûts de l\'entreprise, en déduire le chiffre d\'affaires à viser. Méthode en quatre étapes avec un exemple.',
 h1='Combien se payer quand on crée son entreprise ?',
 lead='La question se pose à l\'envers : on ne décide pas d\'un salaire en espérant que les ventes suivront. On part de ce dont on a besoin pour vivre, puis on calcule le chiffre d\'affaires qu\'il faut réaliser pour que l\'entreprise puisse le verser.',
 bullets=['Chiffre d\'affaires et rémunération ne sont pas la même chose : il faut d\'abord payer les coûts, les cotisations et les impôts.', 'Chiffre d\'affaires nécessaire = (charges fixes + rémunération visée) ÷ taux de marge sur coûts variables.', 'Si le chiffre obtenu est irréaliste, on agit sur les prix, les coûts ou le rythme de lancement.'],
 sections=[
  ('Étape 1 : chiffrer ses besoins de vie', ['Additionnez ce que vous devez payer chaque mois : logement, alimentation, transport, assurances, crédits, abonnements, un peu d\'épargne. Ajoutez les revenus déjà présents dans le foyer. La différence est le revenu que l\'activité doit vous apporter.']),
  ('Étape 2 : lister les coûts de l\'entreprise', ['Séparez les <a href="charges-fixes-charges-variables.html">charges fixes et variables</a>. Pour une micro-entreprise, les cotisations sont proportionnelles au chiffre d\'affaires : elles comptent parmi les coûts variables.']),
  ('Étape 3 : en déduire le chiffre d\'affaires à viser', ['<p class="formula">Chiffre d\'affaires nécessaire = (charges fixes + rémunération visée) ÷ taux de marge sur coûts variables</p>', 'Exemple : un prestataire de services en micro-entreprise a 800 € de charges fixes par mois et 31,4 % de coûts variables (frais, cotisations et contribution à la formation professionnelle, taux 2026 sans réduction ACRE). Son taux de marge est de 68,6 %. Pour se verser 1 600 € par mois : (800 + 1 600) ÷ 0,686, soit environ <strong>3 499 € de chiffre d\'affaires mensuel</strong>. Le détail du calcul est dans le guide du <a href="seuil-de-rentabilite.html">seuil de rentabilité</a>.']),
  ('Étape 4 : vérifier que c\'est réaliste', ['Comparez ce chiffre aux ventes que vous pouvez raisonnablement espérer, mois par mois. S\'il est trop haut, trois leviers existent : augmenter le prix, baisser les coûts, ou lancer l\'activité en parallèle d\'un emploi le temps que les ventes montent.']),
  ('Les bonnes habitudes', [['Vous verser un montant fixe chaque mois, comme un salaire, plutôt que « ce qui reste ».', 'Ne vous payer qu\'après avoir couvert les coûts, les cotisations et les impôts.', 'Si les ventes baissent, réduire d\'abord votre rémunération avant de cesser de payer fournisseurs ou impôts.', 'Revoir le montant tous les trois mois.'], 'Pour une société, la façon de se rémunérer (salaire, dividendes) change les charges et les impôts : faites-vous accompagner par un expert-comptable.']),
 ],
 faq=[('Quelle différence entre chiffre d\'affaires et revenu ?', 'Le chiffre d\'affaires est tout ce que les clients paient. Le revenu du créateur est ce qui reste après les coûts de l\'activité, les cotisations et les impôts.'),
      ('Peut-on se payer dès le premier mois ?', 'Seulement si les ventes couvrent déjà les coûts. Sinon, il faut prévoir de quoi vivre sans revenu pendant la montée en puissance : épargne, emploi conservé ou revenu du foyer.'),
      ('Pa a Pa calcule-t-il ma rémunération ?', 'Il calcule le chiffre d\'affaires nécessaire pour atteindre le revenu que vous visez et vous montre ce qui reste après cotisations. Les résultats sont des estimations à faire confirmer par un expert-comptable.')],
 related=rel('seuil', 'charges-fixes-charges-variables', 'erreurs-creation-entreprise'), cta=CTA_BILAN)

fr('charges-fixes-charges-variables',
 title='Charges fixes et charges variables : la différence, avec des exemples',
 desc='Charges fixes, charges variables : définitions, exemples, pourquoi la différence change le seuil de rentabilité, et comment agir sur chacune. Exemple chiffré d\'un créateur de bougies.',
 h1='Charges fixes et charges variables : pourquoi la différence compte',
 lead='Tous les coûts d\'une entreprise ne se comportent pas de la même façon quand les ventes montent ou baissent. Les distinguer est la première étape pour savoir combien il faut vendre.',
 bullets=['Les charges fixes ne bougent pas avec les ventes ; les charges variables suivent les ventes.', 'Réduire une charge fixe aide chaque mois ; réduire une charge variable aide à chaque vente.', 'Ces deux chiffres suffisent à calculer le seuil de rentabilité.'],
 sections=[
  ('Les charges fixes', ['Elles restent les mêmes, que vous vendiez beaucoup ou rien : loyer, assurances, abonnements, remboursement d\'un emprunt, comptable, votre propre rémunération si vous la fixez.']),
  ('Les charges variables', ['Elles augmentent quand vous vendez davantage : achat de marchandises ou de matières, emballage, livraison, commissions de plateforme, frais de paiement, et, en micro-entreprise, les cotisations proportionnelles au chiffre d\'affaires.']),
  ('Un exemple : un créateur de bougies', ['Il vend chaque bougie 20 €. Matières et emballage : 6 €. Commission de la plateforme de vente : 10 %, soit 2 €. Il lui reste <strong>12 €</strong> par bougie pour payer les charges fixes (hors cotisations, pour simplifier).', '<div class="scrollx"><table><tr><td>Prix de vente</td><td>20 €</td></tr><tr><td>Matières et emballage</td><td>− 6 €</td></tr><tr><td>Commission de plateforme (10 %)</td><td>− 2 €</td></tr><tr class="total"><td>Reste par bougie</td><td>12 €</td></tr></table></div>', 'Ses charges fixes sont de 600 € par mois (atelier partagé, assurance, abonnements). Il doit vendre 600 ÷ 12 = <strong>50 bougies par mois</strong> pour ne pas perdre d\'argent. Voir le guide <a href="seuil-de-rentabilite.html">seuil de rentabilité</a> pour la méthode complète, cotisations comprises.']),
  ('Pourquoi la différence change tout', ['Passer de 600 € à 900 € de charges fixes relève le seuil de 50 à 75 bougies. Réduire le coût des matières de 6 € à 5 € porte le reste par bougie à 13 € et abaisse le seuil à 47 bougies. Agir sur le bon type de coût évite des efforts inutiles.']),
  ('Les erreurs fréquentes', [['Compter son propre temps pour zéro : ce n\'est ni fixe ni variable, c\'est une rémunération à prévoir.', 'Classer un coût variable en fixe (ou l\'inverse) : le seuil de rentabilité devient faux.', 'Oublier les cotisations et les frais de paiement dans les coûts variables.', 'Transformer sans le voir des charges variables en charges fixes en s\'engageant sur un loyer ou un contrat long avant d\'avoir des clients.']]),
 ],
 faq=[('Le loyer est-il une charge fixe ou variable ?', 'Fixe, en général : il ne dépend pas de vos ventes. Un loyer calculé en pourcentage du chiffre d\'affaires serait, lui, variable.'),
      ('Les cotisations sociales sont-elles fixes ou variables ?', 'En micro-entreprise, elles sont proportionnelles au chiffre d\'affaires : ce sont des coûts variables. Pour d\'autres statuts, une partie peut être fixe : demandez confirmation à un expert-comptable.'),
      ('Comment baisser ses charges fixes ?', 'Local partagé ou domicile (si l\'activité le permet), matériel d\'occasion, abonnements inutiles supprimés, contrats plus courts. Voir aussi <a href="erreurs-creation-entreprise.html">les erreurs à éviter</a>.')],
 related=rel('seuil', 'prix', 'se-payer-quand-on-cree-son-entreprise'),
 cta=('Calculez votre seuil de rentabilité', 'Gratuit, sans inscription. Vos chiffres restent sur votre appareil.', 'app/#seuil', 'Ouvrir le simulateur'))

fr('tresorerie-benefice-chiffre-affaires',
 title='Chiffre d\'affaires, bénéfice et trésorerie : la différence et un exemple',
 desc='Chiffre d\'affaires, bénéfice, trésorerie : trois notions que les créateurs confondent. Un exemple chiffré montre comment une entreprise rentable peut manquer d\'argent, et comment l\'éviter.',
 h1='Chiffre d\'affaires, bénéfice et trésorerie : ne plus les confondre',
 lead='Ce sont trois chiffres différents, et les confondre explique beaucoup de difficultés de créateurs. Une entreprise peut afficher un bénéfice et ne plus pouvoir payer ses factures.',
 bullets=['Chiffre d\'affaires : tout ce que les clients paient. Bénéfice : ce qui reste après tous les coûts. Trésorerie : l\'argent disponible aujourd\'hui sur le compte.', 'Un délai de paiement ou un stock à acheter suffit à créer un trou de trésorerie, même avec un bénéfice.', 'Le plan de trésorerie mois par mois permet de voir le trou avant qu\'il arrive.'],
 sections=[
  ('Trois notions, trois questions', [['<strong>Chiffre d\'affaires :</strong> combien ai-je vendu ?', '<strong>Bénéfice :</strong> après tous les coûts et les impôts, ai-je gagné de l\'argent ?', '<strong>Trésorerie :</strong> combien ai-je sur mon compte, maintenant, pour payer ce qui arrive ?']]),
  ('Un exemple : bénéfice sur le papier, compte vide', ['Un artisan achète 3 000 € de matières, règle 800 € de loyer et vend pour 5 000 € de travaux, payables à 30 jours.', '<div class="scrollx"><table><tr><td>Vente du mois</td><td>5 000 €</td></tr><tr><td>Matières</td><td>− 3 000 €</td></tr><tr><td>Loyer</td><td>− 800 €</td></tr><tr class="total"><td>Bénéfice du mois</td><td>1 200 €</td></tr></table></div>', 'Mais le client ne paie que le mois suivant. En fin de mois, l\'artisan a encaissé 0 € et décaissé 3 800 € : sa trésorerie est de <strong>− 3 800 €</strong>. S\'il n\'a pas de réserve, il ne peut pas payer son fournisseur, alors que son activité est rentable.']),
  ('Ce qui creuse un trou de trésorerie', [['Des clients qui paient à 30 ou 60 jours alors que vous payez fournisseurs et loyer tout de suite.', 'Un stock à acheter avant de vendre.', 'Des cotisations et impôts qui tombent plusieurs mois après les ventes.', 'Des mois creux : activité saisonnière, vacances, intempéries.'], 'Le guide du <a href="calcul-bfr.html">besoin en fonds de roulement</a> montre comment chiffrer cet écart.']),
  ('Comment l\'éviter', [['Demander un acompte avant de commencer.', 'Facturer le jour même, avec une date d\'échéance claire.', 'Proposer des délais courts, et relancer dès le premier retard.', 'Négocier des délais de paiement avec les fournisseurs.', 'Garder une réserve équivalente à plusieurs mois de charges fixes.', 'Dresser un plan de trésorerie mois par mois, au moins sur douze mois.']]),
 ],
 faq=[('Une entreprise rentable peut-elle faire faillite ?', 'Oui, si elle ne peut plus payer ses dettes à temps faute de trésorerie. C\'est pourquoi on suit le bénéfice et la trésorerie ensemble.'),
      ('Comment calculer la trésorerie d\'une entreprise ?', 'Mois par mois : trésorerie de début de mois + encaissements − décaissements = trésorerie de fin de mois. Il faut compter les dates de paiement réelles, pas celles des ventes.'),
      ('Quelle réserve prévoir quand on se lance ?', 'Une règle courante est de viser plusieurs mois de charges fixes et de frais de vie. Le bon niveau dépend de votre activité et de vos délais de paiement : le bilan de faisabilité vous aide à l\'estimer.')],
 related=rel('bfr', 'previsionnel-financier-simple', 'erreurs-creation-entreprise'), cta=CTA_BILAN)

fr('premiers-clients-sans-budget',
 title='Trouver ses premiers clients sans budget : 6 méthodes concrètes',
 desc='Comment trouver ses premiers clients quand on se lance sans budget publicitaire : le test des cinq clients, le réseau, une offre claire, les marchés, les réseaux sociaux, les partenaires.',
 h1='Trouver ses premiers clients sans budget : 6 méthodes concrètes',
 lead='Au début, il n\'y a pas de budget pour la publicité, et ce n\'est pas ce qu\'il faut : les premiers clients viennent d\'abord de conversations. Voici six méthodes qui ne coûtent que du temps.',
 bullets=['Un premier client est une personne qui paie ou s\'engage, pas quelqu\'un qui trouve l\'idée « intéressante ».', 'Une offre claire (qui, quoi, combien, pour quand) se vend plus facilement qu\'une offre vague.', 'Mesurez ce qui marche avant de dépenser quoi que ce soit.'],
 sections=[
  ('1. Le test des cinq clients', ['Nommez cinq personnes ou entreprises réelles qui pourraient acheter. Demandez à chacune un petit engagement : précommande, acompte, date ferme. Si vous ne pouvez pas en nommer cinq, votre première tâche n\'est pas le produit : c\'est de parler à des clients possibles.']),
  ('2. Votre réseau proche', ['Prévenez famille, anciens collègues, voisins, associations. Ne demandez pas « tu connais quelqu\'un ? » mais « voici ce que je propose, à qui pourrait-il servir ? ». Une phrase simple suffit : « J\'aide [qui] à [résultat], à partir de [prix]. »']),
  ('3. Une offre claire et un prix affiché', ['Dites en une ligne ce que vous vendez, à qui, pour quel résultat et à quel prix. Un client hésite moins quand il sait à quoi s\'attendre. Votre prix doit couvrir votre <a href="prix-de-revient-prix-de-vente.html">prix de revient</a>.']),
  ('4. Aller là où sont déjà vos clients', ['Un marché local, un groupe de quartier ou de profession, une association, un salon. Mieux vaut un lieu où votre client vient déjà qu\'un endroit où il faut l\'attirer.']),
  ('5. Une seule vitrine en ligne', ['Une page sur un réseau social ou un numéro WhatsApp Business où l\'on voit ce que vous vendez, vos prix et des photos réelles suffit pour commencer. Choisissez un seul canal et tenez-le régulièrement plutôt que d\'en ouvrir cinq.']),
  ('6. Des partenaires', ['Des entreprises qui servent le même client sans vous concurrencer peuvent vous recommander : un photographe et un traiteur, un plombier et un architecte d\'intérieur. Proposez un échange de recommandations.']),
  ('Ce qu\'il faut mesurer', [['Combien de personnes ont entendu parler de votre offre.', 'Combien ont répondu, demandé un prix ou un devis.', 'Combien ont acheté, et comment elles vous ont connu.'], 'Quand vous savez quel canal marche gratuitement, vous pouvez envisager d\'y mettre un peu d\'argent. Pas avant.']),
 ],
 faq=[('Comment trouver des clients quand on débute et qu\'on n\'a pas d\'argent ?', 'Commencez par votre réseau, une offre claire avec un prix, les lieux où se trouvent déjà vos clients et une seule vitrine en ligne. Mesurez ce qui marche avant de payer de la publicité.'),
      ('Faut-il un site internet pour démarrer ?', 'Pas nécessairement. Une page sur un réseau social ou une messagerie professionnelle suffit souvent pour les premières ventes. Un site se justifie quand l\'activité est installée.'),
      ('Combien de clients faut-il pour démarrer ?', 'Cela dépend de votre seuil de rentabilité : combien de ventes par mois pour couvrir vos coûts. Voir <a href="seuil-de-rentabilite.html">le guide du seuil de rentabilité</a>.')],
 related=rel('erreurs-creation-entreprise', 'comment-creer-son-entreprise-etapes', 'seuil'), cta=CTA_BILAN)

fr('assurance-professionnelle-creation',
 title='Assurance professionnelle : en faut-il une quand on se lance ?',
 desc='Assurance professionnelle pour créateur d\'entreprise : ce qui est obligatoire selon l\'activité, les garanties utiles (local, stock, responsabilité civile, véhicule, prévoyance) et comment comparer les devis.',
 h1='Assurance professionnelle : en faut-il une quand on se lance ?',
 lead='Une assurance est un coût qui vous protège d\'une perte que vous ne pourriez pas payer seul. Pour certaines activités elle est obligatoire ; pour les autres, elle est vivement conseillée dès que vous avez des clients ou du matériel.',
 bullets=['Certaines activités ont une assurance obligatoire : par exemple la garantie décennale pour les professionnels du bâtiment.', 'Pour les autres, l\'assurance de responsabilité civile professionnelle est souvent la première à envisager.', 'Le coût annuel entre dans vos charges fixes : intégrez-le à vos calculs.'],
 sections=[
  ('Ce qui peut être obligatoire', ['L\'obligation dépend du métier. Les professionnels du bâtiment, par exemple, doivent souscrire une garantie décennale. D\'autres professions réglementées ont aussi des obligations. Renseignez-vous auprès de l\'organisation professionnelle ou de la chambre consulaire de votre secteur avant de commencer.']),
  ('Les garanties à connaître', [['<strong>Responsabilité civile professionnelle :</strong> couvre les dommages que vous causez à un client ou à un tiers dans le cadre de votre activité.', '<strong>Local et stock :</strong> incendie, vol, dégâts des eaux, tempête, inondation. Important dans les zones exposées aux intempéries.', '<strong>Véhicule :</strong> obligatoire si vous conduisez pour l\'activité ; vérifiez que l\'assurance auto couvre l\'usage professionnel.', '<strong>Prévoyance et perte de revenu :</strong> si vous ne pouvez plus travailler, l\'entreprise s\'arrête aussi.', '<strong>Cyber et données :</strong> utile si vous gérez des données clients ou vendez en ligne.']]),
  ('Comment choisir', [['Demandez au moins deux ou trois devis pour les mêmes garanties.', 'Lisez les exclusions et les plafonds, pas seulement le prix.', 'Déclarez l\'activité exacte : une description inexacte peut permettre à l\'assureur de refuser de payer.', 'Ajoutez le coût annuel à vos charges fixes dans vos calculs.']]),
  ('Quand souscrire', ['Avant la première vente ou le premier chantier. Une assurance souscrite après un sinistre ne le couvre pas.']),
 ],
 faq=[('L\'assurance professionnelle est-elle obligatoire pour une micro-entreprise ?', 'Cela dépend de l\'activité, pas du statut. Certaines activités ont des obligations légales ; pour les autres, la responsabilité civile professionnelle est fortement conseillée.'),
      ('Combien coûte une assurance de responsabilité civile professionnelle ?', 'Le prix dépend du métier, du chiffre d\'affaires et des garanties. Comparez plusieurs devis et intégrez le montant annuel à vos charges fixes.'),
      ('Mon assurance habitation suffit-elle si je travaille chez moi ?', 'Pas toujours : beaucoup de contrats habitation excluent l\'activité professionnelle. Demandez à votre assureur ce qui est couvert et déclarez votre activité.')],
 related=rel('comment-creer-son-entreprise-etapes', 'charges-fixes-charges-variables', 'erreurs-creation-entreprise'), cta=CTA_BILAN)

fr('previsionnel-financier-simple',
 title='Faire un prévisionnel financier simple pour créer son entreprise',
 desc='Comment faire un prévisionnel financier simple : plan de financement, compte de résultat prévisionnel et plan de trésorerie, avec un exemple chiffré et les erreurs à éviter.',
 h1='Faire un prévisionnel financier simple pour créer son entreprise',
 lead='Un prévisionnel n\'est pas un exercice pour banquier : c\'est la façon de vérifier sur le papier que le projet tient avant de dépenser. Trois tableaux suffisent pour commencer.',
 bullets=['Plan de financement : de quoi j\'ai besoin pour démarrer, et d\'où vient l\'argent.', 'Compte de résultat prévisionnel : combien je vends, combien je dépense, combien il reste.', 'Plan de trésorerie : mois par mois, combien j\'ai sur mon compte.'],
 sections=[
  ('1. Le plan de financement', ['Il met face à face les besoins du démarrage et les ressources. Les deux colonnes doivent s\'équilibrer.', '<div class="scrollx"><table><tr><th>Besoins</th><th>Montant</th></tr><tr><td>Matériel</td><td>2 000 €</td></tr><tr><td>Stock de départ</td><td>1 500 €</td></tr><tr><td>Trésorerie de départ</td><td>1 000 €</td></tr><tr class="total"><td>Total des besoins</td><td>4 500 €</td></tr></table></div>', '<div class="scrollx"><table><tr><th>Ressources</th><th>Montant</th></tr><tr><td>Apport personnel</td><td>3 000 €</td></tr><tr><td>Emprunt</td><td>1 500 €</td></tr><tr class="total"><td>Total des ressources</td><td>4 500 €</td></tr></table></div>']),
  ('2. Le compte de résultat prévisionnel', ['Pour chaque mois ou chaque année : chiffre d\'affaires prévu, moins les coûts variables, moins les charges fixes, moins les cotisations et impôts : le résultat. Partez de ventes prudentes et justifiez-les : nombre de clients, panier moyen, saisonnalité. Voir <a href="charges-fixes-charges-variables.html">charges fixes et variables</a> et <a href="seuil-de-rentabilite.html">seuil de rentabilité</a>.']),
  ('3. Le plan de trésorerie', ['Mois par mois : trésorerie de début de mois, plus les encaissements (à la date où les clients paient vraiment), moins les décaissements (à la date où vous payez vraiment). C\'est lui qui montre les trous. Voir <a href="tresorerie-benefice-chiffre-affaires.html">chiffre d\'affaires, bénéfice et trésorerie</a>.']),
  ('Testez plusieurs scénarios', ['Refaites le calcul avec des ventes inférieures de 20 %, puis avec un client important qui paie en retard. Si l\'entreprise ne résiste pas à un scénario raisonnable, il faut revoir les coûts, les prix ou le démarrage.']),
  ('Les erreurs à éviter', [['Des ventes trop optimistes, sans raison précise.', 'Oublier votre propre rémunération.', 'Ignorer les délais de paiement dans la trésorerie.', 'Oublier cotisations, impôts, assurance, comptable.', 'Ne jamais le mettre à jour : un prévisionnel se compare chaque mois à la réalité.']]),
 ],
 faq=[('Un prévisionnel est-il obligatoire pour créer une entreprise ?', 'Il n\'est pas toujours exigé, mais il l\'est pour demander un financement et il reste le meilleur moyen de vérifier son projet. Une version simple est un bon début.'),
      ('Sur combien d\'années faire un prévisionnel ?', 'Souvent trois ans pour un financement, avec le détail mois par mois la première année. Pa a Pa propose un prévisionnel sur trois ans.'),
      ('Faut-il un expert-comptable pour faire un prévisionnel ?', 'Pas obligatoirement pour une première version, mais il est utile pour le valider, surtout avant de présenter le projet à une banque.')],
 related=rel('comment-creer-son-entreprise-etapes', 'tresorerie-benefice-chiffre-affaires', 'bfr'),
 cta=('Construisez votre prévisionnel', 'Gratuit, sans inscription. Vos chiffres restent sur votre appareil.', 'app/', 'Ouvrir l\'application'))

# ------------------------------------------------------------------ EN
def en(slug, **k): G['en/' + slug] = dict(lang='en', slug=slug, **k)
CTA_EN = ('Test your business idea in a few minutes', 'Free, no sign-up. Your answers stay on your device.', '../../', 'Open the free business test')
REN = {
 'mistakes': ('Why small businesses fail: 7 mistakes to avoid', '../why-small-businesses-fail/', 'what to check before you start'),
 'start': ('How to start a business in the Caribbean', '../how-to-start-a-business-in-the-caribbean/', 'first steps, in order'),
 'costs': ('Fixed costs vs variable costs', '../fixed-costs-vs-variable-costs/', 'and how they set your break-even point'),
}
en('why-small-businesses-fail',
 title='Why small businesses fail: 7 mistakes to avoid before you start',
 desc='The seven mistakes that hurt first-time entrepreneurs most: pricing below cost, not knowing break-even, running out of cash, starting without customers. How to avoid each, with examples.',
 h1='Why small businesses fail: 7 mistakes to avoid before you start',
 lead='A business rarely stops because of one big mistake. It is usually small errors in the numbers or in the preparation, made early, that add up. The good news is that you can spot them in advance with a pencil and a few figures.',
 bullets=['The most common mistakes are about price, break-even, cash and customers.', 'Almost all of them can be checked before you spend your first dollar.', 'A ten-minute test at the end of this page shows where to start.'],
 sections=[
  ('1. Selling below the real cost', ['People forget their own time, packaging, transport, payment fees and contributions. Every sale then loses money, even when customers are happy.', '<strong>What to do:</strong> work out the full cost of one product or job before you set the price.']),
  ('2. Not knowing your break-even point', ['Without this figure you cannot tell whether your sales target covers your costs, and then your own pay. Many owners discover after six months that they needed to sell twice as much.', '<strong>What to do:</strong> calculate how many sales you need each month. See <a href="../fixed-costs-vs-variable-costs/">fixed costs vs variable costs</a>.']),
  ('3. Running out of cash', ['A business can make a profit on paper and still be unable to pay its bills: customers who pay in 30 days, stock bought in advance, rent due before the first sale.', '<strong>What to do:</strong> plan cash month by month and keep a reserve for slow months and late payers.']),
  ('4. Starting without customers', ['Building first and looking for customers later. An idea that "everyone likes" is not a sale yet.', '<strong>What to do:</strong> name five real customers, then ask each for a small commitment: a pre-order, a deposit or a firm date.']),
  ('5. Forgetting taxes and contributions', ['The money in your account is not all yours. Part goes to taxes and social contributions, sometimes months after the sale.', '<strong>What to do:</strong> set that share aside as soon as you are paid, in a separate account, and learn the due dates for your type of business.']),
  ('6. Mixing personal and business money', ['Personal spending through the business account (and the reverse) hides the real numbers.', '<strong>What to do:</strong> open a separate account for the business and pay yourself a fixed amount each month, like a salary.']),
  ('7. Growing too fast', ['Hiring, renting premises or investing before sales are steady raises your fixed costs and your break-even point. One slow month can then put the business in trouble.', '<strong>What to do:</strong> wait for several months of sales above break-even, add one thing at a time, and estimate the extra sales it must bring before you spend.']),
  ('A ten-minute test', ['Answer these five questions in writing. If you hesitate on one, start there:', ['How much does one sale really cost, all in?', 'How much must I sell each month to cover my costs and pay myself?', 'How many months can I last without income?', 'Who are my first five customers, by name?', 'What share of my takings is not mine (taxes, contributions, sales tax)?']]),
 ],
 faq=[('What is the number one reason small businesses fail?', 'Analyses of business failures keep coming back to three causes: not enough customers, not enough cash and badly calculated prices. The order varies by sector; this guide covers all three.'),
      ('Can I check my business idea before I start?', 'Yes. Work out your cost price, your break-even point and your cash needs, and test the idea with real customers. Pa a Pa Caribbean offers a free viability test with no sign-up.'),
      ('Do I need a business plan to avoid failure?', 'A long document is not essential to begin, but a simple forecast of sales, costs and cash is.')],
 related=[REN['costs'], REN['start']], cta=CTA_EN)

en('how-to-start-a-business-in-the-caribbean',
 title='How to start a business in the Caribbean: first steps, in order',
 desc='First steps to start a business in the Caribbean, in order: test the idea, work out the numbers, choose a structure, register, open a bank account, sell and track. With links to 29 country guides.',
 h1='How to start a business in the Caribbean: first steps in order',
 lead='Many first-time owners begin with the end: a logo, a website, a company name. What decides success comes earlier: will customers pay, and do the numbers work? These steps put the cheap, reversible work first.',
 bullets=['Test the idea and work out the numbers before you register or spend.', 'Every country has its own registry, tax office and social security body: the country guides list them.', 'Some activities (food, transport, health) need a licence or permit before you sell.'],
 sections=[
  ('1. Test the idea with real customers', ['Talk to five people or businesses who might buy. Ask what they pay for this today and what is missing. Look for a concrete commitment: a pre-order, a deposit, a firm date.']),
  ('2. Work out the numbers', ['Calculate the cost of one product or job, the monthly sales you need to cover costs and pay yourself, and what you must keep aside for taxes. See <a href="../fixed-costs-vs-variable-costs/">fixed costs vs variable costs</a>. The free <a href="../../">Pa a Pa Caribbean test</a> does this with your country\'s tax rules.']),
  ('3. Choose a structure', ['Most countries offer two main options: trading under a registered business name, or forming a limited company. The first is simpler and cheaper; the second can limit your personal risk but brings more paperwork and costs. Ask the company registry or an accountant before you decide.']),
  ('4. Register and get your tax numbers', ['Register the business name or company with the official registry, get a tax number from the tax office, and register for social contributions if you work for yourself or hire people. Register for sales tax if your sales reach the threshold. Ask whether your activity needs a licence or permit.']),
  ('5. Open a separate bank account', ['Run every sale and cost through it, and pay yourself a fixed amount each month. Keep a second small account for taxes.']),
  ('6. Consider insurance', ['Property and stock cover matters in hurricane areas; liability cover protects you if a customer is harmed or loses money because of you. Get two or three quotes and add the cost to your fixed costs.']),
  ('7. Sell, then track', ['Compare your sales to your break-even point every month and your cash to your forecast. Avoid the <a href="../why-small-businesses-fail/">most common mistakes</a>.']),
  ('Country guides', ['Taxes, contributions, sales tax and registration steps differ by country. Start with: <a href="../../jamaica/">Jamaica</a>, <a href="../../trinidad-and-tobago/">Trinidad and Tobago</a>, <a href="../../guyana/">Guyana</a>, <a href="../../barbados/">Barbados</a>, <a href="../../bahamas/">The Bahamas</a> or <a href="../../belize/">Belize</a>. The <a href="../../">app</a> covers 29 countries and territories.']),
 ],
 faq=[('Do I need to register my business before I sell?', 'In most places yes, and some activities also need a licence or permit. Check with the registry and the tax office of your country before you start selling.'),
      ('How much money do I need to start a business?', 'It depends on the business. List what you must pay before the first sale (equipment, stock, insurance, a cash reserve) and compare it with your savings. The free test helps you estimate it.'),
      ('Can I start while keeping my job?', 'Often yes, subject to your employment contract. It is a prudent way to test the business without losing your income.')],
 related=[REN['mistakes'], REN['costs']], cta=CTA_EN)

en('fixed-costs-vs-variable-costs',
 title='Fixed costs vs variable costs: the difference, with an example',
 desc='Fixed costs and variable costs explained with an example: how the difference sets your break-even point and which costs to cut first. A candle-maker example with the full calculation.',
 h1='Fixed costs vs variable costs: why the difference matters',
 lead='Not every cost behaves the same way when sales go up or down. Knowing which is which is the first step to knowing how much you must sell.',
 bullets=['Fixed costs do not move with sales; variable costs follow sales.', 'Cutting a fixed cost helps every month; cutting a variable cost helps every sale.', 'These two figures are enough to calculate your break-even point.'],
 sections=[
  ('Fixed costs', ['They stay the same whether you sell a lot or nothing: rent, insurance, subscriptions, loan repayments, an accountant, and your own pay if you set it.']),
  ('Variable costs', ['They rise when you sell more: materials or goods, packaging, delivery, platform commissions, payment fees and, in many cases, taxes charged on sales.']),
  ('An example: a candle maker', ['She sells each candle for 20. Materials and packaging cost 6. The online marketplace takes 10%, which is 2. That leaves <strong>12</strong> per candle to pay the fixed costs (before income tax, to keep it simple).', '<div class="scrollx"><table><tr><td>Selling price</td><td>20</td></tr><tr><td>Materials and packaging</td><td>− 6</td></tr><tr><td>Marketplace commission (10%)</td><td>− 2</td></tr><tr class="total"><td>Left per candle</td><td>12</td></tr></table></div>', 'Her fixed costs are 600 a month (shared workshop, insurance, subscriptions). She must sell 600 ÷ 12 = <strong>50 candles a month</strong> just to break even.']),
  ('Why the difference changes everything', ['Raising fixed costs from 600 to 900 lifts the break-even point from 50 to 75 candles. Cutting materials from 6 to 5 raises what is left per candle to 13 and lowers break-even to 47 candles. Acting on the right kind of cost avoids wasted effort.']),
  ('Common mistakes', [['Counting your own time as zero: it is neither fixed nor variable, it is pay you must plan for.', 'Putting a variable cost in the fixed column, or the reverse: break-even comes out wrong.', 'Forgetting payment fees and taxes on sales.', 'Signing a long lease or contract before you have customers.']]),
 ],
 faq=[('Is rent a fixed or variable cost?', 'Usually fixed: it does not depend on your sales. A rent set as a percentage of sales would be variable.'),
      ('How do I lower my fixed costs?', 'Share a workspace or work from home if your activity allows it, buy second-hand equipment, cancel unused subscriptions and avoid long contracts.'),
      ('How do I calculate my break-even point?', 'Divide your fixed costs by what is left from each sale after variable costs. The free test does it for you with your country\'s rules.')],
 related=[REN['mistakes'], REN['start']], cta=('Calculate your own break-even point', 'Free, no sign-up. Your answers stay on your device.', '../../', 'Open the free business test'))

if __name__ == '__main__':
    urls = []
    for key, g in G.items():
        k = dict(g); lang = k.pop('lang'); slug = k.pop('slug')
        urls.append(build(lang, slug, **k))
    json.dump(urls, open(os.path.join(ROOT, 'tools', 'guides_urls.json'), 'w'), indent=1)
    print(len(urls), 'pages')
