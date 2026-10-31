/**
 * Funciones auxilares
 */

	function mostrarSeccion(idSeccion) {
		// 1. Buscamos todas las secciones que tienen la clase 'seccion-familia'
		const secciones = document.querySelectorAll('.seccion');
		
		// 2. Las ocultamos todas
		secciones.forEach(sec => {
			sec.style.display = 'none';
		});
		
		// 3. Mostramos solo la que nos interesa
		const seccionAMostrar = document.getElementById(idSeccion);
		if (seccionAMostrar) {
			seccionAMostrar.style.display = 'block';
			
			// Opcional: Hacer scroll suave hasta la sección para que el usuario note el cambio
			seccionAMostrar.scrollIntoView({ behavior: 'smooth' });
		}
	}
	
	// Oculta todos los contenidos adicionales
	function ocultarTodo() {
		const secciones = document.querySelectorAll('.seccion');
		secciones.forEach(sec => {
			sec.style.display = 'none';
		});
		
		// Opcional: Vuelve al inicio de la página suavemente
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}