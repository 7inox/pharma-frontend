import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import assert from 'node:assert/strict';
registerHooks({ resolve(specifier, context, next) {
  if (specifier.startsWith('.') && context.parentURL?.includes('/tmp/compiled/') && !specifier.endsWith('.js')) {
    const url = new URL(specifier + '.js', context.parentURL);
    if (existsSync(url)) return next(url.href, context);
  }
  return next(specifier, context);
} });
const { JSDOM } = await import('jsdom');
const dom = new JSDOM('<html><body></body></html>', { url: 'http://localhost:4200' });
globalThis.window = dom.window; globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement; globalThis.Node = dom.window.Node;
await import('@angular/compiler');
const { TestBed } = await import('@angular/core/testing');
const { BrowserTestingModule, platformBrowserTesting } = await import('@angular/platform-browser/testing');
const { provideHttpClient } = await import('@angular/common/http');
const { provideHttpClientTesting, HttpTestingController } = await import('@angular/common/http/testing');
const { provideRouter, Router } = await import('@angular/router');
const { ClienteList } = await import('../tmp/compiled/app/features/clientes/pages/cliente-list/cliente-list.js');
const { ClienteForm } = await import('../tmp/compiled/app/features/clientes/pages/cliente-form/cliente-form.js');
TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
const cliente = { id: 1, dni: '71234567', nombres: 'Ana', apellidos: 'Tinoco', email: 'ana@example.com', telefono: null, direccion: null, estado: true, fechaCreacion: '', fechaModificacion: null };
const pagina = { contenido: [cliente], pagina: 0, tamanio: 10, totalElementos: 12, totalPaginas: 2, ultima: false };
let pruebas = 0;
function setup(componente) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ imports: [componente], providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()] });
  TestBed.inject(Router).navigate = async () => true;
  const fixture = TestBed.createComponent(componente);
  return { fixture, c: fixture.componentInstance, http: TestBed.inject(HttpTestingController) };
}
{
  const {fixture,c,http} = setup(ClienteList);
  let req = http.expectOne(r => r.url.endsWith('/clientes'));
  assert.equal(req.request.params.get('pagina'), '0'); req.flush(pagina); pruebas++;
  c.filtro.set('TINOCO'); assert.equal(c.filtradas().length, 1);
  c.filtro.set('234'); assert.equal(c.filtradas().length, 1); http.expectNone(r => r.url.endsWith('/clientes')); pruebas++;
  c.cambiarTamanio('5'); req = http.expectOne(r => r.params.get('tamanio') === '5' && r.params.get('pagina') === '0'); req.flush({...pagina,tamanio:5,totalPaginas:3});
  c.cambiarPagina(1); req=http.expectOne(r=>r.params.get('pagina')==='1');req.flush({...pagina,pagina:1,tamanio:5,totalPaginas:3});pruebas++;
  c.ordenar('apellidos'); req=http.expectOne(r=>r.params.get('direccion')==='desc');req.flush(pagina);
  c.ordenar('apellidos'); req=http.expectOne(r=>r.params.get('direccion')==='asc');req.flush(pagina);pruebas++;
  c.pendiente.set(cliente);c.confirmarEliminar();req=http.expectOne(r=>r.method==='DELETE');req.flush(null,{status:204,statusText:'No Content'});
  req=http.expectOne(r=>r.method==='GET');req.flush({...pagina,contenido:[{...cliente,estado:false}]});assert.equal(c.clientes()[0].estado,false);pruebas++;
  c.pendiente.set({...cliente,estado:false});c.confirmarEliminar();req=http.expectOne(r=>r.method==='DELETE');req.flush({message:'El cliente ya está inactivo.'},{status:409,statusText:'Conflict'});assert.match(c.error(),/inactivo/);pruebas++;
  c.cargar();req=http.expectOne(r=>r.method==='GET');req.flush({message:'Error de prueba'},{status:500,statusText:'Error'});assert.equal(c.cargando(),false);assert.equal(c.error(),'Error de prueba');pruebas++;
  c.cargar();req=http.expectOne(r=>r.method==='GET');req.flush({...pagina,contenido:[],totalElementos:0,totalPaginas:0,ultima:true});assert.equal(c.clientes().length,0);pruebas++;
  http.verify();fixture.destroy();
}
{
  const {fixture,c,http}=setup(ClienteForm);fixture.detectChanges();
  c.form.setValue({dni:'1234567',nombres:'Ana',apellidos:'Tinoco',email:'ana@example.com',telefono:'',direccion:'',estado:true});c.guardar();http.expectNone(r=>r.method==='POST');assert.match(c.mensajeCampo('dni'),/8 dígitos/);pruebas++;
  c.form.controls.dni.setValue('71234567');c.guardar();let req=http.expectOne(r=>r.method==='POST');assert.equal(req.request.body.telefono,null);assert.equal(req.request.body.direccion,null);req.flush({message:'DNI repetido'},{status:409,statusText:'Conflict'});assert.equal(c.error(),'DNI repetido');pruebas++;
  fixture.componentRef.setInput('id','1');fixture.detectChanges();req=http.expectOne(r=>r.method==='GET');req.flush(cliente);assert.equal(c.form.controls.dni.value,cliente.dni);c.form.controls.telefono.setValue('987654321');c.guardar();req=http.expectOne(r=>r.method==='PUT');assert.equal(req.request.body.telefono,'987654321');req.flush({...cliente,telefono:'987654321'});pruebas++;
  http.verify();fixture.destroy();
}
console.log(`${pruebas} comprobaciones de Clientes aprobadas (HTTP simulado; no sustituyen capturas contra el backend).`);
