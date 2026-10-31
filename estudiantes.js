// novedades.js - Cartelera de novedades del Liceo 14
const NOVEDADES = [
    {
        titulo: "Relevamiento de continuidad estudiantes de 9no",
        fecha: "20 de octubre, 2026",
        contenido: "Ingreso con credenciales de CREA.<br>NO es una inscripción formal.",
        imagen: "",
        enlace: "https://fins.anep.edu.uy"
    },
    {
        titulo: "Encuesta a estudiantes de 9no sobre las asignaturas optativas de 1°EMS",
        fecha: "19 de octubre, 2026",
        contenido: `
		<a href="https://drive.google.com/file/d/1yEbEqpcCzfnJa-UIqKFLLHh-aN-n7owe/view?usp=drive_link" target="_blank"> <span>Instructivo estudiantes.</span>
        </a>
		<br>
		<a href="https://drive.google.com/file/d/1ZTkPo-nVGNHYo3bCBAiC6TP9YtQFb_Q1/view?usp=drive_link" target="_blank"> <span>Optativas 1EMS.</span>
        </a>
		`,
        imagen: "/images/QRencuesta.png",
        enlace: "http://aulas.ces.edu.uy/mod/questionnaire/view.php?id=119741"
    },
    {
        titulo: "Horarios Tutorías 2026",
        fecha: "3 de agosto, 2026",
        contenido: "",
        imagen: "https://lh3.googleusercontent.com/d/1Ndwd3rvDcQNVrwVptsOfdTedaj7fOjQr",
        enlace: ""
    },
	{
        titulo: "Organización de las actividades formativas y de esparcimiento",
        fecha: "11 de junio, 2026",
        contenido: "",
        imagen: "https://lh3.googleusercontent.com/d/1B_hwpBlpQK_fIKPhFSRdheJ12twSicXb",
        enlace: ""
    }
 ];

// Función para renderizar las novedades de forma dinámica
function cargarCarteleraNovedades() {
    const contenedor = document.getElementById("cartelera-dinamica");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    NOVEDADES.forEach(novedad => {
        const article = document.createElement("article");
        article.className = "post";

        let estructuraHtml = `
            <h3><i class="fa-solid fa-newspaper"></i> ${novedad.titulo}</h3>
            <p><small class="highlight-line"><i class="fa-regular fa-calendar"></i> ${novedad.fecha}</small></p>
            <br>
        `;

        if (novedad.imagen) {
            estructuraHtml += `
                <div class="post-content">
                    <div class="post-text">
                        <p>${novedad.contenido}</p>
                    </div>
                    <a href="${novedad.imagen}" target="_blank">
                        <img src="${novedad.imagen}" alt="Imagen de ${novedad.titulo}">
                    </a>
                </div>
            `;
        } else {
            estructuraHtml += `<p>${novedad.contenido}</p>`;
        }

        if (novedad.enlace) {
            estructuraHtml += `
                <br>
                <a href="${novedad.enlace}" class="btn-comment" ${novedad.enlace.startsWith('http') ? 'target="_blank"' : ''}> Leer más</a>
            `;
        }

        article.innerHTML = estructuraHtml;
        contenedor.appendChild(article);
    });
}

document.addEventListener("DOMContentLoaded", cargarCarteleraNovedades);
