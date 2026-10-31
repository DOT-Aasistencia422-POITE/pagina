/* Reservas de recursos del liceo.
   La clave se verifica en Google Apps Script (apps-script/Codigo.gs), nunca en esta página. */

// PEGAR AQUÍ la URL de la aplicación web de Apps Script (termina en /exec)
const URL_SCRIPT = '';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
const estado = { clave: '', rol: '', lunes: lunesDe(new Date()), recurso: '', turno: '', datos: null, seleccion: [] };

const $ = s => document.querySelector(s);
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Fechas ---------- */
function iso(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function lunesDe(d) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
function sumar(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function corta(d) { return d.toLocaleDateString('es-UY', { day: 'numeric', month: 'short' }); }

/* ---------- Comunicación con Apps Script ---------- */
async function api(accion, extra = {}) {
  if (!URL_SCRIPT) throw new Error('Falta configurar URL_SCRIPT en reservas.js.');
  const r = await fetch(URL_SCRIPT, { method: 'POST', body: JSON.stringify({ accion, clave: estado.clave, ...extra }) });
  const j = await r.json();
  if (!j.ok && j.clave) salir('La clave ya no es válida. Ingresarla de nuevo.');
  return j;
}

function guardarClave(c) { try { c ? sessionStorage.setItem('clave_reservas', c) : sessionStorage.removeItem('clave_reservas'); } catch (e) {} }
function claveGuardada() { try { return sessionStorage.getItem('clave_reservas') || ''; } catch (e) { return ''; } }

/* ---------- Acceso ---------- */
async function entrar(clave) {
  const btn = $('#btn-entrar'), msg = $('#msg-acceso');
  btn.disabled = true; msg.textContent = 'Verificando…'; msg.className = 'mensaje';
  estado.clave = clave;
  try {
    const r = await api('login');
    if (!r.ok) { msg.textContent = r.error; msg.className = 'mensaje error'; estado.clave = ''; return; }
    estado.rol = r.rol; guardarClave(clave);
    $('#acceso').hidden = true; $('#app').hidden = false;
    $('#rol').textContent = r.rol === 'admin' ? 'Administración' : 'Docente';
    await Promise.all([cargar(), cargarEnlaces()]);
  } catch (e) {
    msg.textContent = e.message; msg.className = 'mensaje error';
  } finally { btn.disabled = false; }
}

function salir(mensaje = '') {
  estado.clave = ''; estado.rol = ''; guardarClave('');
  $('#app').hidden = true; $('#acceso').hidden = false;
  $('#clave').value = '';
  $('#msg-acceso').textContent = mensaje; $('#msg-acceso').className = mensaje ? 'mensaje error' : 'mensaje';
}

/* ---------- Documentos internos ---------- */
async function cargarEnlaces() {
  const r = await api('enlaces');
  const caja = $('#enlaces');
  if (!r.ok || !r.enlaces.length) { caja.innerHTML = '<p class="vacio">No hay documentos cargados.</p>'; return; }
  const grupos = {};
  r.enlaces.forEach(e => (grupos[e.grupo || 'Otros'] ??= []).push(e));
  caja.innerHTML = Object.entries(grupos).map(([g, lista]) => `<div class="grupo-enlaces"><h3>${esc(g)}</h3><div class="accesos">${
    lista.map(e => `<a class="tarjeta" href="${esc(e.url)}" target="_blank" rel="noopener"><span class="flecha"><svg width="18" height="18"><use href="#i-flecha"/></svg></span>
      <div class="icono"><svg><use href="#i-carpeta"/></svg></div><h3>${esc(e.titulo)}</h3><p>${esc(e.descripcion)}</p></a>`).join('')
  }</div></div>`).join('');
}

/* ---------- Datos y grilla ---------- */
async function cargar() {
  $('#grilla').innerHTML = '<p class="vacio">Cargando…</p>';
  const r = await api('datos', { desde: iso(estado.lunes), hasta: iso(sumar(estado.lunes, 4)) });
  if (!r.ok) { $('#grilla').innerHTML = `<p class="vacio">${esc(r.error)}</p>`; return; }
  estado.datos = r;

  const selR = $('#sel-recurso'), selT = $('#sel-turno');
  if (!selR.options.length) {
    selR.innerHTML = r.recursos.map(x => `<option>${esc(x.nombre)}</option>`).join('');
    const turnos = [...new Set(r.bloques.map(b => b.turno))];
    selT.innerHTML = turnos.map(t => `<option>${esc(t)}</option>`).join('');
  }
  estado.recurso = selR.value; estado.turno = selT.value;
  dibujar();
}

function dibujar() {
  const { bloques, reservas, recursos } = estado.datos;
  const desc = recursos.find(x => x.nombre === estado.recurso)?.descripcion || '';
  $('#desc-recurso').textContent = desc;
  $('#semana').textContent = `Semana del ${corta(estado.lunes)} al ${corta(sumar(estado.lunes, 4))}`;

  const hoy = iso(new Date());
  const limite = iso(sumar(new Date(), estado.datos.anticipacion));
  const dias = DIAS.map((n, i) => ({ nombre: n, fecha: iso(sumar(estado.lunes, i)), d: sumar(estado.lunes, i) }));
  const filas = bloques.filter(b => b.turno === estado.turno);

  let html = `<table class="grilla"><thead><tr><th></th>${dias.map(d =>
    `<th class="${d.fecha === hoy ? 'hoy' : ''}">${d.nombre}<small>${corta(d.d)}</small></th>`).join('')}</tr></thead><tbody>`;
  for (const b of filas) {
    html += `<tr><th>${esc(b.bloque)}<small>${esc(b.inicio)}–${esc(b.fin)}</small></th>`;
    for (const d of dias) {
      const res = reservas.find(r => r.fecha === d.fecha && r.recurso === estado.recurso && r.turno === estado.turno && r.bloque === b.bloque);
      if (res) {
        const borrar = estado.rol === 'admin' ? `<button class="x" data-id="${esc(res.id)}" title="Cancelar reserva">×</button>` : '';
        html += `<td class="ocupado" title="${esc(res.motivo)}">${borrar}<b>${esc(res.docente)}</b><span>${esc(res.grupo)}</span></td>`;
      } else if (d.fecha < hoy || d.fecha > limite) {
        html += '<td class="cerrado"></td>';
      } else {
        const sel = estado.seleccion.some(s => s.fecha === d.fecha && s.bloque === b.bloque) ? 'elegido' : '';
        html += `<td class="libre ${sel}"><button data-fecha="${d.fecha}" data-bloque="${esc(b.bloque)}">${sel ? '✓ Elegido' : 'Libre'}</button></td>`;
      }
    }
    html += '</tr>';
  }
  $('#grilla').innerHTML = filas.length ? html + '</tbody></table>' : '<p class="vacio">No hay bloques cargados para este turno.</p>';
  actualizarBarra();
}

function actualizarBarra() {
  const n = estado.seleccion.length;
  $('#barra-seleccion').hidden = !n;
  $('#cant-seleccion').textContent = n === 1 ? '1 bloque elegido' : `${n} bloques elegidos`;
}

/* ---------- Reservar ---------- */
function abrirFormulario() {
  const fechas = [...new Set(estado.seleccion.map(s => s.fecha))];
  if (fechas.length > 1) { alerta('Para reservar, elegir bloques de un mismo día.', true); return; }
  const [a, m, d] = fechas[0].split('-').map(Number);
  $('#resumen-reserva').innerHTML = `<b>${esc(estado.recurso)}</b> · ${new Date(a, m - 1, d).toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long' })} · ${esc(estado.turno)}<br>${estado.seleccion.map(s => esc(s.bloque)).join(', ')}`;
  $('#modal').hidden = false; $('#docente').focus();
}

async function confirmarReserva(ev) {
  ev.preventDefault();
  const btn = $('#btn-confirmar'); btn.disabled = true;
  try {
    const r = await api('reservar', {
      fecha: estado.seleccion[0].fecha, recurso: estado.recurso, turno: estado.turno,
      bloques: estado.seleccion.map(s => s.bloque),
      docente: $('#docente').value, grupo: $('#grupo').value, motivo: $('#motivo').value,
    });
    if (!r.ok) { alerta(r.error, true); return; }
    $('#modal').hidden = true; $('#form-reserva').reset();
    estado.seleccion = [];
    alerta(`Reserva confirmada. Código para cancelarla: <b class="codigo">${esc(r.codigo)}</b> — anotarlo.`);
    await cargar();
  } catch (e) { alerta(e.message, true); }
  finally { btn.disabled = false; }
}

async function cancelar(datos) {
  const r = await api('cancelar', datos);
  alerta(r.ok ? 'Reserva cancelada.' : r.error, !r.ok);
  if (r.ok) await cargar();
}

function alerta(html, error = false) {
  const a = $('#alerta'); a.innerHTML = html; a.className = 'alerta' + (error ? ' error' : ''); a.hidden = false;
  a.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ---------- Eventos ---------- */
$('#form-acceso').addEventListener('submit', e => { e.preventDefault(); entrar($('#clave').value.trim()); });
$('#btn-salir').addEventListener('click', () => salir());
$('#sel-recurso').addEventListener('change', e => { estado.recurso = e.target.value; estado.seleccion = []; dibujar(); });
$('#sel-turno').addEventListener('change', e => { estado.turno = e.target.value; estado.seleccion = []; dibujar(); });
$('#ant').addEventListener('click', () => { estado.lunes = sumar(estado.lunes, -7); estado.seleccion = []; cargar(); });
$('#sig').addEventListener('click', () => { estado.lunes = sumar(estado.lunes, 7); estado.seleccion = []; cargar(); });
$('#btn-hoy').addEventListener('click', () => { estado.lunes = lunesDe(new Date()); estado.seleccion = []; cargar(); });
$('#grilla').addEventListener('click', e => {
  const libre = e.target.closest('td.libre button');
  if (libre) {
    const { fecha, bloque } = libre.dataset;
    const i = estado.seleccion.findIndex(s => s.fecha === fecha && s.bloque === bloque);
    i >= 0 ? estado.seleccion.splice(i, 1) : estado.seleccion.push({ fecha, bloque });
    dibujar(); return;
  }
  const x = e.target.closest('button.x');
  if (x && confirm('¿Cancelar esta reserva?')) cancelar({ id: x.dataset.id });
});
$('#btn-reservar').addEventListener('click', abrirFormulario);
$('#btn-limpiar').addEventListener('click', () => { estado.seleccion = []; dibujar(); });
$('#form-reserva').addEventListener('submit', confirmarReserva);
$('#btn-cerrar').addEventListener('click', () => { $('#modal').hidden = true; });
$('#form-cancelar').addEventListener('submit', e => {
  e.preventDefault(); const c = $('#codigo-cancelar').value.trim();
  if (c) cancelar({ codigo: c }).then(() => { $('#codigo-cancelar').value = ''; });
});

const previa = claveGuardada();
if (previa) entrar(previa);
