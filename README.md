# PharmaSoft — práctica LP II, sesión 7

**Autor:** Miguel Ángel Tinoco López  
**Proyecto:** `pharma-frontend`  
**Rama:** `feature/spa-categorias-tinoco`

SPA Angular para administrar categorías usando el backend Spring Boot del proyecto Practica.

## Ejecutar

Abre esta carpeta en Visual Studio Code. En su terminal:

```powershell
npm.cmd install
npm.cmd run build
npm.cmd start
```

Abre http://localhost:4200. Usa Angular Language Service como extensión de VS Code (`Angular.ng-template`).

Antes de probar el CRUD, ejecuta el backend original desde IntelliJ. Debe responder en http://localhost:8080/api/v1/categorias y permitir CORS desde http://localhost:4200.
La base Oracle del backend está configurada en localhost:1522/FREEPDB1. El frontend no contiene credenciales.

## Arquitectura

| Carpeta | Responsabilidad |
|---|---|
| core/config | Menú centralizado |
| core/models y core/utils | Contrato y mensajes de error HTTP |
| shared/pages | Página 404 |
| layout | Encabezado, menú lateral y contenedor de rutas |
| features/inicio | Página inicial |
| features/categorias/models | Contratos de entrada y salida |
| features/categorias/services | Cinco operaciones HTTP |
| features/categorias/pages | Listado y formulario reactivo |
| environments | URL de la API |

El servicio concentra las peticiones; los componentes gestionan la vista con signals.
El filtro usa computed y no vuelve a consultar la API.
La misma página permite crear y editar. El parámetro id llega mediante withComponentInputBinding.
Las validaciones coinciden con el DTO: nombre obligatorio de 3 a 50 caracteres, descripción opcional hasta 200 y estado booleano.

## Rutas

- `/inicio`: página principal.
- `/categorias`: listado.
- `/categorias/nuevo`: registro.
- `/categorias/:id/editar`: edición.
- Cualquier otra ruta: página 404.

## Verificación pendiente

Se revisó el contrato del backend original y la sintaxis TypeScript.
La instalación npm quedó bloqueada por la restricción de red del entorno de trabajo: EACCES al conectar a registry.npmjs.org.
**La compilación Angular y las pruebas del navegador todavía no se han ejecutado.**
No se han creado capturas ficticias ni un PDF que afirme pruebas no realizadas.

La copia original del backend no se renombró ni se modificó. Su nombre Practica no impide consumir la API.

## Diferencias del backend respecto de la guía

- CORS ya autoriza localhost:4200.
- Registra categorías duplicadas con respuesta 409.
- El método de actualización no comprueba nombres duplicados.
- El método de eliminación no comprueba productos relacionados ni convierte esa situación explícitamente en error 409.
- Usa Hibernate ddl-auto update; no tiene las migraciones Flyway descritas en la guía.

Para la prueba 8 se necesita el backend actualizado del docente o corregir esa regla de negocio. El frontend presenta los mensajes que devuelve el servidor, pero no puede cambiar los códigos HTTP del backend.

## Evidencias requeridas

Guarda una captura de cada prueba en el orden siguiente, con la pestaña Red cuando corresponda:

| N.º | Prueba | Resultado esperado |
|---|---|---|
| 1 | Abrir localhost:4200 | Redirige a Inicio; opción activa |
| 2 | Abrir Categorías | Datos de Swagger, GET 200 |
| 3 | Buscar por parte del nombre | Filtra sin nuevas peticiones |
| 4 | Registrar nombre An | Validación local; no envía petición |
| 5 | Registrar nombre existente | POST 409 y mensaje del backend |
| 6 | Registrar categoría válida | POST 201 y nueva fila |
| 7 | Editar y desactivar | PUT 200; estado Inactivo |
| 8 | Eliminar categoría con productos | DELETE 409; requiere backend actualizado |
| 9 | Eliminar categoría sin productos | DELETE 204 y fila eliminada |
| 10 | Apagar backend y recargar | Mensaje de falta de conexión |
| 11 | Abrir /xyz | Página 404 |
| 12 | Pulsar ☰ | Oculta y muestra sidebar sin recarga |

Documento final: `Tinoco_LP2_S7_Practica.pdf`.
El módulo Clientes corresponde al reto autónomo; no forma parte de esta implementación de Categorías.

## Publicar el repositorio cuando esté verificado

El repositorio local ya contiene main, develop y la rama de funcionalidad, con commits por cada etapa.
Todavía no tiene remoto ni se ha publicado en GitHub.
Crea un repositorio vacío llamado pharma-frontend y configura:

```powershell
git remote add origin https://github.com/7inox/pharma-frontend.git
git push -u origin main
git push -u origin develop
git push -u origin feature/spa-categorias-tinoco
```

