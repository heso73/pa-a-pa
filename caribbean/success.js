// Pa a Pa Caribbean: "The rules of a profitable business" (en, es, fr, nl).
// Plain-words guide for beginners, personalised with the numbers of the person's own report.
(function () {
  var LANG = (document.documentElement.lang || 'en').slice(0, 2);
  if (['en', 'es', 'fr', 'nl'].indexOf(LANG) < 0) LANG = 'en';

  var T = {
    en: {
      h: 'The rules of a profitable business',
      lead: 'A business is not profitable because it is busy. It is profitable when more money comes in than goes out, month after month, with enough left to pay you, pay the taxes and grow. These ten rules are what finance teachers and experienced owners repeat to every beginner.',
      you: 'In your plan', ask: 'Ask the coach', rulesT: 'Ten rules', doT: 'What to do',
      mistakesT: 'Seven mistakes that sink small businesses',
      monthT: 'Your 30 minutes each month', edit: 'Edit my numbers',
      takeTest: 'Take the test to see these rules with your own numbers.',
      close: 'These rules guide your decisions. They are not tax or legal advice: for your exact case, talk to the tax office, a licensed accountant or the support organisations listed under Move toward success.',
      rules: [
        ['Profit is what is left, not what comes in', 'Sales, minus what you spend to deliver what you sell, minus fixed costs, minus taxes, equals what is left for you. Many beginners celebrate their sales and discover the profit months later.', 'Write these four lines every month and look at the last one first.'],
        ['Never sell below your price floor', 'Your price floor is the cost of one product or one job, plus its share of your fixed costs, plus the taxes on it, plus a margin to grow. Copying competitors without knowing your own floor is how a business loses money while its customers are happy.', 'Work out the floor of your main product before you announce a price.', 'cost'],
        ['Know your break-even and watch it', 'Break-even is the monthly sales at which you stop losing money and your needs are covered. Below it you use up your savings. Above it, every extra sale builds profit.', 'At the end of each month, compare your real sales with your break-even.', 'breakeven'],
        ['Pay yourself a fixed amount, not whatever is in the till', 'A fixed monthly pay forces the business to earn it. Taking money at random hides losses and empties the cash you need for suppliers and taxes.', 'Choose a monthly amount you can really pay yourself, and move it to your personal account on the same day each month.'],
        ['Cash is not profit', 'You can be profitable on paper and still run out of cash, because customers pay late while you must pay suppliers, wages and rent now.', 'Ask for a deposit, invoice the same day, and call on the first day an invoice is late.', 'cash'],
        ['Keep a safety net of three to six months', 'The first months are rarely smooth. A reserve lets you decide calmly, instead of accepting any customer at any price.', 'Do not rely on the business until your savings cover the start-up costs and at least three months of living costs. Or start part-time.', 'savings'],
        ['Set taxes aside every month', 'Taxes and contributions are a cost, not a surprise. The money in your account is not all yours.', 'Move the tax amount to a separate account each month and write the due dates in your calendar.', 'tax'],
        ['Keep business and personal money apart, and keep every receipt', 'A separate account and simple records show you the real numbers, protect you with the tax office and the bank, and make a loan easier to obtain.', 'Open a business account and keep one folder per month for invoices and receipts.'],
        ['Reinvest in the right order', 'Invest only from profit that exists. First the safety net. Then what raises your sales or lowers the cost of each sale: better tools, a good website, training, stock that sells fast. Hire only when you are turning down work and the new person will bring in more than they cost.', 'Before each purchase ask: how much will this bring back, and how soon? If you cannot answer, wait.'],
        ['Measure every month, fix one thing at a time', 'A business improves when you follow a few numbers and change one thing at a time: a price, a cost, or the number of customers.', 'Each month note your sales, your costs, what is left, the cash in your account and what customers still owe you. Then run the test again with your real numbers.']
      ],
      mistakes: ['Selling below cost to win customers.', 'Mixing personal and business money.', 'Leaving taxes for later.', 'Growing before the basics work.', 'Giving credit to customers with no limit.', 'Keeping no records.', 'Waiting to be perfect before selling to a first real customer.'],
      month: ['Update your sales and your costs.', 'Compare your sales with your break-even.', 'Move the tax amount and your pay to their accounts.', 'List the unpaid invoices and call the customers.', 'Choose one thing to improve next month.'],
      p1: function (c, J) { return 'About ' + J(c.netMonthly) + ' is left for you each month. Your living needs are ' + J(c.needs) + (c.netMonthly >= c.needs ? ': covered.' : ': not covered yet.'); },
      p2: function (c, J, pct) { var r = c.sales > 0 ? Math.min(1, c.direct / c.sales) : null; return r == null ? '' : 'Goods and materials take ' + pct(r) + ' of your sales. Out of every 100 you sell, about ' + Math.round((1 - r) * 100) + ' is left to pay your fixed costs, taxes and you.'; },
      p3: function (c, J, pct, R) { return R.be ? 'Your break-even is about ' + J(R.be) + ' a month. Your plan has ' + J(c.sales) + '.' : ''; },
      p5: function (c, J) { return c.credit ? 'Waiting for payment ties up about ' + J(c.bfr) + ' of your own money.' : 'Your customers pay on the spot, which protects your cash.'; },
      p6: function (c, J) { return c.left < 0 ? 'Your savings are ' + J(-c.left) + ' short of the start-up costs.' : 'After start-up costs you keep ' + J(c.left) + ', about ' + c.runway.toFixed(1) + ' months of living costs.'; },
      p7: function (c, J) { return c.setAside > 0 ? 'Set aside about ' + J(c.setAside) + ' a month.' : ''; }
    },
    es: {
      h: 'Las reglas de un negocio rentable',
      lead: 'Un negocio no es rentable porque tenga mucho movimiento. Es rentable cuando entra más dinero del que sale, mes tras mes, y sobra lo suficiente para pagarte a ti, pagar los impuestos y crecer. Estas diez reglas son las que repiten los profesores de finanzas y los dueños con experiencia a todo principiante.',
      you: 'En tu plan', ask: 'Pregunta al coach', rulesT: 'Diez reglas', doT: 'Qué hacer',
      mistakesT: 'Siete errores que hunden a los negocios pequeños',
      monthT: 'Tus 30 minutos cada mes', edit: 'Cambiar mis cifras',
      takeTest: 'Haz la prueba para ver estas reglas con tus propias cifras.',
      close: 'Estas reglas orientan tus decisiones. No son asesoría fiscal ni legal: para tu caso concreto, habla con la administración tributaria, un contador autorizado o las organizaciones de apoyo que aparecen en Avanzar hacia el éxito.',
      rules: [
        ['La ganancia es lo que sobra, no lo que entra', 'Ventas, menos lo que gastas para entregar lo que vendes, menos los costos fijos, menos los impuestos, es igual a lo que te queda. Muchos principiantes celebran las ventas y descubren la ganancia meses después.', 'Escribe estas cuatro líneas cada mes y mira primero la última.'],
        ['Nunca vendas por debajo de tu precio mínimo', 'Tu precio mínimo es el costo de un producto o de un trabajo, más su parte de los costos fijos, más los impuestos, más un margen para crecer. Copiar a la competencia sin conocer tu propio mínimo es la forma de perder dinero mientras los clientes están contentos.', 'Calcula el mínimo de tu producto principal antes de anunciar un precio.', 'cost'],
        ['Conoce tu punto de equilibrio y vigílalo', 'El punto de equilibrio son las ventas mensuales con las que dejas de perder dinero y tus necesidades quedan cubiertas. Por debajo, gastas tus ahorros. Por encima, cada venta extra construye ganancia.', 'Al final de cada mes, compara tus ventas reales con tu punto de equilibrio.', 'breakeven'],
        ['Págate una cantidad fija, no lo que haya en la caja', 'Un pago fijo mensual obliga al negocio a ganárselo. Sacar dinero al azar esconde las pérdidas y vacía el efectivo que necesitas para proveedores e impuestos.', 'Elige una cantidad mensual que de verdad puedas pagarte y pásala a tu cuenta personal el mismo día cada mes.'],
        ['Efectivo no es ganancia', 'Puedes ser rentable en el papel y quedarte sin efectivo, porque los clientes pagan tarde mientras tú pagas ya a proveedores, salarios y alquiler.', 'Pide un anticipo, factura el mismo día y llama el primer día de retraso de una factura.', 'cash'],
        ['Ten un colchón de tres a seis meses', 'Los primeros meses rara vez son tranquilos. Una reserva te permite decidir con calma, en vez de aceptar cualquier cliente a cualquier precio.', 'No dependas del negocio hasta que tus ahorros cubran los costos de arranque y al menos tres meses de gastos de vida. O empieza a tiempo parcial.', 'savings'],
        ['Aparta los impuestos cada mes', 'Los impuestos y las cotizaciones son un costo, no una sorpresa. El dinero de tu cuenta no es todo tuyo.', 'Pasa el monto de impuestos a una cuenta aparte cada mes y anota las fechas de pago en tu calendario.', 'tax'],
        ['Separa el dinero del negocio del personal y guarda todos los recibos', 'Una cuenta aparte y registros sencillos te muestran las cifras reales, te protegen ante la administración tributaria y el banco, y facilitan obtener un préstamo.', 'Abre una cuenta del negocio y guarda una carpeta por mes con facturas y recibos.'],
        ['Reinvierte en el orden correcto', 'Invierte solo de la ganancia que existe. Primero el colchón. Luego lo que sube tus ventas o baja el costo de cada venta: mejores herramientas, un buen sitio web, formación, inventario que se vende rápido. Contrata solo cuando estés rechazando trabajo y la nueva persona vaya a traer más de lo que cuesta.', 'Antes de cada compra pregúntate: ¿cuánto me devolverá y en cuánto tiempo? Si no puedes responder, espera.'],
        ['Mide cada mes y corrige una sola cosa a la vez', 'Un negocio mejora cuando sigues pocas cifras y cambias una cosa a la vez: un precio, un costo o el número de clientes.', 'Cada mes anota tus ventas, tus costos, lo que sobra, el efectivo en tu cuenta y lo que los clientes aún te deben. Luego repite la prueba con tus cifras reales.']
      ],
      mistakes: ['Vender por debajo del costo para atraer clientes.', 'Mezclar el dinero personal con el del negocio.', 'Dejar los impuestos para después.', 'Crecer antes de que lo básico funcione.', 'Dar crédito a los clientes sin límite.', 'No llevar registros.', 'Esperar a ser perfecto antes de venderle a un primer cliente real.'],
      month: ['Actualiza tus ventas y tus costos.', 'Compara tus ventas con tu punto de equilibrio.', 'Pasa el monto de impuestos y tu pago a sus cuentas.', 'Haz la lista de facturas sin pagar y llama a los clientes.', 'Elige una cosa para mejorar el mes siguiente.'],
      p1: function (c, J) { return 'Te quedan unos ' + J(c.netMonthly) + ' al mes. Tus gastos de vida son ' + J(c.needs) + (c.netMonthly >= c.needs ? ': cubiertos.' : ': aún no cubiertos.'); },
      p2: function (c, J, pct) { var r = c.sales > 0 ? Math.min(1, c.direct / c.sales) : null; return r == null ? '' : 'Los productos y materiales se llevan el ' + pct(r) + ' de tus ventas. De cada 100 que vendes, unos ' + Math.round((1 - r) * 100) + ' quedan para pagar tus costos fijos, tus impuestos y a ti.'; },
      p3: function (c, J, pct, R) { return R.be ? 'Tu punto de equilibrio es de unos ' + J(R.be) + ' al mes. Tu plan tiene ' + J(c.sales) + '.' : ''; },
      p5: function (c, J) { return c.credit ? 'Esperar el pago inmoviliza unos ' + J(c.bfr) + ' de tu propio dinero.' : 'Tus clientes pagan al momento, lo que protege tu efectivo.'; },
      p6: function (c, J) { return c.left < 0 ? 'A tus ahorros les faltan ' + J(-c.left) + ' para cubrir el arranque.' : 'Después del arranque te quedan ' + J(c.left) + ', unos ' + c.runway.toFixed(1) + ' meses de gastos de vida.'; },
      p7: function (c, J) { return c.setAside > 0 ? 'Aparta unos ' + J(c.setAside) + ' al mes.' : ''; }
    },
    fr: {
      h: 'Les règles d’une entreprise rentable',
      lead: 'Une entreprise n’est pas rentable parce qu’elle est occupée. Elle l’est quand il entre plus d’argent qu’il n’en sort, mois après mois, avec assez de reste pour vous payer, payer les impôts et grandir. Ces dix règles sont celles que les professeurs de finance et les chefs d’entreprise expérimentés répètent à tout débutant.',
      you: 'Dans votre plan', ask: 'Demander au coach', rulesT: 'Dix règles', doT: 'Que faire',
      mistakesT: 'Sept erreurs qui font couler les petites entreprises',
      monthT: 'Vos 30 minutes chaque mois', edit: 'Modifier mes chiffres',
      takeTest: 'Faites le test pour voir ces règles avec vos propres chiffres.',
      close: 'Ces règles guident vos décisions. Ce ne sont pas des conseils fiscaux ou juridiques : pour votre cas précis, parlez à l’administration fiscale, à un comptable agréé ou aux organismes d’appui listés dans Avancer vers la réussite.',
      rules: [
        ['Le bénéfice, c’est ce qui reste, pas ce qui rentre', 'Les ventes, moins ce que vous dépensez pour livrer ce que vous vendez, moins les charges fixes, moins les impôts, égalent ce qui vous reste. Beaucoup de débutants fêtent leurs ventes et découvrent le bénéfice des mois plus tard.', 'Écrivez ces quatre lignes chaque mois et regardez d’abord la dernière.'],
        ['Ne vendez jamais sous votre prix plancher', 'Votre prix plancher, c’est le coût d’un produit ou d’une prestation, plus sa part de charges fixes, plus les impôts qui s’y rattachent, plus une marge pour grandir. Copier les concurrents sans connaître votre propre plancher, c’est perdre de l’argent alors que les clients sont contents.', 'Calculez le plancher de votre produit principal avant d’annoncer un prix.', 'cost'],
        ['Connaissez votre seuil de rentabilité et surveillez-le', 'Le seuil de rentabilité, ce sont les ventes mensuelles à partir desquelles vous ne perdez plus d’argent et vos besoins sont couverts. En dessous, vous entamez vos économies. Au-dessus, chaque vente en plus construit du bénéfice.', 'À la fin de chaque mois, comparez vos ventes réelles à votre seuil de rentabilité.', 'breakeven'],
        ['Payez-vous une somme fixe, pas ce qu’il y a dans la caisse', 'Une rémunération mensuelle fixe oblige l’entreprise à la gagner. Se servir au hasard cache les pertes et vide la trésorerie dont vous avez besoin pour les fournisseurs et les impôts.', 'Choisissez un montant mensuel que vous pouvez vraiment vous payer et versez-le sur votre compte personnel le même jour chaque mois.'],
        ['La trésorerie n’est pas le bénéfice', 'Vous pouvez être rentable sur le papier et manquer d’argent, parce que les clients paient tard alors que vous payez tout de suite fournisseurs, salaires et loyer.', 'Demandez un acompte, facturez le jour même et appelez dès le premier jour de retard d’une facture.', 'cash'],
        ['Gardez un matelas de trois à six mois', 'Les premiers mois sont rarement tranquilles. Une réserve vous permet de décider calmement, au lieu d’accepter n’importe quel client à n’importe quel prix.', 'Ne comptez pas sur l’entreprise tant que vos économies ne couvrent pas les frais de démarrage et au moins trois mois de dépenses de vie. Ou démarrez à temps partiel.', 'savings'],
        ['Mettez les impôts de côté chaque mois', 'Les impôts et cotisations sont un coût, pas une surprise. L’argent sur votre compte n’est pas entièrement à vous.', 'Virez le montant des impôts sur un compte séparé chaque mois et notez les échéances dans votre agenda.', 'tax'],
        ['Séparez l’argent de l’entreprise et le vôtre, et gardez tous les justificatifs', 'Un compte séparé et des écritures simples vous montrent les vrais chiffres, vous protègent face à l’administration fiscale et à la banque, et facilitent l’obtention d’un prêt.', 'Ouvrez un compte professionnel et gardez un dossier par mois pour les factures et les reçus.'],
        ['Réinvestissez dans le bon ordre', 'N’investissez que sur du bénéfice qui existe. D’abord le matelas de sécurité. Ensuite ce qui augmente vos ventes ou baisse le coût de chaque vente : de meilleurs outils, un bon site web, une formation, un stock qui se vend vite. N’embauchez que lorsque vous refusez du travail et que la nouvelle personne rapportera plus qu’elle ne coûte.', 'Avant chaque achat, demandez-vous : combien cela rapportera-t-il, et en combien de temps ? Si vous ne pouvez pas répondre, attendez.'],
        ['Mesurez chaque mois, corrigez une seule chose à la fois', 'Une entreprise s’améliore quand vous suivez quelques chiffres et changez une chose à la fois : un prix, un coût ou le nombre de clients.', 'Chaque mois, notez vos ventes, vos coûts, ce qui reste, la trésorerie sur votre compte et ce que les clients vous doivent encore. Puis refaites le test avec vos chiffres réels.']
      ],
      mistakes: ['Vendre sous le coût pour attirer des clients.', 'Mélanger l’argent personnel et celui de l’entreprise.', 'Remettre les impôts à plus tard.', 'Grandir avant que les bases fonctionnent.', 'Faire crédit aux clients sans limite.', 'Ne tenir aucun registre.', 'Attendre d’être parfait avant de vendre à un premier vrai client.'],
      month: ['Mettez à jour vos ventes et vos coûts.', 'Comparez vos ventes à votre seuil de rentabilité.', 'Virez le montant des impôts et votre rémunération sur leurs comptes.', 'Listez les factures impayées et appelez les clients.', 'Choisissez une chose à améliorer le mois prochain.'],
      p1: function (c, J) { return 'Il vous reste environ ' + J(c.netMonthly) + ' par mois. Vos dépenses de vie sont de ' + J(c.needs) + (c.netMonthly >= c.needs ? ' : couvertes.' : ' : pas encore couvertes.'); },
      p2: function (c, J, pct) { var r = c.sales > 0 ? Math.min(1, c.direct / c.sales) : null; return r == null ? '' : 'Les marchandises et matières prennent ' + pct(r) + ' de vos ventes. Sur 100 vendus, il reste environ ' + Math.round((1 - r) * 100) + ' pour payer vos charges fixes, vos impôts et vous.'; },
      p3: function (c, J, pct, R) { return R.be ? 'Votre seuil de rentabilité est d’environ ' + J(R.be) + ' par mois. Votre plan prévoit ' + J(c.sales) + '.' : ''; },
      p5: function (c, J) { return c.credit ? 'Attendre les paiements immobilise environ ' + J(c.bfr) + ' de votre propre argent.' : 'Vos clients paient comptant, ce qui protège votre trésorerie.'; },
      p6: function (c, J) { return c.left < 0 ? 'Il manque ' + J(-c.left) + ' à vos économies pour couvrir le démarrage.' : 'Après le démarrage il vous reste ' + J(c.left) + ', soit environ ' + c.runway.toFixed(1) + ' mois de dépenses de vie.'; },
      p7: function (c, J) { return c.setAside > 0 ? 'Mettez de côté environ ' + J(c.setAside) + ' par mois.' : ''; }
    },
    nl: {
      h: 'De regels van een winstgevend bedrijf',
      lead: 'Een bedrijf is niet winstgevend omdat het druk is. Het is winstgevend als er elke maand meer geld binnenkomt dan eruit gaat, met genoeg over om jezelf te betalen, de belastingen te betalen en te groeien. Deze tien regels herhalen docenten financiën en ervaren ondernemers aan elke beginner.',
      you: 'In jouw plan', ask: 'Vraag het de coach', rulesT: 'Tien regels', doT: 'Wat te doen',
      mistakesT: 'Zeven fouten die kleine bedrijven laten zinken',
      monthT: 'Jouw 30 minuten per maand', edit: 'Mijn cijfers aanpassen',
      takeTest: 'Doe de test om deze regels met je eigen cijfers te zien.',
      close: 'Deze regels helpen bij je beslissingen. Het is geen belasting- of juridisch advies: bespreek je eigen situatie met de belastingdienst, een erkende accountant of de steunorganisaties onder Op weg naar succes.',
      rules: [
        ['Winst is wat overblijft, niet wat binnenkomt', 'Omzet, min wat je uitgeeft om te leveren wat je verkoopt, min vaste kosten, min belastingen, is wat er voor jou overblijft. Veel beginners vieren hun omzet en ontdekken de winst maanden later.', 'Schrijf deze vier regels elke maand op en kijk eerst naar de laatste.'],
        ['Verkoop nooit onder je minimumprijs', 'Je minimumprijs is de kostprijs van één product of klus, plus het aandeel in je vaste kosten, plus de belastingen erop, plus een marge om te groeien. Concurrenten kopiëren zonder je eigen minimum te kennen is hoe een bedrijf geld verliest terwijl de klanten tevreden zijn.', 'Reken het minimum van je belangrijkste product uit voordat je een prijs noemt.', 'cost'],
        ['Ken je break-evenpunt en houd het in de gaten', 'Break-even is de maandomzet waarbij je geen geld meer verliest en je behoeften gedekt zijn. Eronder teer je in op je spaargeld. Erboven bouwt elke extra verkoop winst op.', 'Vergelijk aan het eind van elke maand je echte omzet met je break-evenpunt.', 'breakeven'],
        ['Betaal jezelf een vast bedrag, niet wat er in de kassa zit', 'Een vast maandloon dwingt het bedrijf om het te verdienen. Willekeurig geld opnemen verbergt verliezen en leegt het geld dat je nodig hebt voor leveranciers en belastingen.', 'Kies een maandbedrag dat je echt kunt betalen en boek het elke maand op dezelfde dag over naar je privérekening.'],
        ['Liquiditeit is geen winst', 'Je kunt op papier winstgevend zijn en toch zonder geld zitten, omdat klanten laat betalen terwijl jij leveranciers, lonen en huur nu moet betalen.', 'Vraag een aanbetaling, factureer dezelfde dag en bel op de eerste dag dat een factuur te laat is.', 'cash'],
        ['Houd een buffer van drie tot zes maanden aan', 'De eerste maanden verlopen zelden rustig. Met een reserve beslis je kalm, in plaats van elke klant tegen elke prijs te accepteren.', 'Reken pas op het bedrijf als je spaargeld de opstartkosten en minstens drie maanden levenskosten dekt. Of begin parttime.', 'savings'],
        ['Zet elke maand belastingen opzij', 'Belastingen en premies zijn een kostenpost, geen verrassing. Het geld op je rekening is niet allemaal van jou.', 'Boek het belastingbedrag elke maand over naar een aparte rekening en zet de betaaldata in je agenda.', 'tax'],
        ['Houd zakelijk en privégeld gescheiden en bewaar elk bonnetje', 'Een aparte rekening en een eenvoudige administratie laten de echte cijfers zien, beschermen je bij de belastingdienst en de bank en maken een lening makkelijker te krijgen.', 'Open een zakelijke rekening en bewaar per maand één map met facturen en bonnetjes.'],
        ['Herinvesteer in de juiste volgorde', 'Investeer alleen uit winst die er is. Eerst de buffer. Dan wat je omzet verhoogt of de kosten per verkoop verlaagt: beter gereedschap, een goede website, opleiding, voorraad die snel verkoopt. Neem alleen iemand aan als je werk moet weigeren en de nieuwe persoon meer oplevert dan hij kost.', 'Vraag je voor elke aankoop af: hoeveel levert dit op en hoe snel? Kun je dat niet beantwoorden, wacht dan.'],
        ['Meet elke maand en verbeter één ding tegelijk', 'Een bedrijf verbetert als je een paar cijfers volgt en één ding tegelijk verandert: een prijs, een kost of het aantal klanten.', 'Noteer elke maand je omzet, je kosten, wat overblijft, het geld op je rekening en wat klanten nog verschuldigd zijn. Doe daarna de test opnieuw met je echte cijfers.']
      ],
      mistakes: ['Onder de kostprijs verkopen om klanten te winnen.', 'Privégeld en zakelijk geld door elkaar halen.', 'Belastingen uitstellen.', 'Groeien voordat de basis werkt.', 'Klanten onbeperkt krediet geven.', 'Geen administratie bijhouden.', 'Wachten tot alles perfect is voordat je aan een eerste echte klant verkoopt.'],
      month: ['Werk je omzet en je kosten bij.', 'Vergelijk je omzet met je break-evenpunt.', 'Boek het belastingbedrag en je loon over naar hun rekeningen.', 'Maak een lijst van onbetaalde facturen en bel de klanten.', 'Kies één ding om volgende maand te verbeteren.'],
      p1: function (c, J) { return 'Er blijft ongeveer ' + J(c.netMonthly) + ' per maand voor je over. Je levenskosten zijn ' + J(c.needs) + (c.netMonthly >= c.needs ? ': gedekt.' : ': nog niet gedekt.'); },
      p2: function (c, J, pct) { var r = c.sales > 0 ? Math.min(1, c.direct / c.sales) : null; return r == null ? '' : 'Goederen en materialen nemen ' + pct(r) + ' van je omzet. Van elke 100 die je verkoopt blijft ongeveer ' + Math.round((1 - r) * 100) + ' over voor je vaste kosten, belastingen en jezelf.'; },
      p3: function (c, J, pct, R) { return R.be ? 'Je break-evenpunt ligt rond ' + J(R.be) + ' per maand. Je plan heeft ' + J(c.sales) + '.' : ''; },
      p5: function (c, J) { return c.credit ? 'Wachten op betaling legt ongeveer ' + J(c.bfr) + ' van je eigen geld vast.' : 'Je klanten betalen direct, wat je liquiditeit beschermt.'; },
      p6: function (c, J) { return c.left < 0 ? 'Je spaargeld komt ' + J(-c.left) + ' tekort voor de opstart.' : 'Na de opstart houd je ' + J(c.left) + ' over, ongeveer ' + c.runway.toFixed(1) + ' maanden levenskosten.'; },
      p7: function (c, J) { return c.setAside > 0 ? 'Zet ongeveer ' + J(c.setAside) + ' per maand opzij.' : ''; }
    }
  }[LANG];

  var PERSONAL = { 0: 'p1', 1: 'p2', 2: 'p3', 4: 'p5', 5: 'p6', 6: 'p7' };

  window.PAPSuccess = {
    render: function (x) {
      var R = x.R, c = R ? R.c : null, J = x.J, pct = x.pct, esc = x.esc, TOPICLABEL = x.topicLabel || function (id) { return id; };
      var rules = T.rules.map(function (r, i) {
        var extra = '';
        if (c && PERSONAL[i]) {
          try { var t = T[PERSONAL[i]](c, J, pct, R); if (t) extra = '<p class="note"><b>' + esc(T.you) + ':</b> ' + esc(t) + '</p>'; } catch (e) {}
        }
        var coach = r[3] ? '<p class="small" style="margin:6px 0 0"><a href="#/coach/' + r[3] + '">' + esc(T.ask) + ': ' + esc(TOPICLABEL(r[3])) + '</a></p>' : '';
        return '<section class="card" style="margin-top:12px"><h3 style="margin:0 0 6px"><span style="opacity:.55">' + (i + 1) + '.</span> ' + esc(r[0]) + '</h3><p style="margin:0 0 8px">' + esc(r[1]) + '</p><p style="margin:0 0 8px"><b>' + esc(T.doT) + ' :</b> ' + esc(r[2]) + '</p>' + extra + coach + '</section>';
      }).join('');
      var li = function (a) { return '<ul style="margin:6px 0 0;padding-left:20px">' + a.map(function (s) { return '<li style="margin:4px 0">' + esc(s) + '</li>'; }).join('') + '</ul>'; };
      var head = '<h1>' + esc(T.h) + '</h1><p class="lead">' + esc(T.lead) + '</p>' + (c ? '' : '<p class="note"><a href="#/test">' + esc(T.takeTest) + '</a></p>');
      return head + '<h2 style="font-size:18px;margin:22px 0 0">' + esc(T.rulesT) + '</h2>' + rules +
        '<section class="card" style="margin-top:16px"><h3 style="margin:0 0 4px">' + esc(T.mistakesT) + '</h3>' + li(T.mistakes) + '</section>' +
        '<section class="card" style="margin-top:12px"><h3 style="margin:0 0 4px">' + esc(T.monthT) + '</h3><ol style="margin:6px 0 0;padding-left:20px">' + T.month.map(function (s) { return '<li style="margin:4px 0">' + esc(s) + '</li>'; }).join('') + '</ol></section>' +
        '<div class="btnrow" style="margin-top:16px"><a class="btn" href="#/test">' + esc(T.edit) + '</a></div><p class="muted small" style="margin-top:14px">' + esc(T.close) + '</p>';
    },
    label: function () { return T.h; }
  };
})();
