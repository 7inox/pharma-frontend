# Sesión 8 · CRUD dependiente de Productos

Fuentes leídas: guía práctica S8 (18 páginas) y diapositivas S8 (23 páginas), descargadas por el estudiante.

## Desarrollo

Productos incorpora categoría, paginación de servidor, orden por nombre/precio/stock, filtro de categoría sobre la página actual, formulario reactivo y baja lógica. El formulario carga categorías y producto con `forkJoin`; usa identificadores numéricos y bloquea categorías inactivas. Si la categoría original está inactiva, permanece visible con una advertencia. Si no hay categorías activas, ofrece un enlace para crear una.

El backend fue adaptado porque la copia original devolvía un arreglo y eliminaba productos físicamente. Ahora devuelve `PaginaResponseDTO`, restringe campos de orden, mantiene los inactivos y rechaza la eliminación de categorías con productos mediante 409. El nombre acepta 3 a 150 caracteres y el precio mínimo es 0.01. La asociación se carga mediante `EntityGraph`.

Las diapositivas indican expresamente que la API no rechaza categorías inactivas (página 12). Se conserva ese comportamiento para evaluarlo y documentarlo como hallazgo en el reto autónomo; la interfaz sí bloquea el envío.

## Validación realizada

Compilación Angular mediante `ngc`: aprobada.
13 comprobaciones con HTTP simulado: aprobadas. Comprueban parámetros de paginación, orden, filtro sin HTTP, baja y recarga, errores, categorías activas, formulario vacío, stock entero, duplicados, espera de ambas respuestas y edición de categoría inactiva.

Estas comprobaciones no sustituyen las pruebas reales ni las capturas Network.

Se inició además una copia del backend en el puerto 8082, conectada a la base existente. El GET real respondió 200 con la estructura paginada; la base no tenía productos. `javac` generó los archivos de clase, pero emitió una excepción de acceso al cerrar un JAR en este entorno; el backend pudo arrancar con esos archivos. Falta repetir la compilación habitual desde IntelliJ en el proyecto original.

## Matriz de capturas requerida por la guía

| Caso | Acción | Resultado esperado |
| --- | --- | --- |
| 01 | Abrir Productos | GET paginado 200 con nombre de categoría |
| 02 | Ordenar por precio dos veces | GET asc y desc |
| 03 | Tamaño 5 y siguiente página | GET pagina=1; etiqueta página 2 |
| 04 | Filtrar categoría | Cambian las filas; ninguna petición adicional |
| 05 | Abrir Nuevo producto | Solo categorías activas |
| 06 | Guardar vacío | Mensajes de validación; ningún POST |
| 07 | Registrar datos válidos | POST 201; listado con categoría |
| 08 | Registrar nombre duplicado en minúsculas | POST 409 y mensaje |
| 09 | Editar producto con categoría inactiva | Original visible; guardar bloqueado |
| 10 | Cambiar a categoría activa | PUT 200; categoría actualizada |
| 11 | Dar de baja | DELETE 204; fila inactiva y botón deshabilitado |
| 12 | Eliminar categoría con productos | DELETE categoría 409 y mensaje |

## Pendientes de ejecución real

Aplicar en los proyectos originales, reiniciar el backend, ejecutar las 12 pruebas con Network y preparar `Tinoco_LP2_S8_Practica.pdf`. El reto autónomo solicita además una matriz de altas, cambios y bajas válidas e inválidas con informe de hallazgos; las diapositivas fijan plazo 07/10/2026, 23:59, pero no contienen una rúbrica autónoma detallada.

El entorno original usa configuración de base de datos existente: no se han reemplazado credenciales ni añadido Flyway sin disponer del backend actualizado referido por la guía. Debe comprobarse ese requisito antes de dar por terminada la entrega.

Publicar `feature/productos-tinoco` y abrir PR hacia `develop` después de comprobar el funcionamiento. El script conserva Clientes como base si aún no se ha integrado en develop.
