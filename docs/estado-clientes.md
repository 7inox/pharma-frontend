# Módulo Clientes — Sesión 7

Implementación realizada el 4 de octubre de 2026. El PDF del entregable se prepara después de la revisión visual, según la instrucción del estudiante.

## Implementado

- Modelos Cliente, ClienteRequest y PaginaResponse<T>.
- Cinco operaciones HTTP en ClienteService usando environment.apiUrl.
- Listado con signals, paginación, tamaños 5/10/20, orden DNI/apellidos y filtro computed de la página actual.
- Formulario de registro/edición, validadores, mensajes del backend y opcionales vacíos convertidos en null.
- Confirmación de baja, recarga y conservación del cliente inactivo.
- Rutas diferidas con loadChildren y menú centralizado.
- Adaptación del backend TareaS1 en backend/: listado paginado, orden estable y baja lógica con conflicto 409 al repetirla.
- Configuración del backend preparada con DB_URL, DB_USERNAME y DB_PASSWORD; no contiene credenciales del equipo.

## Verificación realizada

- TypeScript y compilador de plantillas Angular (ngc): aprobados.
- 11 comprobaciones de componentes y peticiones HTTP simuladas: aprobadas mediante scripts/verificar-clientes.mjs.
- Backend actualizado iniciado en localhost:8081, conectado a Oracle.
- API real: DNI inválido 400; registro 201; duplicados de DNI y correo 409; páginas 0 y 1 de tamaño 5; orden ascendente/descendente; consulta 200; edición 200; baja 204 conservando registro; baja repetida 409; Categorías GET 200.
- Se registraron 12 clientes de ejemplo con correos example.com. El cliente usado en la prueba de baja se restauró a activo.

## Límites pendientes

- El frontend abierto en E: y el backend original en 8080 todavía no tienen estos cambios: la sesión solo permite escribir en el directorio de trabajo.
- ng build y ng test no pudieron ejecutarse completamente porque esbuild recibe Access denied al resolver directorios. ngc y las pruebas directas sí se ejecutaron.
- javac generó las clases y el servidor actualizado ejecutó correctamente las operaciones, pero el proceso compilador termina con AccessDeniedException al cerrar archivos JAR. Maven package también tiene dependencias de plugins que faltan en su caché y no puede descargarlas en esta sesión.
- No se capturaron todavía los once casos del navegador con Network visible.
- GitHub no fue modificado: git no tiene salida de red y el conector requiere una aprobación que la política de la sesión no permite.
- Los commits locales usan la fecha real del trabajo: todos son del 4 de octubre. No cumplen el requisito de días distintos; no se alteraron sus fechas.
- Pull request e informe PDF pendientes.

## Reproducir pruebas

```powershell
npx ngc -p tsconfig.app.json --rootDir src --outDir tmp/compiled
node scripts/verificar-clientes.mjs
$env:API_URL = 'http://localhost:8080/api/v1'
node scripts/verificar-api-clientes.mjs
```

La prueba de API crea/reutiliza los 12 clientes de ejemplo, modifica y da de baja al primero, y lo restaura al finalizar correctamente. Ejecútala solo con la API actualizada.

## Aplicar cambios a las carpetas originales

Ejecutar scripts/aplicar-en-proyectos.ps1 desde PowerShell del usuario. El script verifica que Git esté limpio, integra la práctica en develop, crea la rama Clientes, respalda los cuatro archivos Java que modifica, copia el módulo, compila y publica solo si el build pasa. La configuración privada del backend se conserva. Si la rama ya existe o hay divergencia, se detiene sin forzar Git.

La copia completa del backend en backend/ permite revisar los cambios; para iniciarla por separado deben definirse las variables DB_URL, DB_USERNAME y DB_PASSWORD y ejecutarse mvnw.cmd spring-boot:run desde backend. Para usar la carpeta original, reiniciar el servidor de IntelliJ después de aplicar los cuatro archivos.
