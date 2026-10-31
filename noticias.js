/* Carga las novedades desde noticias.json y las muestra.
   Uso: <div class="novedades" data-noticias data-limite="3"></div>
   (sin data-limite muestra todas) */

function escapar(t) {
  return String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function formatearFecha(iso) {
  const [a, m, d] = String(iso).split('-').map(Number);
  if (!a || !m || !d) return escapar(iso);
  return new Date(a, m - 1, d).toLocaleDateString('es-UY', { day: 'numeric', month: 'long', year: 'numeric' });
}

function tarjetaNoticia(n, completa) {
  const img = n.imagen
    ? `<div class="img" style="background-image:url('${escapar(n.imagen)}')"></div>`
    : `<div class="img"></div>`;
  const texto = completa && n.texto
    ? `<details><summary>Leer más</summary><p>${escapar(n.texto).replace(/\n/g, '<br>')}</p></details>` : '';
  const enlace = n.enlace
    ? `<a class="mas" href="${escapar(n.enlace)}" target="_blank" rel="noopener">${escapar(n.textoEnlace || 'Ver más')} →</a>` : '';
  return `<article class="noticia">${img}<div class="cuerpo">
    <time datetime="${escapar(n.fecha)}">${formatearFecha(n.fecha)}</time>
    <h3>${escapar(n.titulo)}</h3><p>${escapar(n.resumen)}</p>${texto}${enlace}</div></article>`;
}

document.querySelectorAll('[data-noticias]').forEach(async caja => {
  const limite = Number(caja.dataset.limite) || Infinity;
  const completa = !caja.dataset.limite;
  try {
    const r = await fetch('noticias.json', { cache: 'no-store' });
    const lista = (await r.json())
      .filter(n => n.publicar !== false)
      .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
      .slice(0, limite);
    caja.innerHTML = lista.length
      ? lista.map(n => tarjetaNoticia(n, completa)).join('')
      : '<p class="vacio">Todavía no hay novedades publicadas.</p>';
  } catch (e) {
    caja.innerHTML = '<p class="vacio">No se pudieron cargar las novedades.</p>';
  }
});
