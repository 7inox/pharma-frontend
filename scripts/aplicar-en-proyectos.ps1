param(
  [string]$Frontend = 'E:\Universidad\Cuarto Ciclo - 2026\Lenguaje de Programación II\2 Unidad\pharma-frontend_Tinoco\pharma-frontend',
  [string]$Backend = 'E:\Universidad\Cuarto Ciclo - 2026\Lenguaje de Programación II\1 Unidad\TareaS1-main\TareaS1-main'
)
$ErrorActionPreference = 'Stop'
$origen = Split-Path $PSScriptRoot -Parent
if (!(Test-Path -LiteralPath "$Frontend\angular.json") -or !(Test-Path -LiteralPath "$Backend\pom.xml")) { throw 'No se encontraron los dos proyectos. Revisa los parámetros Frontend y Backend.' }
Push-Location -LiteralPath $Frontend
try {
  if (git status --porcelain) { throw 'El frontend tiene cambios sin guardar en Git. Guarda esos cambios antes de aplicar esta actualización.' }
  git switch develop
  if ($LASTEXITCODE) { throw 'No se pudo abrir develop.' }
  git merge --ff-only feature/spa-categorias-tinoco
  if ($LASTEXITCODE) { throw 'No se pudo integrar la práctica en develop; revisa la divergencia.' }
  git switch -c feature/clientes-tinoco
  if ($LASTEXITCODE) { throw 'La rama Clientes ya existe o no pudo crearse. No se sobrescribió.' }
  $respaldo = Join-Path $Backend ('respaldo-clientes-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
  $backendArchivos = @(
    'src/main/java/pe/edu/upeu/Practica/controller/ClienteController.java',
    'src/main/java/pe/edu/upeu/Practica/service/service/ClienteService.java',
    'src/main/java/pe/edu/upeu/Practica/service/impl/ClienteServiceImpl.java',
    'src/main/java/pe/edu/upeu/Practica/dto/PaginaResponseDTO.java'
  )
  foreach ($relativo in $backendArchivos) {
    $destino = Join-Path $Backend $relativo
    if (Test-Path -LiteralPath $destino) {
      $copia = Join-Path $respaldo $relativo
      New-Item -ItemType Directory -Path (Split-Path $copia -Parent) -Force | Out-Null
      Copy-Item -LiteralPath $destino -Destination $copia
    }
    Copy-Item -LiteralPath (Join-Path "$origen/backend" $relativo) -Destination $destino -Force
  }
  $archivos = @(
    'src/app/core/models/pagina-response.ts',
    'src/app/app.routes.ts',
    'src/app/core/config/menu.ts'
  )
  foreach ($relativo in $archivos) { Copy-Item -LiteralPath (Join-Path $origen $relativo) -Destination (Join-Path $Frontend $relativo) -Force }
  Copy-Item -LiteralPath "$origen/src/app/features/clientes" -Destination "$Frontend/src/app/features" -Recurse
  git add src/app/core/models/pagina-response.ts src/app/features/clientes/models src/app/features/clientes/services
  git commit -m 'feat(clientes): agregar modelos y servicio paginado'
  if ($LASTEXITCODE) { throw 'No se pudo guardar el primer commit.' }
  git add src/app/features/clientes src/app/app.routes.ts src/app/core/config/menu.ts
  git commit -m 'feat(clientes): integrar listado y formulario con validaciones'
  if ($LASTEXITCODE) { throw 'No se pudo guardar el segundo commit.' }
  Copy-Item -LiteralPath "$origen/backend" -Destination $Frontend -Recurse
  Copy-Item -LiteralPath "$origen/scripts" -Destination $Frontend -Recurse
  New-Item -ItemType Directory -Path "$Frontend/docs" -Force | Out-Null
  Copy-Item -LiteralPath "$origen/docs/estado-clientes.md" -Destination "$Frontend/docs/estado-clientes.md"
  git add backend scripts docs/estado-clientes.md
  git commit -m 'feat(backend): agregar paginacion y baja logica de clientes'
  if ($LASTEXITCODE) { throw 'No se pudo guardar el tercer commit.' }
  npm run build
  if ($LASTEXITCODE) { throw 'La compilación no pasó. No se publicaron cambios.' }
  git push origin develop
  if ($LASTEXITCODE) { throw 'Falló la publicación de develop.' }
  git push -u origin feature/clientes-tinoco
  if ($LASTEXITCODE) { throw 'Falló la publicación de Clientes.' }
  Write-Host 'Cambios aplicados y publicados. Reinicia el backend en IntelliJ para cargar la paginación y baja lógica.'
  Write-Host 'Abre el pull request: https://github.com/7inox/pharma-frontend/compare/develop...feature/clientes-tinoco'
  Write-Host "Respaldo del backend: $respaldo"
} finally { Pop-Location }
