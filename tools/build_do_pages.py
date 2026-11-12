# -*- coding: utf-8 -*-
"""4 páginas ES para la República Dominicana : salario mínimo, calculadora ISR, ITBIS y TSS.
Uso (desde la raíz del repo) : python3 tools/build_do_pages.py
Solo genera estas 4 páginas en caribbean/es/guias/. Idempotente para sitemap.xml, llms.txt y la página del país."""
import os, sys, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_guides as B

B.DATE = '2026-11-12'
ROOT = B.ROOT
B.G = {}

CHK_DO = ('Cifras verificadas el 12 de noviembre de 2026 con la DGII, la resolución CNS-01-2025 del Comité Nacional de Salarios (Ministerio de Trabajo) '
          'y la Tesorería de la Seguridad Social (TSS). Confirma el monto vigente con la DGII o con tu contador antes de pagar.')
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

# ----------------------------------------------------------------- reglas
SFS_E, AFP_E = 0.0304, 0.0287
SFS_CEIL_M, AFP_CEIL_M, SRL_CEIL_M = 232230, 464460, 92892      # topes mensuales 2026 (10, 20 y 4 salarios mínimos cotizables de RD$23,223)
TIERS = {'2026': [(416220, 0), (624329, .15), (867123, .20), (float('inf'), .25)],
         '2027': [(480000, 0), (685000, .15), (910000, .20), (4800000, .25), (float('inf'), .27)]}

def isr_year(base, y='2026'):
    t, lo = 0, 0
    for hi, r in TIERS[y]:
        if base > lo: t += (min(base, hi) - lo) * r
        lo = hi
    return t

def dr_emp(g, y='2026'):
    sfs = min(g, SFS_CEIL_M) * SFS_E
    afp = min(g, AFP_CEIL_M) * AFP_E
    isr = isr_year(max((g - sfs - afp) * 12, 0), y) / 12
    return sfs, afp, isr, g - sfs - afp - isr

MW = [('Grandes empresas', 29988.00), ('Medianas empresas', 27489.60), ('Pequeñas empresas', 18421.20), ('Microempresas', 16993.20)]
MW_MICRO = 16993.20

# ----------------------------------------------------------------- calculadoras
CALC_MW = CALC_CSS + '''<div class="calc" id="calc-mw"><strong>Calculadora: salario mínimo neto</strong>
<label for="m-cat">Tamaño de la empresa</label><select id="m-cat"><option value="29988">Grande: RD$29,988.00</option><option value="27489.6">Mediana: RD$27,489.60</option><option value="18421.2">Pequeña: RD$18,421.20</option><option value="16993.2" selected>Microempresa: RD$16,993.20</option></select>
<table><tr><td>Salario bruto mensual</td><td id="m-g"></td></tr><tr><td>Seguro de salud (SFS, 3.04 %)</td><td id="m-s"></td></tr><tr><td>Pensiones (AFP, 2.87 %)</td><td id="m-a"></td></tr><tr><td>ISR (impuesto sobre la renta)</td><td id="m-i"></td></tr><tr class="sum"><td>Neto mensual</td><td id="m-n"></td></tr><tr><td>Neto por quincena</td><td id="m-q"></td></tr></table>
<p class="note">Sin horas extra ni otros descuentos. Estimación de orientación, no asesoría de nómina.</p></div>
<script>(function(){''' + FMT + '''function run(){var g=parseFloat(document.getElementById('m-cat').value),s=g*0.0304,a=g*0.0287,b=(g-s-a)*12,i=b>416220?(Math.min(b,624329)-416220)*0.15/12:0,n=g-s-a-i;
document.getElementById('m-g').textContent=m(g,2);document.getElementById('m-s').textContent=m(s,2);document.getElementById('m-a').textContent=m(a,2);document.getElementById('m-i').textContent=m(i,2);document.getElementById('m-n').textContent=m(n,2);document.getElementById('m-q').textContent=m(n/2,2)}
document.getElementById('m-cat').addEventListener('input',run);run()})();</script>'''

CALC_ISR = CALC_CSS + '''<div class="calc" id="calc-isr"><strong>Calculadora: ISR y salario neto</strong>
<label for="i-g">Salario bruto mensual (RD$)</label><input id="i-g" type="number" inputmode="numeric" min="0" step="500" value="60000">
<label for="i-y">Escala</label><select id="i-y"><option value="2026">2026: exento hasta RD$416,220 al año</option><option value="2027">Desde 2027 (Ley 30-26): exento hasta RD$480,000 al año</option></select>
<table><tr><td>Seguro de salud (SFS, 3.04 %)</td><td id="i-s"></td></tr><tr><td>Pensiones (AFP, 2.87 %)</td><td id="i-a"></td></tr><tr><td>Renta gravable mensual</td><td id="i-b"></td></tr><tr><td>ISR por mes</td><td id="i-i"></td></tr><tr class="sum"><td>Total de descuentos</td><td id="i-d"></td></tr><tr class="sum"><td>Neto mensual</td><td id="i-n"></td></tr><tr><td>Tasa efectiva sobre el bruto</td><td id="i-e"></td></tr></table>
<p class="note">Un solo empleador, sin otros ingresos ni deducciones (por ejemplo gastos educativos). Estimación de orientación: confirma con la DGII o con tu contador.</p></div>
<script>(function(){''' + FMT + '''var T={'2026':[[416220,0],[624329,.15],[867123,.20],[1e15,.25]],'2027':[[480000,0],[685000,.15],[910000,.20],[4800000,.25],[1e15,.27]]};
function isr(b,y){var t=0,lo=0;T[y].forEach(function(x){if(b>lo)t+=(Math.min(b,x[0])-lo)*x[1];lo=x[0]});return t}
function run(){var g=num('i-g'),y=document.getElementById('i-y').value,s=Math.min(g,232230)*0.0304,a=Math.min(g,464460)*0.0287,b=Math.max(g-s-a,0),i=isr(b*12,y)/12,d=s+a+i;
document.getElementById('i-s').textContent=m(s,2);document.getElementById('i-a').textContent=m(a,2);document.getElementById('i-b').textContent=m(b,2);document.getElementById('i-i').textContent=m(i,2);document.getElementById('i-d').textContent=m(d,2);document.getElementById('i-n').textContent=m(g-d,2);document.getElementById('i-e').textContent=g>0?(d/g*100).toFixed(1)+' %':'0 %'}
['i-g','i-y'].forEach(function(k){document.getElementById(k).addEventListener('input',run)});run()})();</script>'''

CALC_ITBIS = CALC_CSS + '''<div class="calc" id="calc-itbis"><strong>Calculadora: sumar o quitar ITBIS (18 %)</strong>
<label for="v-amt">Monto (RD$)</label><input id="v-amt" type="number" inputmode="numeric" min="0" step="10" value="1000">
<label for="v-mode">Este monto es</label><select id="v-mode"><option value="ex">Sin ITBIS (sumar 18 %)</option><option value="in">Con ITBIS incluido (quitar 18 %)</option></select>
<table><tr><td>Precio sin ITBIS</td><td id="v-ex"></td></tr><tr><td>ITBIS (18 %)</td><td id="v-tax"></td></tr><tr class="sum"><td>Precio con ITBIS</td><td id="v-in"></td></tr></table>
<p class="note">Tasa general del 18 %. Algunos bienes y servicios están exentos o tienen otro tratamiento: consulta a la DGII. Estimación, no asesoría fiscal.</p></div>
<script>(function(){''' + FMT + '''function run(){var a=num('v-amt'),md=document.getElementById('v-mode').value;var ex=md==='ex'?a:a/1.18,inc=md==='ex'?a*1.18:a;
document.getElementById('v-ex').textContent=m(ex,2);document.getElementById('v-tax').textContent=m(inc-ex,2);document.getElementById('v-in').textContent=m(inc,2)}
['v-amt','v-mode'].forEach(function(i){document.getElementById(i).addEventListener('input',run)});run()})();</script>'''

CALC_TSS = CALC_CSS + '''<div class="calc" id="calc-tss"><strong>Calculadora: aportes a la seguridad social</strong>
<label for="t-g">Salario cotizable mensual (RD$)</label><input id="t-g" type="number" inputmode="numeric" min="0" step="500" value="40000">
<table><tr><td>Empleado: seguro de salud (SFS, 3.04 %)</td><td id="t-es"></td></tr><tr><td>Empleado: pensiones (AFP, 2.87 %)</td><td id="t-ea"></td></tr><tr class="sum"><td>Total que paga el empleado</td><td id="t-et"></td></tr>
<tr><td>Empleador: seguro de salud (SFS, 7.09 %)</td><td id="t-ps"></td></tr><tr><td>Empleador: pensiones (AFP, 7.10 %)</td><td id="t-pa"></td></tr><tr><td>Empleador: riesgos laborales (SRL, cerca de 1.2 %)</td><td id="t-pr"></td></tr><tr><td>Empleador: INFOTEP (1 %)</td><td id="t-pi"></td></tr><tr class="sum"><td>Total que paga el empleador</td><td id="t-pt"></td></tr></table>
<p class="note">Topes de 2026: SFS hasta RD$232,230 al mes, AFP hasta RD$464,460 y riesgos laborales hasta RD$92,892. La tasa de riesgos laborales varía según la actividad (de 1.1 % a 1.3 %). Estimación de orientación, no asesoría de nómina.</p></div>
<script>(function(){''' + FMT + '''function run(){var g=num('t-g'),es=Math.min(g,232230)*0.0304,ea=Math.min(g,464460)*0.0287,ps=Math.min(g,232230)*0.0709,pa=Math.min(g,464460)*0.071,pr=Math.min(g,92892)*0.012,pi=g*0.01;
function s(id,v){document.getElementById(id).textContent=m(v,2)}s('t-es',es);s('t-ea',ea);s('t-et',es+ea);s('t-ps',ps);s('t-pa',pa);s('t-pr',pr);s('t-pi',pi);s('t-pt',ps+pa+pr+pi)}
document.getElementById('t-g').addEventListener('input',run);run()})();</script>'''

def isr_table():
    rows = ''
    for g in [MW_MICRO, 25000, 35000, 50000, 75000, 100000, 150000, 250000]:
        sfs, afp, isr, net = dr_emp(g)
        rows += '<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>' % (money(g, 2) if g == MW_MICRO else money(g), money(sfs + afp + isr), money(isr), money(net))
    return '<div class="scrollx"><table><tr><th>Bruto mensual</th><th>Descuentos totales</th><th>De los cuales ISR</th><th>Neto mensual</th></tr>%s</table></div>' % rows

# ----------------------------------------------------------------- páginas
P = []
def page(slug, **k): P.append((slug, k))

mw_sfs, mw_afp, mw_isr, mw_net = dr_emp(MW_MICRO)
mw_big = dr_emp(29988.00)

R_MW = ('Salario mínimo en República Dominicana 2026', '../salario-minimo-republica-dominicana-2026/', 'cuánto es por tamaño de empresa y cuánto queda neto')
R_ISR = ('Calculadora de ISR en República Dominicana', '../calculadora-isr-republica-dominicana/', 'impuesto sobre la renta y salario neto')
R_ITBIS = ('Calculadora de ITBIS en República Dominicana', '../calculadora-itbis-republica-dominicana/', 'sumar o quitar el 18 %')
R_TSS = ('Calculadora de aportes a la TSS', '../calculadora-tss-republica-dominicana/', 'seguro de salud y pensiones, empleado y empleador')
R_HOME = ('Crear un negocio en República Dominicana', '../../republica-dominicana/', 'impuestos, registro y pasos')

MW_TABLE = ('<div class="scrollx"><table><tr><th>Categoría</th><th>Salario mínimo mensual</th><th>Vigente desde</th></tr>'
            + ''.join('<tr><td>%s</td><td>%s</td><td>1 de febrero de 2026</td></tr>' % (n, money(v, 2)) for n, v in MW)
            + '<tr><td>Zonas francas</td><td>RD$20,875.00</td><td>1 de junio de 2026</td></tr>'
            '<tr><td>Hoteles y casinos (151 trabajadores o más)</td><td>RD$21,840.00</td><td>1 de junio de 2026</td></tr></table></div>')

page('salario-minimo-republica-dominicana-2026',
     title='Salario mínimo en República Dominicana 2026: tabla por tamaño de empresa y neto',
     desc='El salario mínimo en República Dominicana va de RD$16,993.20 (microempresas) a RD$29,988.00 (grandes empresas) desde el 1 de febrero de 2026. Tabla, calculadora y sueldo neto después de TSS e ISR.',
     h1='Salario mínimo en República Dominicana en 2026',
     lead='En República Dominicana no hay un solo salario mínimo: lo fija el Comité Nacional de Salarios según el tamaño de la empresa y el sector. Aquí tienes los montos vigentes en 2026, cuánto queda neto y una calculadora.',
     bullets=['Sector privado no sectorizado, desde el 1 de febrero de 2026: RD$16,993.20 (microempresa), RD$18,421.20 (pequeña), RD$27,489.60 (mediana) y RD$29,988.00 (grande).',
              'Zonas francas: RD$20,875.00 desde el 1 de junio de 2026. Hoteles y casinos de 151 trabajadores o más: RD$21,840.00.',
              'Un salario mínimo de microempresa deja unos %s netos al mes, después de salud (SFS) y pensiones (AFP). No paga ISR.' % money(mw_net, 2)],
     sections=[('Montos vigentes en 2026', [MW_TABLE, 'Los montos del sector privado no sectorizado vienen de la resolución CNS-01-2025 del Comité Nacional de Salarios y aplican desde el 1 de febrero de 2026. Los de zonas francas (CNS-03-2025) y de hoteles y casinos (CNS-04-2025) aplican desde el 1 de junio de 2026. La construcción, la agricultura y otros sectores tienen sus propias resoluciones.']),
               ('Calcula el neto de un salario mínimo', [CALC_MW]),
               ('Qué se descuenta al salario mínimo', ['Al empleado se le descuenta el 3.04 %% para el seguro de salud (SFS) y el 2.87 %% para pensiones (AFP). Con el salario de microempresa, son %s y %s al mes. Como el ingreso anual queda por debajo de RD$416,220, no se paga ISR. Quedan unos %s netos al mes.' % (money(mw_sfs, 2), money(mw_afp, 2), money(mw_net, 2)),
                                                    'Con el salario de una empresa grande (RD$29,988.00) el neto es de unos %s al mes. Para otro sueldo, usa la <a href="../calculadora-isr-republica-dominicana/">calculadora de ISR</a>. El empleador paga además sus propios aportes: mira la <a href="../calculadora-tss-republica-dominicana/">calculadora de aportes a la TSS</a>. ' % money(mw_big[3], 2) + CHK_DO])],
     faq=[('¿Cuál es el salario mínimo en República Dominicana en 2026?', 'Depende del tamaño de la empresa. En el sector privado no sectorizado va de RD$16,993.20 (microempresas) a RD$29,988.00 (grandes empresas) desde el 1 de febrero de 2026.'),
          ('¿Cuánto es el salario mínimo en zonas francas?', 'RD$20,875.00 al mes desde el 1 de junio de 2026, según la resolución CNS-03-2025.'),
          ('¿Quién fija el salario mínimo?', 'El Comité Nacional de Salarios del Ministerio de Trabajo, con representantes del Gobierno, los empleadores y los trabajadores.'),
          ('¿Se paga ISR con el salario mínimo?', 'No. El ingreso anual de un salario mínimo queda por debajo de la renta anual exenta de RD$416,220 en 2026. Sí se descuentan el seguro de salud y las pensiones.')],
     related=[R_ISR, R_TSS, R_HOME], cta=CTA_DO)

page('calculadora-isr-republica-dominicana',
     title='Calculadora de ISR en República Dominicana (2026): impuesto y salario neto',
     desc='Calculadora gratis del ISR de personas físicas en República Dominicana: escala 2026 (exento hasta RD$416,220; 15 %, 20 % y 25 %), descuentos de TSS y salario neto. Con la escala de 2027.',
     h1='Calculadora de ISR en República Dominicana',
     lead='El ISR es el impuesto sobre la renta que se retiene al salario. Escribe tu sueldo bruto mensual y obtén el ISR, lo que se descuenta a la TSS y lo que llega a tu cuenta.',
     bullets=['Escala de 2026: exento hasta RD$416,220 al año; 15 % hasta RD$624,329; 20 % hasta RD$867,123; 25 % por encima.',
              'Desde 2027, la Ley 30-26 sube la renta exenta a RD$480,000 y agrega un tramo del 27 %.',
              'Los aportes del empleado a la seguridad social (SFS 3.04 % y AFP 2.87 %) se restan antes de calcular el impuesto.'],
     sections=[('La calculadora', [CALC_ISR]),
               ('Salario neto con distintos sueldos (2026)', [isr_table(), 'Sueldo mensual, escala de 2026, un solo empleador y sin otros ingresos.']),
               ('Cómo se calcula', ['<strong>1.</strong> Del sueldo bruto se restan los aportes del empleado a la TSS: 3.04 % de seguro de salud (SFS, hasta un tope de RD$232,230 al mes) y 2.87 % de pensiones (AFP, hasta RD$464,460 al mes).',
                                    '<strong>2.</strong> El resultado, multiplicado por 12, es la renta gravable anual. Si no pasa de RD$416,220 en 2026, no hay ISR.',
                                    '<strong>3.</strong> Lo que pasa de esa cifra paga 15 % hasta RD$624,329, luego 20 % hasta RD$867,123 y 25 % por encima. La DGII lo divide en 12 pagos mensuales.',
                                    'La escala de 2027 (Ley 30-26) es: exento hasta RD$480,000; 15 % hasta RD$685,000; 20 % hasta RD$910,000; 25 % hasta RD$4.8 millones; 27 % por encima. Si trabajas por cuenta propia, declaras con el formulario IR-1 y puedes tener anticipos. ' + CHK_DO])],
     faq=[('¿Desde cuánto se paga ISR en República Dominicana en 2026?', 'Cuando la renta anual neta pasa de RD$416,220, unos RD$34,685 al mes. Por debajo de esa cifra el trabajador está exento.'),
          ('¿Qué tasas de ISR hay en 2026?', '15 % de RD$416,220 a RD$624,329; 20 % hasta RD$867,123; 25 % por encima, según la escala de la DGII.'),
          ('¿Qué cambia en 2027?', 'La Ley 30-26 eleva la renta anual exenta a RD$480,000 (RD$40,000 al mes) y cambia los tramos: 15 %, 20 %, 25 % y un 27 % para rentas muy altas.'),
          ('¿Los aportes a la TSS reducen el ISR?', 'Sí. La DGII acepta las aportaciones a la seguridad social como descuento antes de calcular el impuesto, y la calculadora lo aplica.'),
          ('¿Esta calculadora es asesoría fiscal?', 'No. Es una estimación para planificar. Confirma con la DGII o con tu contador.')],
     related=[R_MW, R_TSS, R_HOME], cta=CTA_DO)

page('calculadora-itbis-republica-dominicana',
     title='Calculadora de ITBIS en República Dominicana: sumar o quitar el 18 %',
     desc='Calculadora gratis del ITBIS (18 %) en República Dominicana: suma el impuesto a un precio o quítalo de un total. No hay mínimo de ventas: aplica desde la primera venta gravada. Declaración mensual.',
     h1='Calculadora de ITBIS en República Dominicana',
     lead='El ITBIS es el impuesto sobre las ventas de bienes y servicios: 18 % en la tasa general. Escribe un monto para sumarle el ITBIS o para saber cuánto es el precio sin ITBIS dentro de un total.',
     bullets=['Tasa general del ITBIS: 18 %.', 'No existe un mínimo de ventas: se cobra desde la primera venta gravada, con RNC y comprobantes fiscales (NCF).', 'Se declara cada mes, a más tardar el día 20 del mes siguiente.'],
     sections=[('La calculadora', [CALC_ITBIS]),
               ('Cómo funciona', ['Para sumar el ITBIS, multiplica el precio por 1.18. Para quitarlo de un total, divide entre 1.18. Sobre RD$1,180 el ITBIS es de RD$180 y el precio sin ITBIS es de RD$1,000.']),
               ('Qué debes hacer como negocio', [['Solicita tu <strong>RNC</strong> en la DGII y tus comprobantes fiscales (<strong>NCF</strong>).', 'Cobra el ITBIS en tus ventas gravadas y muéstralo en la factura.', 'Declara y paga el ITBIS del mes anterior a más tardar el día 20.', 'Si tus ingresos no pasan de RD$12,068,181 al año, pregunta a la DGII si te conviene el Régimen Simplificado de Tributación (RST).'], CHK_DO]),
               ('Ojo', ['No todo lleva ITBIS: algunos bienes y servicios están exentos o tienen un tratamiento distinto. Consulta tu producto con la DGII antes de cobrar o de pedir el crédito del impuesto.'])],
     faq=[('¿Cuál es la tasa del ITBIS en República Dominicana?', '18 % en la tasa general, según la DGII.'),
          ('¿Cómo quito el ITBIS de un precio?', 'Divide el total con ITBIS entre 1.18. La diferencia es el impuesto.'),
          ('¿Desde qué monto de ventas debo cobrar ITBIS?', 'No hay un mínimo: aplica desde la primera venta de un bien o servicio gravado.'),
          ('¿Cada cuánto se declara el ITBIS?', 'Cada mes, a más tardar el día 20 del mes siguiente.')],
     related=[R_MW, R_ISR, R_HOME], cta=CTA_DO)

page('calculadora-tss-republica-dominicana',
     title='Calculadora de aportes a la TSS en República Dominicana (2026): SFS, AFP y empleador',
     desc='Calculadora gratis de los aportes a la seguridad social en República Dominicana: seguro de salud (SFS) y pensiones (AFP) del empleado y del empleador, riesgos laborales e INFOTEP, con los topes de 2026.',
     h1='Calculadora de aportes a la TSS en República Dominicana',
     lead='Cada mes, el empleador paga a la Tesorería de la Seguridad Social (TSS) los aportes de sus empleados. Escribe un salario y ve lo que paga el empleado y lo que paga el empleador.',
     bullets=['Empleado: 3.04 % de seguro de salud (SFS) y 2.87 % de pensiones (AFP).', 'Empleador: 7.09 % de SFS, 7.10 % de AFP, cerca de 1.2 % de riesgos laborales (SRL) y 1 % de INFOTEP.', 'Topes de 2026: SFS hasta RD$232,230 al mes, AFP hasta RD$464,460 y SRL hasta RD$92,892.'],
     sections=[('La calculadora', [CALC_TSS]),
               ('Las tasas', ['<div class="scrollx"><table><tr><th>Aporte</th><th>Empleado</th><th>Empleador</th><th>Tope mensual de 2026</th></tr><tr><td>Seguro de salud (SFS)</td><td>3.04 %</td><td>7.09 %</td><td>RD$232,230</td></tr><tr><td>Pensiones (AFP)</td><td>2.87 %</td><td>7.10 %</td><td>RD$464,460</td></tr><tr><td>Riesgos laborales (SRL)</td><td>0 %</td><td>cerca de 1.2 %</td><td>RD$92,892</td></tr><tr><td>INFOTEP</td><td>0 %</td><td>1 %</td><td>sin tope</td></tr></table></div>',
                              'Los topes se calculan con el salario mínimo nacional de referencia de la TSS: RD$23,223 desde el 1 de febrero de 2026 (10 veces para el SFS, 20 veces para la AFP y 4 veces para riesgos laborales). Suben cada vez que cambia ese salario. La tasa de riesgos laborales varía según la actividad, entre 1.1 % y 1.3 %. ' + CHK_DO]),
               ('Para recordar', ['El empleador entrega los aportes retenidos al empleado junto con los suyos a través del sistema de la TSS, cada mes. Los aportes del empleado se restan antes de calcular el ISR. Usa la <a href="../calculadora-isr-republica-dominicana/">calculadora de ISR</a> para ver el neto.'])],
     faq=[('¿Cuánto aporta el empleado a la seguridad social en República Dominicana?', '3.04 % para el seguro de salud (SFS) y 2.87 % para pensiones (AFP), con topes que cambian cada año.'),
          ('¿Cuánto aporta el empleador?', 'Alrededor de 7.09 % de SFS, 7.10 % de AFP, entre 1.1 % y 1.3 % de riesgos laborales y 1 % de INFOTEP sobre la nómina, según la actividad.'),
          ('¿Cuál es el tope de cotización en 2026?', 'RD$232,230 al mes para el SFS y RD$464,460 al mes para la AFP, desde el 1 de febrero de 2026.'),
          ('¿Cuándo se pagan los aportes?', 'Cada mes, a través del sistema de la TSS, por el mes anterior.')],
     related=[R_ISR, R_MW, R_HOME], cta=CTA_DO)

urls = [B.build('es', slug, **k) for slug, k in P]

# ---- enlaces, sitemap, llms.txt (idempotentes) ----
def edit(path, fn):
    p = os.path.join(ROOT, path); s = open(p, encoding='utf-8').read(); n = fn(s)
    if n != s: open(p, 'w', encoding='utf-8').write(n)

def country_links(s):
    title = 'Guías de República Dominicana'
    if '<h2>%s</h2>' % title in s: return s
    items = ''.join('<li><a href="../guias/%s/">%s</a></li>' % (sl, re.sub(r'<.*?>', '', dict(P)[sl]['h1'])) for sl, _ in P)
    return s.replace('    <h2>Otros países del Caribe</h2>', '    <h2>%s</h2>\n    <ul>%s</ul>\n    <h2>Otros países del Caribe</h2>' % (title, items), 1)
edit('caribbean/es/republica-dominicana/index.html', country_links)

def add_sitemap(s):
    add = ''.join('  <url><loc>%s</loc><lastmod>2026-11-12</lastmod></url>\n' % u for u in urls if u not in s)
    return s.replace('</urlset>', add + '</urlset>') if add else s
edit('sitemap.xml', add_sitemap)
def add_llms(s):
    add = ''.join('- %s\n' % u for u in urls if u not in s)
    return s.rstrip('\n') + '\n' + add if add else s
edit('llms.txt', add_llms)
print('\n'.join(urls))
