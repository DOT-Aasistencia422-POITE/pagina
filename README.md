# Liceo N.º 1 de La Paz "Javier de Viana"

Sitio institucional del liceo (Ramón Álvarez s/n esq. Tiscornia, La Paz, Canelones), publicado con GitHub Pages.

## Cómo se mantiene

| Qué cambiar | Dónde |
|---|---|
| Menú y datos de contacto (todas las páginas) | `layout.js` |
| Novedades | `noticias.json` (copiar un bloque y editarlo) |
| Colores y estilos | `style.css` |
| Escudo | `images/logo.svg` |
| Links pendientes | Buscar `href="#"` en las páginas: se ven con la etiqueta "Link pendiente" |

## Área docente (con clave)

`reservas.html` + `reservas.js` usan una API en Google Apps Script (`apps-script/Codigo.gs`) conectada a una planilla de Google. La clave se guarda en la planilla, no en la página. Las instrucciones de puesta en marcha están al principio de `Codigo.gs`; la URL de la aplicación web se pega en `URL_SCRIPT`, al principio de `reservas.js`.

## Páginas

- `index.html` – Inicio https://dot-aasistencia422-poite.github.io/pagina/
- `horarios.html` – Turnos y horarios de atención
- `novedades.html` – Noticias (lee `noticias.json`)
- `docentes.html` – Docentes y funcionarios
- `aviso-funcionarios.html` – Aviso de inasistencia (arma el correo)
- `espacios.html` – Espacios, familias y recursos
- `adscripcion.html` – Adscripción y aulas virtuales
- `biblioteca.html` – Biblioteca
- `ceibal.html` – Área POITE (Ceibal, sala de informática)
- `reservas.html` – Área docente con clave
