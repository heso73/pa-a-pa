# -*- coding: utf-8 -*-
"""4 páginas ES más para la República Dominicana : doble sueldo (regalía pascual), RNC persona física,
costo de crear una empresa y régimen RST.
Uso (desde la raíz del repo) : python3 tools/build_do_pages2.py
Genera solo estas 4 páginas en caribbean/es/guias/. Idempotente para sitemap.xml, llms.txt y la página del país."""
import os, sys, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_guides as B

B.DATE = '2026-11-18'
ROOT = B.ROOT
B.G = {}

CHK_REG = ('Cifras verificadas el 18 de noviembre de 2026 con el Código de Trabajo (artículos 219 y 220), la Ley 30-26 (artículo 33) y la resolución CNS-01-2025 del Comité Nacional de Salarios. '
           'Confirma el monto con el Ministerio de Trabajo o con tu contador antes de pagar.')
CHK_RNC = ('Información verificada el 18 de noviembre de 2026 con las guías del contribuyente de la DGII. Los requisitos pueden cambiar: confirma en dgii.gov.do antes de iniciar el trámite.')
CHK_COST = ('Información verificada el 18 de noviembre de 2026 con la guía de incorporación de sociedades de la DGII. Los honorarios del abogado, del notario y de la Cámara de Comercio varían: pide el precio antes de contratar.')
CHK_RST = ('Cifras verificadas el 18 de noviembre de 2026 con la DGII (resolución DDG-AR1-2026-00001) y con la Ley 30-26. El reglamento de la reforma aún está pendiente: confirma con la DGII antes de decidir.')
CTA_DO = ('Prueba tu proyecto con las reglas de República Dominicana', 'Gratis y sin registro. Escribe tus ventas y tus costos y obtén tus impuestos y lo que te queda.', '../../?c=DO#/test', 'Probar mi proyecto en República Dominicana')

def money(n, d=0):
    return 'RD$' + (format(int(n + 0.5), ',') if d == 0 else format(round(n + 1e-9, d), ',.%df' % d))

CALC_CSS = ('<style>.calc{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:18px 20px;margin:20px 0}'
            '.calc label{display:block;font-weight:600;margin:12px 0 4px}'
            '.calc input,.calc select{width:100%;font:inherit;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink)}'
            '.calc table{width:100%;border-collapse:collapse;margin-top:14px}.calc td{padding:7px 4px;border-bottom:1px solid var(--line)}'
            '.calc td:last-child{text-align:right;font-variant-numeric:tabular-nums}.calc tr.sum td{font-weight:700;border-bottom:0}'
            '.calc .note{color:var(--muted);font-size:.92rem;margin-top:10px}</style>')
FMT = ("function m(n,d){return 'RD$'+n.toLocaleString('en-US',{minimumFractionDigits:d||0,maximumFractionDigits:d||0})}"
       "function num(id){var v=parseFloat(document.getElementById(id).value);return isNaN(v)||v<0?0:v}")

MW = [('Grande', 29988.00), ('Mediana', 27489.60), ('Pequeña', 18421.20), ('Micro', 16993.20)]

# ----------------------------------------------------------------- calculadoras
CALC_REG = CALC_CSS + '''<div class="calc" id="calc-reg"><strong>Calculadora: doble sueldo (salario de Navidad)</strong>
<label for="r-sal">Salario ordinario mensual (RD$)</label><input id="r-sal" type="number" inputmode="numeric" min="0" step="500" value="35000">
<label for="r-mes">Meses trabajados en el año (1 a 12)</label><input id="r-mes" type="number" inputmode="numeric" min="1" max="12" step="1" value="12">
<label for="r-cat">Tamaño de la empresa (para el tope legal)</label><select id="r-cat"><option value="29988">Grande: salario mínimo RD$29,988.00</option><option value="27489.6">Mediana: RD$27,489.60</option><option value="18421.2">Pequeña: RD$18,421.20</option><option value="16993.2">Micro: RD$16,993.20</option></select>
<table><tr><td>Doble sueldo (salario del año ÷ 12)</td><td id="r-reg"></td></tr><tr><td>Tope obligatorio (5 salarios mínimos)</td><td id="r-cap"></td></tr><tr class="sum"><td>ISR sobre el doble sueldo</td><td>RD$0 (exento)</td></tr></table>
<p class="note" id="r-msg"></p>
<p class="note">Con salario fijo. No incluye horas extra ni participación en los beneficios. Estimación de orientación, no asesoría laboral.</p></div>
<script>(function(){''' + FMT + '''function run(){var s=num('r-sal'),k=Math.min(Math.max(Math.round(num('r-mes')),0),12),c=parseFloat(document.getElementById('r-cat').value)*5,r=s*k/12;
document.getElementById('r-reg').textContent=m(r,2);document.getElementById('r-cap').textContent=m(c,2);
document.getElementById('r-msg').textContent=r>c?'Tu monto pasa el tope de 5 salarios mínimos: ese tope es lo mínimo que el empleador debe pagar por ley, y puede pagar más. El ISR sigue exento.':'Este monto está dentro del tope legal.'}
['r-sal','r-mes','r-cat'].forEach(function(i){document.getElementById(i).addEventListener('input',run)});run()})();</script>'''

CALC_COST = CALC_CSS + '''<div class="calc" id="calc-cost"><strong>Calculadora: impuesto de constitución (1 %)</strong>
<label for="c-cap">Capital social autorizado (RD$)</label><input id="c-cap" type="number" inputmode="numeric" min="0" step="10000" value="100000">
<table><tr class="sum"><td>Impuesto de constitución a la DGII (1 %)</td><td id="c-tax"></td></tr></table>
<p class="note">Es solo el impuesto. El Registro Mercantil, el abogado y el notario se pagan aparte y varían. Estimación de orientación.</p></div>
<script>(function(){''' + FMT + '''function run(){document.getElementById('c-tax').textContent=m(num('c-cap')*0.01,2)}
document.getElementById('c-cap').addEventListener('input',run);run()})();</script>'''

CALC_RST = CALC_CSS + '''<div class="calc" id="calc-rst"><strong>Calculadora: ¿cabes en el RST por ingresos?</strong>
<label for="x-inc">Tus ingresos brutos anuales (RD$)</label><input id="x-inc" type="number" inputmode="numeric" min="0" step="100000" value="3000000">
<label for="x-kind">Tu actividad</label><select id="x-kind"><option value="15000000">Profesional o oficio independiente (persona física)</option><option value="30000000">Empresa o negocio de servicios o producción</option></select>
<table><tr><td>Límite en 2026 (RST por ingresos)</td><td id="x-l26"></td></tr><tr><td>¿Cabes en 2026?</td><td id="x-ok26"></td></tr><tr><td>Límite desde 2027 (Ley 30-26)</td><td id="x-l27"></td></tr><tr class="sum"><td>¿Cabes desde 2027?</td><td id="x-ok27"></td></tr></table>
<p class="note">Solo compara tus ingresos con el límite. Para entrar al RST debes cumplir también los otros requisitos y tener la aprobación de la DGII. Los límites se ajustan por inflación.</p></div>
<script>(function(){''' + FMT + '''function run(){var i=num('x-inc'),l27=parseFloat(document.getElementById('x-kind').value);
document.getElementById('x-l26').textContent=m(12068181.09,2);document.getElementById('x-ok26').textContent=i<=12068181.09?'Sí':'No';
document.getElementById('x-l27').textContent=m(l27);document.getElementById('x-ok27').textContent=i<=l27?'Sí':'No'}
['x-inc','x-kind'].forEach(function(k){document.getElementById(k).addEventListener('input',run)});run()})();</script>'''

# ----------------------------------------------------------------- tablas
def reg_table():
    sal = 25000
    rows = ''.join('<tr><td>%d</td><td>%s</td></tr>' % (k, money(sal * k / 12, 2)) for k in (12, 10, 8, 6, 3))
    return ('<div class="scrollx"><table><tr><th>Meses trabajados en el año</th><th>Doble sueldo con salario de RD$25,000</th></tr>%s</table></div>' % rows)

def cap_table():
    rows = ''.join('<tr><td>%s</td><td>%s</td><td>%s</td></tr>' % (n, money(v, 2), money(v * 5, 2)) for n, v in MW)
    return ('<div class="scrollx"><table><tr><th>Tamaño de la empresa</th><th>Salario mínimo mensual</th><th>Tope obligatorio (×5)</th></tr>%s</table></div>' % rows)

# ----------------------------------------------------------------- enlaces
R_MW = ('Salario mínimo en República Dominicana 2026', '../salario-minimo-republica-dominicana-2026/', 'cuánto es por tamaño de empresa y cuánto queda neto')
R_ISR = ('Calculadora de ISR en República Dominicana', '../calculadora-isr-republica-dominicana/', 'impuesto sobre la renta y salario neto')
R_ITBIS = ('Calculadora de ITBIS en República Dominicana', '../calculadora-itbis-republica-dominicana/', 'sumar o quitar el 18 %')
R_TSS = ('Calculadora de aportes a la TSS', '../calculadora-tss-republica-dominicana/', 'seguro de salud y pensiones, empleado y empleador')
R_HOME = ('Crear un negocio en República Dominicana', '../../republica-dominicana/', 'impuestos, registro y pasos')
R_REG = ('Calculadora del doble sueldo', '../calculadora-doble-sueldo-regalia-pascual-republica-dominicana/', 'cuánto toca y cuándo se paga')
R_RNC = ('Cómo sacar el RNC como persona física', '../como-sacar-rnc-persona-fisica-republica-dominicana/', 'el paso que activa tu negocio ante la DGII')
R_COST = ('Cuánto cuesta crear una empresa', '../cuanto-cuesta-crear-una-empresa-republica-dominicana/', 'impuesto de constitución y otros gastos')
R_RST = ('Régimen Simplificado de Tributación (RST)', '../regimen-simplificado-de-tributacion-rst-republica-dominicana/', 'límites, requisitos y cómo inscribirte')

P = []
def page(slug, **k): P.append((slug, k))

page('calculadora-doble-sueldo-regalia-pascual-republica-dominicana',
     title='Calculadora del doble sueldo 2026 en República Dominicana (regalía pascual)',
     desc='Calcula tu doble sueldo (salario de Navidad) de 2026 en República Dominicana: salario del año entre 12, plazo del 20 de diciembre, tope de cinco salarios mínimos y exención del ISR.',
     h1='Calculadora del doble sueldo (regalía pascual) en República Dominicana',
     lead='El doble sueldo, o regalía pascual, es el salario de Navidad que el empleador debe pagar cada año. Escribe tu salario y los meses trabajados para saber cuánto te toca.',
     bullets=['Se calcula con la suma de los salarios ordinarios del año entre 12. Con un año completo y salario fijo, es un mes de sueldo.',
              'Se paga a más tardar el 20 de diciembre. En 2026 esa fecha cae en domingo, así que conviene pagarlo antes.',
              'Si trabajaste menos de un año, se paga en proporción al tiempo trabajado. No incluye horas extra ni participación en los beneficios.',
              'Está exento del ISR según el artículo 33 de la Ley 30-26, aunque supere cinco salarios mínimos.'],
     sections=[('La calculadora', [CALC_REG]),
               ('Cuánto toca según los meses trabajados', [reg_table(), 'Ejemplo con un salario fijo de RD$25,000 al mes: el doble sueldo es el salario del año entre 12, en proporción a los meses trabajados.']),
               ('El tope de cinco salarios mínimos', ['El Código de Trabajo fija el doble sueldo obligatorio hasta un máximo de cinco salarios mínimos. El empleador puede pagar más si así lo decide, y en ese caso el monto extra también queda exento del ISR.',
                                                     cap_table(),
                                                     'Los salarios mínimos son los del sector privado no sectorizado vigentes desde el 1 de febrero de 2026. ' + CHK_REG]),
               ('Qué debes saber como empleador', [['Fecha límite: el 20 de diciembre, aunque el contrato haya terminado antes.', 'Si un empleado trabajó solo una parte del año, calcula la proporción con los meses trabajados.', 'No mezcles el doble sueldo con la participación en los beneficios: son pagos distintos.', 'Apártalo desde ahora en tu flujo de caja: es un mes de sueldo adicional por empleado.']])],
     faq=[('¿Cuándo se paga el doble sueldo en 2026?', 'A más tardar el 20 de diciembre, según el artículo 220 del Código de Trabajo. En 2026 es domingo, y el empleador puede pagarlo antes.'),
          ('¿Cómo se calcula el doble sueldo?', 'Los salarios ordinarios del año entre 12. No entran las horas extra ni la participación en los beneficios.'),
          ('¿Paga ISR el doble sueldo?', 'No. El artículo 33 de la Ley 30-26 lo deja exento del impuesto sobre la renta aunque supere cinco salarios mínimos.'),
          ('¿Cuál es el tope?', 'El monto obligatorio no puede pasar de cinco salarios mínimos, pero el empleador puede pagar una suma mayor.'),
          ('¿Y si trabajé menos de un año?', 'Se paga en proporción al tiempo trabajado en el año.'),
          ('¿Me toca si renuncio o me despiden antes de diciembre?', 'Sí. El plazo del 20 de diciembre aplica aunque el contrato haya terminado antes, y se paga la parte proporcional.')],
     related=[R_MW, R_ISR, R_TSS], cta=CTA_DO)

page('como-sacar-rnc-persona-fisica-republica-dominicana',
     title='Cómo sacar el RNC como persona física en República Dominicana (2026): requisitos y pasos',
     desc='Guía para sacar el RNC como persona física en República Dominicana: es gratis, qué documentos pide la DGII (cédula y formulario RC-01), cómo hacerlo en la Oficina Virtual y qué hacer después.',
     h1='Cómo sacar el RNC como persona física en República Dominicana',
     lead='El RNC es el número con el que la DGII te reconoce como contribuyente. Sin él no puedes emitir facturas con comprobante fiscal. Esta guía resume los pasos para una persona física que empieza un negocio.',
     bullets=['Sacar el RNC es gratis, para personas físicas y jurídicas.',
              'Una persona física necesita su cédula vigente y el formulario RC-01 (declaración jurada de registro) llenado y firmado, con el código y la descripción de su actividad.',
              'La DGII indica que, antes de inscribirte, la persona física debe solicitar el Certificado de Registro Mercantil en la Cámara de Comercio de su provincia.',
              'Con el RNC activo puedes pedir tus comprobantes fiscales (NCF) y la clave de la Oficina Virtual.'],
     sections=[('Qué es el RNC y quién lo necesita', ['El RNC (Registro Nacional de Contribuyentes) es un código único que la DGII asigna a cada persona física o jurídica con actividad económica. Lo necesitas si vendes productos o prestas servicios de forma habitual y quieres facturar con comprobante fiscal.']),
               ('Pasos para una persona física', [['<strong>1. Define tu actividad.</strong> Busca el código de tu actividad económica en la Biblioteca Virtual de la DGII: lo vas a escribir en el formulario.',
                                                  '<strong>2. Registro Mercantil.</strong> Según la DGII, antes de inscribirte debes obtener el certificado en la Cámara de Comercio y Producción de tu provincia. Pide el precio vigente a la Cámara.',
                                                  '<strong>3. Solicita el RNC.</strong> Entra a la Oficina Virtual de la DGII, crea tu usuario si no tienes y pide la inscripción al RNC como persona física. También puedes ir a una oficina con tu cédula y el RC-01.',
                                                  '<strong>4. Espera la respuesta.</strong> Es un trámite rápido en línea. Si hay observaciones, la DGII te las comunica.',
                                                  '<strong>5. Pide tu clave y tus NCF.</strong> Con el RNC activo solicitas la clave de la Oficina Virtual y los comprobantes fiscales para facturar.']]),
               ('Después del RNC', [['Declara y paga tus impuestos a tiempo: ITBIS cada mes si vendes bienes o servicios gravados y el ISR cada año. Mira la <a href="../calculadora-itbis-republica-dominicana/">calculadora de ITBIS</a>.',
                                    'Si vas a tener empleados, regístrate también en la TSS. La TSS pide un RNC activo con la actividad actualizada. Mira la <a href="../calculadora-tss-republica-dominicana/">calculadora de aportes a la TSS</a>.',
                                    'Si tus ingresos son moderados, evalúa el <a href="../regimen-simplificado-de-tributacion-rst-republica-dominicana/">Régimen Simplificado de Tributación (RST)</a>.'],
                                   CHK_RNC])],
     faq=[('¿Cuánto cuesta sacar el RNC?', 'Nada. La inscripción al RNC es gratuita para personas físicas y jurídicas. Sí pagas aparte otros trámites, como el Registro Mercantil.'),
          ('¿Qué documentos necesita una persona física?', 'La cédula vigente y el formulario RC-01 de declaración jurada de registro y actualización de datos, llenado y firmado, con el código y la descripción de la actividad.'),
          ('¿Necesito Registro Mercantil antes del RNC?', 'La DGII indica que las personas físicas deben solicitar antes el Certificado de Registro Mercantil en la Cámara de Comercio de su provincia. Confirma el procedimiento vigente en dgii.gov.do.'),
          ('¿Puedo hacerlo en línea?', 'Sí, a través de la Oficina Virtual de la DGII.'),
          ('¿Qué sigue después del RNC?', 'Pedir tu clave de la Oficina Virtual, solicitar comprobantes fiscales (NCF) y cumplir con tus declaraciones de ITBIS e ISR.')],
     related=[R_COST, R_RST, R_ITBIS, R_HOME], cta=CTA_DO)

page('cuanto-cuesta-crear-una-empresa-republica-dominicana',
     title='Cuánto cuesta crear una empresa en República Dominicana (2026): impuesto, registro y pasos',
     desc='Qué se paga para crear una empresa en República Dominicana: impuesto de constitución del 1 % del capital, Registro Mercantil, RNC gratuito y honorarios. Calculadora del impuesto y comparación entre persona física y SRL.',
     h1='Cuánto cuesta crear una empresa en República Dominicana',
     lead='El costo depende de si trabajas como persona física o creas una sociedad, como una SRL. Aquí tienes qué se paga, qué es gratis y una calculadora del impuesto de constitución.',
     bullets=['Al constituir una sociedad se paga el impuesto de constitución: 1 % del capital social autorizado, ante la DGII.',
              'El RNC es gratis. El Registro Mercantil en la Cámara de Comercio, el abogado y el notario se pagan aparte y varían.',
              'Una persona física no necesita capital mínimo, pero responde con sus bienes personales por las deudas del negocio.'],
     sections=[('Calcula el impuesto de constitución', [CALC_COST]),
               ('Qué se paga al crear una sociedad (SRL)', [['<strong>Impuesto de constitución:</strong> 1 % del capital social autorizado, que se paga a la DGII.',
                                                           '<strong>Registro Mercantil:</strong> se inscribe en la Cámara de Comercio y Producción de tu domicilio. La tarifa depende del capital.',
                                                           '<strong>Nombre comercial:</strong> conviene registrarlo en la ONAPI.',
                                                           '<strong>RNC:</strong> gratis, en la DGII.',
                                                           '<strong>Abogado y notario:</strong> los estatutos y el acta de asamblea constitutiva se redactan con un profesional. Su costo varía: pide presupuesto.']]),
               ('Persona física o sociedad', ['<div class="scrollx"><table><tr><th></th><th>Persona física</th><th>SRL</th></tr><tr><td>Capital mínimo</td><td>No se exige</td><td>Lo defines en los estatutos</td></tr><tr><td>Responsabilidad</td><td>Ilimitada: con tus bienes personales</td><td>Limitada al capital aportado</td></tr><tr><td>Impuesto de constitución</td><td>No</td><td>1 % del capital autorizado</td></tr><tr><td>Trámite</td><td>RNC con tu cédula</td><td>Estatutos, Registro Mercantil y RNC</td></tr></table></div>', CHK_COST]),
               ('Cómo elegir', ['Si empiezas con poco y quieres probar tu idea, la persona física es más rápida y barata. Si vas a asociarte, contratar varios empleados o separar tus bienes personales de los del negocio, una sociedad suele ser más conveniente. Antes de decidir, haz tus cuentas con el <a href="../../">test de viabilidad</a>.'])],
     faq=[('¿Cuánto se paga de impuesto al constituir una empresa?', '1 % del capital social autorizado, ante la DGII. Con un capital de RD$100,000 son RD$1,000.'),
          ('¿Es gratis el RNC?', 'Sí, la inscripción al RNC no tiene costo para personas físicas ni jurídicas.'),
          ('¿Necesito un abogado?', 'Para una sociedad, los estatutos y el acta constitutiva se redactan con ayuda profesional. Una persona física no necesita constituir documentos de sociedad.'),
          ('¿Hay capital mínimo?', 'Una persona física no tiene capital mínimo. En una sociedad, el capital lo defines en los estatutos y de él depende el impuesto.'),
          ('¿Dónde se registra la empresa?', 'En la Cámara de Comercio y Producción de la provincia del domicilio, y luego en la DGII para obtener el RNC.')],
     related=[R_RNC, R_RST, R_HOME], cta=CTA_DO)

page('regimen-simplificado-de-tributacion-rst-republica-dominicana',
     title='Régimen Simplificado de Tributación (RST) en República Dominicana: límites 2026 y 2027',
     desc='Qué es el RST de la DGII, quién puede acogerse, límite de ingresos de RD$12,068,181.09 en 2026, nuevos límites de la Ley 30-26 desde 2027, cómo inscribirse y una calculadora para saber si cabes.',
     h1='Régimen Simplificado de Tributación (RST) en República Dominicana',
     lead='El RST es un régimen voluntario de la DGII para pequeños contribuyentes: en lugar de llevar el cálculo del régimen ordinario, pagas el impuesto sobre una base simplificada. Aquí tienes los límites, los requisitos y cómo inscribirte.',
     bullets=['Es voluntario y requiere la aprobación de la DGII.',
              'Límite de ingresos en 2026 para el RST por ingresos: RD$12,068,181.09 al año. Para el RST por compras: RD$55,485,890.09.',
              'Desde 2027, la Ley 30-26 cambia los límites: RD$15 millones para profesionales y oficios independientes, RD$30 millones para empresas de servicios o producción y RD$60 millones para comercio de bienes.',
              'Aplica una tasa fija sobre ingresos brutos o compras, sin deducir los costos y gastos reales.'],
     sections=[('¿Cabes en el RST?', [CALC_RST]),
               ('Quién puede acogerse', [['Tener el RNC actualizado y una actividad que corresponda a la realidad.', 'Haber presentado tus declaraciones de los últimos tres años, si aplica, y no tener inconsistencias.', 'No superar el límite aplicable.', 'Algunas actividades quedan excluidas, como la construcción de inmuebles, los seguros, las telecomunicaciones y los servicios financieros.'],
                                       'Las personas jurídicas deben cerrar su año fiscal el 31 de diciembre y no pueden tener accionistas extranjeros o personas jurídicas.']),
               ('Cómo inscribirte', [['Entra a la Oficina Virtual de la DGII.', 'En el módulo de inscripción y actualización del RNC, elige la opción de Régimen Simplificado de Tributación.', 'Completa los datos y espera la aprobación de la DGII: el plazo de respuesta indicado es de 15 días laborables.', 'Pide la solicitud con tiempo: las fuentes no coinciden en la fecha límite del año, así que confírmala con la DGII.']]),
               ('RST o régimen ordinario', ['El RST simplifica: no pides cada gasto, y a cambio no puedes deducir tus costos reales. Si tus costos son muy altos frente a tus ventas, el régimen ordinario puede salirte mejor. Calcula tu caso en el <a href="../../">test de viabilidad</a> antes de decidir.',
                                            CHK_RST])],
     faq=[('¿Qué es el RST?', 'Un régimen simplificado de la DGII para que pequeños contribuyentes cumplan sus obligaciones de ISR e ITBIS de forma más sencilla.'),
          ('¿Cuál es el límite del RST en 2026?', 'RD$12,068,181.09 de ingresos brutos al año para el RST por ingresos, y RD$55,485,890.09 en compras para el RST por compras.'),
          ('¿Qué cambia en 2027?', 'La Ley 30-26 fija RD$15 millones para profesionales y oficios independientes, RD$30 millones para empresas de servicios o producción y RD$60 millones para comercio de bienes, ajustables por inflación. El reglamento está pendiente.'),
          ('¿Es obligatorio?', 'No. Es voluntario y necesita la aprobación de la DGII.'),
          ('¿Puedo deducir mis gastos?', 'No. El impuesto se calcula sobre ingresos brutos o compras, sin deducir los costos y gastos reales.')],
     related=[R_RNC, R_COST, R_ITBIS, R_HOME], cta=CTA_DO)

urls = [B.build('es', slug, **k) for slug, k in P]

# ---- enlaces, sitemap, llms.txt (idempotentes) ----
def edit(path, fn):
    p = os.path.join(ROOT, path); s = open(p, encoding='utf-8').read(); n = fn(s)
    if n != s: open(p, 'w', encoding='utf-8').write(n)

def country_links(s):
    m = re.search(r'(<h2>Guías de República Dominicana</h2>\s*<ul>)(.*?)(</ul>)', s, re.S)
    if not m: return s
    add = ''.join('<li><a href="../guias/%s/">%s</a></li>' % (sl, re.sub(r'<.*?>', '', dict(P)[sl]['h1'])) for sl, _ in P if '../guias/%s/' % sl not in m.group(2))
    return s[:m.end(2)] + add + s[m.end(2):] if add else s
edit('caribbean/es/republica-dominicana/index.html', country_links)

def add_sitemap(s):
    add = ''.join('  <url><loc>%s</loc><lastmod>2026-11-18</lastmod></url>\n' % u for u in urls if u not in s)
    return s.replace('</urlset>', add + '</urlset>') if add else s
edit('sitemap.xml', add_sitemap)
def add_llms(s):
    add = ''.join('- %s\n' % u for u in urls if u not in s)
    return s.rstrip('\n') + '\n' + add if add else s
edit('llms.txt', add_llms)
print('\n'.join(urls))
