import assert from 'node:assert/strict';
const base = process.env.API_URL || 'http://localhost:8080/api/v1';
const resultados = [];
async function api(path, method = 'GET', body) {
  const respuesta = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  const texto = await respuesta.text();
  return { status: respuesta.status, body: texto ? JSON.parse(texto) : null };
}
const dto = { dni: '99010001', nombres: 'Ana', apellidos: 'Alvarez', email: 'lp2.ana@example.com', telefono: null, direccion: null, estado: true };
let r = await api('/clientes', 'POST', { ...dto, dni: '1234567' });
assert.equal(r.status,400);resultados.push('DNI inválido: 400');
const nombres = ['Ana','Bruno','Carla','Diego','Elena','Fabio','Gloria','Hugo','Irene','Jorge','Karen','Luis'];
const apellidos = ['Alvarez','Benitez','Castro','Diaz','Espinoza','Fernandez','Garcia','Herrera','Ibarra','Jimenez','Lopez','Mendoza'];
let cliente;
for(let i=0;i<nombres.length;i++) {
  const datos={...dto,dni:String(99010001+i),nombres:nombres[i],apellidos:apellidos[i],email:`lp2.${nombres[i].toLowerCase()}@example.com`};
  r=await api('/clientes','POST',datos);
  assert.ok([201,409].includes(r.status));
  if(i===0 && r.status===201) cliente=r.body;
}
resultados.push('12 clientes de ejemplo disponibles');
r=await api('/clientes?pagina=0&tamanio=5&ordenarPor=apellidos&direccion=asc');assert.equal(r.status,200);assert.equal(r.body.contenido.length,5);assert.ok(r.body.totalElementos>=12);resultados.push('Página 0, tamaño 5: 200');
cliente ??= r.body.contenido.find(c=>c.dni===dto.dni);
assert.ok(cliente,'Cliente de prueba no encontrado en la primera página');
r=await api('/clientes?pagina=1&tamanio=5&ordenarPor=apellidos&direccion=asc');assert.equal(r.body.pagina,1);assert.equal(r.body.contenido.length,5);resultados.push('Página siguiente: 200');
r=await api('/clientes?pagina=0&tamanio=20&ordenarPor=apellidos&direccion=desc');assert.equal(r.status,200);const descendente=r.body.contenido.map(c=>c.apellidos);
r=await api('/clientes?pagina=0&tamanio=20&ordenarPor=apellidos&direccion=asc');assert.deepEqual(descendente,[...r.body.contenido.map(c=>c.apellidos)].reverse());resultados.push('Orden ascendente y descendente correcto');
r=await api('/clientes','POST',dto);assert.equal(r.status,409);assert.ok(r.body.message);resultados.push('DNI repetido: 409 con mensaje');
r=await api('/clientes','POST',{...dto,dni:'99019999'});assert.equal(r.status,409);resultados.push('Correo repetido: 409');
r=await api(`/clientes/${cliente.id}`);assert.equal(r.status,200);assert.equal(r.body.telefono,null);assert.equal(r.body.direccion,null);resultados.push('Opcionales null y consulta por id: 200');
r=await api(`/clientes/${cliente.id}`,'PUT',{...dto,telefono:'987654321'});assert.equal(r.status,200);assert.equal(r.body.telefono,'987654321');resultados.push('Edición: 200');
r=await api(`/clientes/${cliente.id}`,'DELETE');assert.equal(r.status,204);
r=await api(`/clientes/${cliente.id}`);assert.equal(r.status,200);assert.equal(r.body.estado,false);resultados.push('Baja lógica: 204; cliente conservado e inactivo');
r=await api(`/clientes/${cliente.id}`,'DELETE');assert.equal(r.status,409);resultados.push('Baja repetida: 409');
r=await api(`/clientes/${cliente.id}`,'PUT',dto);assert.equal(r.status,200);resultados.push('Cliente de prueba restaurado a activo');
r=await api('/categorias');assert.equal(r.status,200);assert.ok(Array.isArray(r.body));resultados.push('Categorías mantiene listado: 200');
console.log(JSON.stringify({fecha:new Date().toISOString(),base,resultados},null,2));
