/**
 * API de reservas del Liceo N.º 1 de La Paz
 * -----------------------------------------
 * La página reservas.html (en GitHub Pages) le manda la clave a este script.
 * La clave NUNCA está en la página: se guarda en la hoja "Config" de la planilla.
 *
 * PUESTA EN MARCHA (una sola vez):
 *  1. Crear una planilla de Google nueva → Extensiones → Apps Script.
 *  2. Pegar este archivo completo y guardar.
 *  3. Elegir la función "configurarPlanilla" y tocar Ejecutar (pide permisos).
 *     Crea las hojas Config, Recursos, Bloques, Reservas y Enlaces con datos de ejemplo.
 *     En "Enlaces" van los documentos internos (planos, planillas, etc.): solo se
 *     muestran después de ingresar la clave. Columna rol: docente (todos) o admin.
 *  4. En la hoja Config, cambiar clave_docentes y clave_admin.
 *  5. Implementar → Nueva implementación → Tipo: Aplicación web
 *       Ejecutar como: Yo   ·   Quién tiene acceso: Cualquier persona
 *  6. Copiar la URL que termina en /exec y pegarla en reservas.js (URL_SCRIPT).
 *
 * Si después se modifica este código: Implementar → Gestionar implementaciones →
 * editar (lápiz) → Versión: Nueva versión. Así la URL no cambia.
 */

const HOJAS = { config: 'Config', recursos: 'Recursos', bloques: 'Bloques', reservas: 'Reservas', enlaces: 'Enlaces' };
const COLS_RESERVAS = ['id', 'fecha', 'recurso', 'turno', 'bloque', 'docente', 'grupo', 'motivo', 'codigo', 'creada'];
const MAX_FALLOS = 20;          // intentos fallidos permitidos...
const VENTANA_FALLOS = 600;     // ...cada 10 minutos (en segundos)

/* ====================== Entrada de la API ====================== */

function doGet() {
  return ContentService.createTextOutput('API de reservas activa.');
}

function doPost(e) {
  let resp;
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    resp = atender(body);
  } catch (err) {
    resp = { ok: false, error: 'Error en el servidor: ' + err.message };
  }
  return ContentService.createTextOutput(JSON.stringify(resp)).setMimeType(ContentService.MimeType.JSON);
}

function atender(body) {
  const cache = CacheService.getScriptCache();
  const fallos = Number(cache.get('fallos') || 0);
  if (fallos >= MAX_FALLOS) {
    return { ok: false, error: 'Demasiados intentos fallidos. Probar de nuevo en unos minutos.' };
  }

  const rol = verificarClave(String(body.clave || ''));
  if (!rol) {
    cache.put('fallos', String(fallos + 1), VENTANA_FALLOS);
    Utilities.sleep(1200); // frena los intentos automáticos
    return { ok: false, error: 'Clave incorrecta.', clave: true };
  }

  switch (body.accion) {
    case 'login':    return { ok: true, rol };
    case 'datos':    return datos(body, rol);
    case 'reservar': return reservar(body);
    case 'cancelar': return cancelar(body, rol);
    case 'enlaces':  return enlaces(rol);
    default:         return { ok: false, error: 'Acción desconocida.' };
  }
}

/* ====================== Acciones ====================== */

function datos(body, rol) {
  const desde = fechaValida(body.desde), hasta = fechaValida(body.hasta);
  if (!desde || !hasta) return { ok: false, error: 'Fechas inválidas.' };

  const recursos = leer(HOJAS.recursos)
    .filter(r => String(r.activo).toUpperCase() !== 'NO')
    .map(r => ({ nombre: texto(r.nombre), descripcion: texto(r.descripcion) }));

  const bloques = leer(HOJAS.bloques).map(b => ({
    turno: texto(b.turno), bloque: texto(b.bloque), inicio: hora(b.inicio), fin: hora(b.fin)
  }));

  const reservas = leer(HOJAS.reservas)
    .map(normalizarReserva)
    .filter(r => r.fecha >= desde && r.fecha <= hasta)
    .map(r => ({ id: r.id, fecha: r.fecha, recurso: r.recurso, turno: r.turno, bloque: r.bloque,
                 docente: r.docente, grupo: r.grupo, motivo: rol === 'admin' ? r.motivo : '' }));

  return { ok: true, rol, recursos, bloques, reservas, anticipacion: diasAnticipacion() };
}

function enlaces(rol) {
  const hoja = libro().getSheetByName(HOJAS.enlaces);
  if (!hoja) return { ok: true, enlaces: [] };
  const lista = leer(HOJAS.enlaces)
    .filter(e => texto(e.url) && (rol === 'admin' || texto(e.rol).toLowerCase() !== 'admin'))
    .map(e => ({ grupo: texto(e.grupo), titulo: texto(e.titulo), descripcion: texto(e.descripcion), url: texto(e.url) }))
    .filter(e => /^https:\/\//.test(e.url));
  return { ok: true, enlaces: lista };
}

function reservar(body) {
  const fecha = fechaValida(body.fecha);
  const recurso = limpiar(body.recurso, 80);
  const turno = limpiar(body.turno, 40);
  const bloquesPedidos = Array.isArray(body.bloques) ? body.bloques.map(b => limpiar(b, 40)) : [];
  const docente = limpiar(body.docente, 80);
  const grupo = limpiar(body.grupo, 30);
  const motivo = limpiar(body.motivo, 200);

  if (!fecha) return { ok: false, error: 'Fecha inválida.' };
  if (!docente) return { ok: false, error: 'Falta el nombre del docente.' };
  if (!bloquesPedidos.length) return { ok: false, error: 'No se eligió ningún bloque.' };

  const hoy = hoyISO();
  if (fecha < hoy) return { ok: false, error: 'No se puede reservar una fecha pasada.' };
  const limite = sumarDias(hoy, diasAnticipacion());
  if (fecha > limite) return { ok: false, error: 'Solo se puede reservar hasta ' + diasAnticipacion() + ' días antes.' };

  const recursosOk = leer(HOJAS.recursos).some(r => texto(r.nombre) === recurso && String(r.activo).toUpperCase() !== 'NO');
  if (!recursosOk) return { ok: false, error: 'Recurso inexistente.' };
  const bloquesTurno = leer(HOJAS.bloques).filter(b => texto(b.turno) === turno).map(b => texto(b.bloque));
  if (bloquesPedidos.some(b => !bloquesTurno.includes(b))) return { ok: false, error: 'Bloque inexistente.' };

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ocupados = leer(HOJAS.reservas).map(normalizarReserva)
      .filter(r => r.fecha === fecha && r.recurso === recurso && r.turno === turno && bloquesPedidos.includes(r.bloque));
    if (ocupados.length) {
      return { ok: false, error: 'Ya está reservado: ' + ocupados.map(r => r.bloque).join(', ') + '. Actualizar y elegir otro.' };
    }
    const codigo = generarCodigo();
    const hoja = hojaReservas();
    const ahora = new Date();
    bloquesPedidos.forEach(b => {
      hoja.appendRow([Utilities.getUuid().slice(0, 8), fecha, recurso, turno, b, docente, grupo, motivo, codigo, ahora]);
    });
    return { ok: true, codigo };
  } finally {
    lock.releaseLock();
  }
}

function cancelar(body, rol) {
  const codigo = limpiar(body.codigo, 20).toUpperCase();
  const id = limpiar(body.id, 20);
  if (!codigo && !(rol === 'admin' && id)) return { ok: false, error: 'Falta el código de la reserva.' };

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const hoja = hojaReservas();
    const valores = hoja.getDataRange().getValues();
    const cId = COLS_RESERVAS.indexOf('id'), cCod = COLS_RESERVAS.indexOf('codigo');
    let borradas = 0;
    for (let i = valores.length - 1; i >= 1; i--) {
      const coincide = codigo ? String(valores[i][cCod]).toUpperCase() === codigo
                              : String(valores[i][cId]) === id;
      if (coincide) { hoja.deleteRow(i + 1); borradas++; }
    }
    return borradas ? { ok: true, borradas } : { ok: false, error: 'No se encontró ninguna reserva con ese código.' };
  } finally {
    lock.releaseLock();
  }
}

/* ====================== Utilidades ====================== */

function verificarClave(clave) {
  if (!clave) return null;
  const cfg = config();
  if (cfg.clave_admin && clave === cfg.clave_admin) return 'admin';
  if (cfg.clave_docentes && clave === cfg.clave_docentes) return 'docente';
  return null;
}

function config() {
  const filas = libro().getSheetByName(HOJAS.config).getDataRange().getValues();
  const cfg = {};
  filas.slice(1).forEach(([k, v]) => { if (k) cfg[String(k).trim()] = String(v).trim(); });
  return cfg;
}

function diasAnticipacion() { return Number(config().dias_anticipacion) || 30; }

function libro() { return SpreadsheetApp.getActiveSpreadsheet(); }
function hojaReservas() { return libro().getSheetByName(HOJAS.reservas); }

function leer(nombreHoja) {
  const valores = libro().getSheetByName(nombreHoja).getDataRange().getValues();
  const enc = valores.shift().map(h => String(h).trim().toLowerCase());
  return valores.filter(f => f.some(c => c !== '')).map(f => Object.fromEntries(enc.map((h, i) => [h, f[i]])));
}

function normalizarReserva(r) {
  return { id: texto(r.id), fecha: fechaTexto(r.fecha), recurso: texto(r.recurso), turno: texto(r.turno),
           bloque: texto(r.bloque), docente: texto(r.docente), grupo: texto(r.grupo), motivo: texto(r.motivo) };
}

const TZ = () => Session.getScriptTimeZone();
function texto(v) { return String(v ?? '').trim(); }
function hora(v) { return v instanceof Date ? Utilities.formatDate(v, TZ(), 'HH:mm') : texto(v); }
function fechaTexto(v) { return v instanceof Date ? Utilities.formatDate(v, TZ(), 'yyyy-MM-dd') : texto(v); }
function hoyISO() { return Utilities.formatDate(new Date(), TZ(), 'yyyy-MM-dd'); }
function sumarDias(iso, n) {
  const [a, m, d] = iso.split('-').map(Number);
  return Utilities.formatDate(new Date(a, m - 1, d + n, 12), TZ(), 'yyyy-MM-dd');
}
function fechaValida(v) { const s = texto(v); return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null; }
function limpiar(v, max) { return texto(v).replace(/[\u0000-\u001f]/g, ' ').replace(/^[=+\-@]/, "'$&").slice(0, max); }
function generarCodigo() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 6; i++) c += letras[Math.floor(Math.random() * letras.length)];
  return c;
}

/* ====================== Configuración inicial ====================== */

function configurarPlanilla() {
  const ss = libro();
  const crear = (nombre, filas) => {
    let h = ss.getSheetByName(nombre);
    if (h) return h;                      // no pisa una hoja que ya existe
    h = ss.insertSheet(nombre);
    h.getRange(1, 1, filas.length, filas[0].length).setNumberFormat('@').setValues(filas);
    h.getRange(1, 1, 1, filas[0].length).setFontWeight('bold').setBackground('#E7F3E8');
    h.setFrozenRows(1);
    return h;
  };

  crear(HOJAS.config, [
    ['clave', 'valor'],
    ['clave_docentes', 'CAMBIAR-esta-clave'],
    ['clave_admin', 'CAMBIAR-clave-admin'],
    ['dias_anticipacion', '30'],
  ]);
  crear(HOJAS.recursos, [
    ['nombre', 'descripcion', 'activo'],
    ['Sala de informática', 'Equipos para un grupo completo', 'SI'],
    ['Salón de actos', 'Con proyector y audio', 'SI'],
    ['Proyector portátil', 'Se retira en adscripción', 'SI'],
  ]);
  crear(HOJAS.bloques, [
    ['turno', 'bloque', 'inicio', 'fin'],
    ['Matutino', '1.ª hora', '07:30', '08:15'],
    ['Matutino', '2.ª hora', '08:20', '09:05'],
    ['Matutino', '3.ª hora', '09:15', '10:00'],
    ['Matutino', '4.ª hora', '10:05', '10:50'],
    ['Matutino', '5.ª hora', '11:00', '11:45'],
    ['Matutino', '6.ª hora', '11:50', '12:35'],
    ['Vespertino', '1.ª hora', '13:00', '13:45'],
    ['Vespertino', '2.ª hora', '13:50', '14:35'],
    ['Vespertino', '3.ª hora', '14:45', '15:30'],
    ['Vespertino', '4.ª hora', '15:35', '16:20'],
    ['Vespertino', '5.ª hora', '16:30', '17:15'],
    ['Vespertino', '6.ª hora', '17:20', '18:05'],
  ]);
  crear(HOJAS.enlaces, [
    ['grupo', 'titulo', 'descripcion', 'url', 'rol'],
    ['Planos', 'Planos turno matutino', 'Distribución de grupos y salones', '', 'docente'],
    ['Planos', 'Planos turno vespertino', 'Distribución de grupos y salones', '', 'docente'],
    ['Adscripción', 'Planilla de seguimiento', 'Solo para adscripción y dirección', '', 'admin'],
  ]);
  const res = crear(HOJAS.reservas, [COLS_RESERVAS]);
  res.getRange('B:B').setNumberFormat('@');   // la fecha se guarda como texto AAAA-MM-DD

  const hoja1 = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (hoja1 && hoja1.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(hoja1);
  SpreadsheetApp.getUi().alert('Listo. Cambiar las claves en la hoja Config y después implementar como aplicación web.');
}
