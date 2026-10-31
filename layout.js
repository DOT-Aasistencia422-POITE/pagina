/* Partes comunes a todas las páginas: íconos, menú lateral, menú del celular y contacto.
   Para cambiar el menú o los datos de contacto, editar SOLO este archivo. */

const ICONOS = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <symbol id="i-inicio" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></symbol>
  <symbol id="i-reloj" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>
  <symbol id="i-docentes" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l9-4 9 4-9 4z"/><path d="M7 10v5c0 1.5 2.5 3 5 3s5-1.5 5-3v-5"/></symbol>
  <symbol id="i-espacios" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></symbol>
  <symbol id="i-novedades" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h13a2 2 0 0 1 2 2v12H6a2 2 0 0 1-2-2z"/><path d="M8 9h7M8 13h7M8 17h4"/></symbol>
  <symbol id="i-funcionarios" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 19c0-3 3-5 6-5s6 2 6 5M15 19c0-2 1.5-3.5 4-3.5"/></symbol>
  <symbol id="i-recursos" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></symbol>
  <symbol id="i-info" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></symbol>
  <symbol id="i-calendario" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></symbol>
  <symbol id="i-libro" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/></symbol>
  <symbol id="i-aviso" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4h3l6 4V6L7 10z"/><path d="M17 9a4 4 0 0 1 0 6"/></symbol>
  <symbol id="i-familia" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></symbol>
  <symbol id="i-compu" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></symbol>
  <symbol id="i-correo" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></symbol>
  <symbol id="i-carpeta" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></symbol>
  <symbol id="i-estudiante" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M5 20c0-4 3-6 7-6s7 2 7 6"/></symbol>
  <symbol id="i-externo" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></symbol>
  <symbol id="i-flecha" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
</defs></svg>`;

const MENU = [
  { grupo: 'General', items: [
    { id: 'inicio',     texto: 'Inicio',     href: 'index.html',     icono: 'i-inicio' },
    { id: 'horarios',   texto: 'Horarios',   href: 'horarios.html',  icono: 'i-reloj' },
    { id: 'novedades',  texto: 'Novedades',  href: 'novedades.html', icono: 'i-novedades' },
  ]},
  { grupo: 'Comunidad', items: [
    { id: 'docentes',   texto: 'Docentes y funcionarios', href: 'docentes.html', icono: 'i-docentes' },
    { id: 'espacios',   texto: 'Espacios',   href: 'espacios.html',          icono: 'i-espacios' },
    { id: 'familias',   texto: 'Familias',   href: 'espacios.html#familias', icono: 'i-familia' },
  ]},
  { grupo: 'Más', items: [
    { id: 'recursos',   texto: 'Recursos',   href: 'espacios.html#recursos', icono: 'i-recursos' },
    { id: 'contacto',   texto: 'Contacto',   href: '#contacto',              icono: 'i-info' },
  ]},
];

const MENU_MOVIL = [
  { id: 'inicio',    texto: 'Inicio',    href: 'index.html',     icono: 'i-inicio' },
  { id: 'horarios',  texto: 'Horarios',  href: 'horarios.html',  icono: 'i-reloj' },
  { id: 'novedades', texto: 'Novedades', href: 'novedades.html', icono: 'i-novedades' },
  { id: 'docentes',  texto: 'Docentes',  href: 'docentes.html',  icono: 'i-docentes' },
  { id: 'espacios',  texto: 'Espacios',  href: 'espacios.html',  icono: 'i-espacios' },
];

const CONTACTO = `
<section id="contacto">
  <div class="contacto">
    <div><h3>Dirección</h3><p>Ramón Álvarez s/n esq. Tiscornia<br>La Paz, Canelones</p></div>
    <div><h3>Teléfonos</h3><p><a href="tel:+59823622213">2362 2213</a><br><a href="tel:+59823624472">2362 4472</a></p></div>
    <div><h3>Correo</h3><p><a href="mailto:ljavierdeviana@gmail.com">ljavierdeviana@gmail.com</a></p></div>
    <div><h3>Biblioteca</h3><p><a href="https://www.instagram.com/biblioteca_lapaz1/" target="_blank" rel="noopener">@biblioteca_lapaz1</a></p></div>
  </div>
  <footer>Liceo N.º 1 de La Paz "Javier de Viana" · Dirección General de Educación Secundaria</footer>
</section>`;

(function armarPagina() {
  const actual = document.body.dataset.pagina || '';
  const enlace = (it, clase = '') =>
    `<a href="${it.href}" class="${it.id === actual ? 'activo' : ''} ${clase}"><svg><use href="#${it.icono}"/></svg>${it.texto}</a>`;

  const lateral = `
  <aside class="lateral">
    <a class="marca" href="index.html">
      <img class="escudo" src="images/logo.svg" alt="Escudo del liceo">
      <div><b>Liceo N.º 1</b><small>La Paz · Canelones</small></div>
    </a>
    ${MENU.map(g => `<div class="grupo-menu"><p>${g.grupo}</p><nav>${g.items.map(i => enlace(i)).join('')}</nav></div>`).join('')}
  </aside>`;

  const movil = `<nav class="barra-movil">${MENU_MOVIL.map(i => enlace(i)).join('')}</nav>`;

  document.body.insertAdjacentHTML('afterbegin', ICONOS + lateral);
  document.body.insertAdjacentHTML('beforeend', movil);
  const main = document.querySelector('main');
  if (main) main.insertAdjacentHTML('beforeend', CONTACTO);
})();

/* Pestañas simples (se usan en Docentes y funcionarios) */
document.querySelectorAll('.pestanas').forEach(grupo => {
  grupo.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    grupo.querySelectorAll('button').forEach(x => x.classList.toggle('activo', x === b));
    document.querySelectorAll('.panel-pestana').forEach(p => p.hidden = p.id !== b.dataset.panel);
  });
});
