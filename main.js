document.addEventListener("DOMContentLoaded", function () {
    // 1. Cargar la barra de navegación de forma dinámica
    const navbarContainer = document.getElementById("main-navbar");
    if (navbarContainer) {
        fetch("navbar.html")
            .then(response => {
                if (!response.ok) throw new Error("Error al cargar la barra de navegación");
                return response.text();
            })
            .then(data => {
                navbarContainer.innerHTML = data;
            })
            .catch(error => console.error(error));
    }

    // 2. Cargar el pie de página (Footer) de forma dinámica
    const footerContainer = document.getElementById("main-footer");
    if (footerContainer) {
        fetch("footer.html")
            .then(response => {
                if (!response.ok) throw new Error("Error al cargar el footer");
                return response.text();
            })
            .then(data => {
                footerContainer.innerHTML = data;
            })
            .catch(error => console.error(error));
    }

    // 3. Sección de noticias
    const noticiaTitulo = document.getElementById("noticia-titulo");
    const noticiaContenido = document.getElementById("noticia-contenido");
    const noticiaImagenContainer = document.getElementById("noticia-imagen-container");
    const noticiaImagen = document.getElementById("noticia-imagen");
    const noticiaEnlace = document.getElementById("noticia-enlace");

    if (noticiaTitulo) {
        let noticias = [];
        let indiceActual = 0;

        fetch("noticias.json")
            .then(response => {
                if (!response.ok) throw new Error("No se pudo cargar el archivo de noticias.");
                return response.json();
            })
            .then(data => {
                noticias = data;
                if (noticias.length > 0) {
                    mostrarNoticia(indiceActual);
                    setInterval(rotarNoticia, 5000);
                } else {
                    noticiaTitulo.textContent = "No hay noticias cartelera en este momento.";
                }
            })
            .catch(error => {
                console.error(error);
                noticiaTitulo.textContent = "Cartelera de novedades temporariamente no disponible.";
            });

        function mostrarNoticia(index) {
            const item = noticias[index];
            
            noticiaTitulo.textContent = item.titulo;
            noticiaContenido.textContent = item.contenido;

            if (item.imagen && item.imagen.trim() !== "") {
                noticiaImagen.src = item.imagen;
                noticiaImagenContainer.style.display = "flex";
            } else {
                noticiaImagenContainer.style.display = "none";
                noticiaImagen.src = "";
            }

            if (item.enlace && item.enlace.trim() !== "") {
                noticiaEnlace.href = item.enlace;
                noticiaEnlace.style.display = "inline-flex";
            } else {
                noticiaEnlace.style.display = "none";
                noticiaEnlace.href = "#";
            }

            const accionesContenedor = document.getElementById("noticia-acciones");
            let btnLsuExistente = document.getElementById("noticia-btn-lsu");

            if (item.lsu && item.lsu.trim() !== "") {
                if (!btnLsuExistente) {
                    btnLsuExistente = document.createElement("button");
                    btnLsuExistente.id = "noticia-btn-lsu";
                    btnLsuExistente.type = "button";
                    btnLsuExistente.className = "btn-lsu";
                    btnLsuExistente.innerHTML = `<img src="images/lsu.png" alt="Lengua de Señas Uruguaya (LSU)">`;
                    accionesContenedor.appendChild(btnLsuExistente);
                }
                btnLsuExistente.onclick = function () {
                    abrirModalLSU(item.lsu);
                };
                btnLsuExistente.style.display = "inline-flex";
            } else if (btnLsuExistente) {
                btnLsuExistente.style.display = "none";
            }
        } // <--- Cierre correcto de la función mostrarNoticia

        function rotarNoticia() {
            indiceActual = (indiceActual + 1) % noticias.length;
            mostrarNoticia(indiceActual);
        }
    }
});

// ==========================================
// Control del Modal de Lengua de Señas (LSU)
// ==========================================
function abrirModalLSU(youtubeId) {
    const modal = document.getElementById("modal-lsu");
    const iframe = document.getElementById("iframe-lsu");
    
    if (!modal || !iframe || !youtubeId) return;

    // Usar youtube-nocookie.com evita bloqueos de políticas de referencia y cookies
    iframe.src = `https://www.youtube-nocookie.com/embed/${youtubeId.trim()}?autoplay=1`;
    modal.style.display = "flex";
}

function cerrarModalLSU() {
    const modal = document.getElementById("modal-lsu");
    const iframe = document.getElementById("iframe-lsu");
    
    if (iframe) iframe.src = ""; // Detener la reproducción del video
    if (modal) modal.style.display = "none";
}

// Cerrar el modal al hacer clic fuera del contenido
window.addEventListener("click", function(event) {
    const modal = document.getElementById("modal-lsu");
    if (event.target === modal) {
        cerrarModalLSU();
    }
});