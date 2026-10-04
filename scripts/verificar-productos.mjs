import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import assert from 'node:assert/strict';
registerHooks({ resolve(s, c, next) {
  if (s.startsWith('.') && c.parentURL?.includes('/tmp/compiled/') && !s.endsWith('.js')) {
    const url = new URL(s + '.js', c.parentURL); if (existsSync(url)) return next(url.href, c);
  }
  return next(s, c);
} });
const { JSDOM } = await import('jsdom');
const dom = new JSDOM('<html><body></body></html>', { url: 'http://localhost:4200' });
for (const name of ['window', 'document', 'HTMLElement', 'Node', 'history']) globalThis[name] = dom.window[name];
await import('@angular/compiler');
const { TestBed } = await import('@angular/core/testing');
const { BrowserTestingModule, platformBrowserTesting } = await import('@angular/platform-browser/testing');
const { provideHttpClient } = await import('@angular/common/http');
const { provideHttpClientTesting, HttpTestingController } = await import('@angular/common/http/testing');
const { provideRouter, Router } = await import('@angular/router');
const { ProductoList } = await import('../tmp/compiled/app/features/productos/pages/producto-list/producto-list.js');
const { ProductoForm } = await import('../tmp/compiled/app/features/productos/pages/producto-form/producto-form.js');
TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
const categorias = [{ id: 1, nombre: 'Analgésicos', estado: true }, { id: 2, nombre: 'Histórica', estado: false }, { id: 3, nombre: 'Vitaminas', estado: true }];
const producto = { id: 1, nombre: 'Paracetamol', precio: 2.5, stock: 10, estado: true, categoriaId: 1, categoriaNombre: 'Analgésicos', fechaCreacion: '', fechaModificacion: null };
const pagina = { contenido: [producto], pagina: 0, tamanio: 10, totalElementos: 12, totalPaginas: 2, ultima: false };
let pruebas = 0;
function setup(componente) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ imports: [componente], providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()] });
  TestBed.inject(Router).navigate = async () => true;
  const fixture = TestBed.createComponent(componente);
  return { fixture, c: fixture.componentInstance, http: TestBed.inject(HttpTestingController) };
}
{
  const { fixture, c, http } = setup(ProductoList);
  http.expectOne(r => r.url.endsWith('/categorias')).flush(categorias);
  let req = http.expectOne(r => r.url.endsWith('/productos'));
  assert.equal(req.request.params.get('pagina'), '0'); assert.equal(req.request.params.get('ordenarPor'), 'nombre'); req.flush(pagina); pruebas++;
  c.ordenar('precio'); req = http.expectOne(r => r.params.get('direccion') === 'asc'); req.flush(pagina);
  c.ordenar('precio'); req = http.expectOne(r => r.params.get('direccion') === 'desc'); req.flush(pagina); pruebas++;
  c.cambiarTamanio('5'); req = http.expectOne(r => r.params.get('tamanio') === '5' && r.params.get('pagina') === '0'); req.flush({ ...pagina, totalPaginas: 3 });
  c.ir(1); req = http.expectOne(r => r.params.get('pagina') === '1'); req.flush({ ...pagina, pagina: 1, totalPaginas: 3 }); pruebas++;
  c.filtrar('3'); assert.equal(c.productos().length, 0); http.expectNone(r => r.url.endsWith('/productos')); c.filtrar(''); pruebas++;
  c.confirmar.set(producto); c.baja(); http.expectOne(r => r.method === 'DELETE').flush(null, { status: 204, statusText: 'No Content' });
  http.expectOne(r => r.method === 'GET').flush({ ...pagina, contenido: [{ ...producto, estado: false }] }); assert.equal(c.productos()[0].estado, false); pruebas++;
  c.cargar(); http.expectOne(r => r.method === 'GET').flush({ message: 'Sin conexión' }, { status: 500, statusText: 'Error' }); assert.equal(c.cargando(), false); assert.equal(c.error(), 'Sin conexión'); pruebas++;
  http.verify(); fixture.destroy();
}
{
  const { fixture, c, http } = setup(ProductoForm); fixture.detectChanges();
  http.expectOne(r => r.url.endsWith('/categorias')).flush(categorias);
  assert.deepEqual(c.opciones().map(x => x.id), [1, 3]); pruebas++;
  c.guardar(); http.expectNone(r => r.method === 'POST'); assert.match(c.mensajeCampo('categoriaId'), /obligatorio/); pruebas++;
  c.form.setValue({ nombre: ' Paracetamol ', precio: 2.5, stock: 1.5, estado: true, categoriaId: 1 }); c.guardar(); http.expectNone(r => r.method === 'POST'); assert.match(c.mensajeCampo('stock'), /entero/); pruebas++;
  c.form.controls.stock.setValue(10); c.guardar(); let req = http.expectOne(r => r.method === 'POST'); assert.equal(req.request.body.nombre, 'Paracetamol'); assert.equal(typeof req.request.body.categoriaId, 'number'); req.flush({ message: 'Nombre duplicado' }, { status: 409, statusText: 'Conflict' }); assert.equal(c.error(), 'Nombre duplicado'); pruebas++;
  fixture.componentRef.setInput('id', '1'); fixture.detectChanges();
  const getProducto = http.expectOne(r => r.url.endsWith('/productos/1')); getProducto.flush({ ...producto, categoriaId: 2, categoriaNombre: 'Histórica' });
  assert.equal(c.disponible(), false); http.expectOne(r => r.url.endsWith('/categorias')).flush(categorias);
  assert.equal(c.categoriaInactiva(), true); assert.deepEqual(c.opciones().map(x => x.id), [1, 2, 3]); c.guardar(); http.expectNone(r => r.method === 'PUT'); pruebas++;
  c.form.controls.categoriaId.setValue(3); assert.equal(c.categoriaInactiva(), false); c.guardar(); req = http.expectOne(r => r.method === 'PUT'); assert.equal(req.request.body.categoriaId, 3); req.flush({ ...producto, categoriaId: 3 }); pruebas++;
  http.verify(); fixture.destroy();
}
{
  const { fixture, c, http } = setup(ProductoForm); fixture.detectChanges(); http.expectOne(r => r.url.endsWith('/categorias')).flush([categorias[1]]);
  assert.equal(c.hayCategoriasActivas(), false); c.guardar(); http.expectNone(r => r.method === 'POST'); pruebas++;
  http.verify(); fixture.destroy();
}
console.log(`${pruebas} comprobaciones de Productos aprobadas (HTTP simulado; las capturas reales siguen pendientes).`);
