import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { api, captura, credenciales, iniciarSesion } from './apoyo';

test('E2E-08 una venta con stock agotado durante la selección muestra el 409', async ({ page, request }) => {
  const headers = await credenciales(request, 'admin');
  const vendedor = await credenciales(request, 'vendedor');
  const sufijo = randomUUID().slice(0, 8);
  const cat = await request.post(`${api}/categorias`, { headers, data: { nombre: 'S14 stock ' + sufijo, estado: true } });
  expect(cat.status()).toBe(201);
  const producto = { nombre: 'S14 stock ' + sufijo, categoriaId: (await cat.json()).id, precio: 3, stock: 3, estado: true };
  const alta = await request.post(`${api}/productos`, { headers, data: producto });
  expect(alta.status()).toBe(201);
  const { id } = await alta.json();
  await iniciarSesion(page, 'vendedor', '/ventas/nueva');
  await page.getByTestId('buscar-cliente').fill('Volumen');
  await page.getByTestId('opcion-cliente').first().click();
  await page.getByTestId('buscar-producto').fill(producto.nombre);
  await page.getByTestId('opcion-producto').click();
  await page.getByTestId('cantidad').fill('2');
  await page.getByRole('button', { name: 'Revisar venta' }).click();
  const cambio = await request.put(`${api}/productos/${id}`, { headers, data: { ...producto, stock: 1 } });
  expect(cambio.status()).toBe(200);
  const registro = page.waitForResponse(r => r.url() === `${api}/ventas` && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Confirmar venta' }).click();
  const rechazo = await registro;
  expect(rechazo.status()).toBe(409);
  await expect(page.getByRole('alert')).toContainText(/Stock insuficiente/);
  await expect(page).toHaveURL(/\/ventas\/nueva$/);
  const stock = await request.get(`${api}/productos/${id}`, { headers: vendedor });
  expect((await stock.json()).stock).toBe(1);
  const eventos = await request.get(`${api}/auditoria?accion=VENTA_REGISTRADA&tamanio=100`, { headers });
  expect((await eventos.json()).contenido).not.toContainEqual(expect.objectContaining({
    requestId: rechazo.headers()['x-request-id'],
  }));
});

test('E2E-09 una venta vacía no pasa del formulario y la API responde 400', async ({ page, request }) => {
  await iniciarSesion(page, 'vendedor', '/ventas/nueva');
  await page.getByTestId('buscar-cliente').fill('Volumen');
  await page.getByTestId('opcion-cliente').first().click();
  await page.getByRole('button', { name: 'Revisar venta' }).click();
  await expect(page.getByText(/Agregue al menos un producto/)).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const headers = await credenciales(request, 'vendedor');
  const clientes = await request.get(`${api}/clientes/activos?q=Volumen`, { headers });
  const clienteId = (await clientes.json()).contenido[0].id;
  expect((await request.post(`${api}/ventas`, { headers, data: { clienteId, detalles: [] } })).status()).toBe(400);
});

test('E2E-12 admin consulta ventas, filtra fechas y conserva la página de auditoría', async ({ page, request }, info) => {
  const headers = await credenciales(request, 'admin');
  const r = await request.get(`${api}/auditoria?usuario=vendedor&accion=VENTA_REGISTRADA&tamanio=100`, { headers });
  expect(r.status()).toBe(200);
  const evento = (await r.json()).contenido[0];
  expect(evento?.requestId).toBeTruthy();
  const dia = evento.fecha.slice(0, 10);
  await iniciarSesion(page, 'admin', '/auditoria?tamanio=1');
  await expect(page.getByRole('link', { name: 'Auditoría', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.getByTestId('pagina-actual')).toHaveText(/Página 2 de/);
  await page.getByLabel('Usuario', { exact: true }).fill('vendedor');
  await page.getByLabel('Acción', { exact: true }).selectOption('VENTA_REGISTRADA');
  await page.getByLabel('Desde', { exact: true }).fill(dia);
  await page.getByLabel('Hasta', { exact: true }).fill(dia);
  await page.getByRole('button', { name: 'Aplicar filtros' }).click();
  await expect(page.getByTestId('tabla-auditoria')).toContainText(evento.requestId);
  await expect(page).toHaveURL(/pagina=0.*usuario=vendedor.*accion=VENTA_REGISTRADA/);
  await page.reload();
  await expect(page.getByTestId('tabla-auditoria')).toContainText(evento.requestId);
  await expect(page.getByLabel('Desde', { exact: true })).toHaveValue(dia);
  await captura(page, info, 'auditoria-venta');
});

test('E2E-13 vendedor no puede abrir Auditoría desde el menú, URL ni API', async ({ page, request }, info) => {
  await iniciarSesion(page, 'vendedor');
  await expect(page.getByRole('link', { name: 'Auditoría', exact: true })).toHaveCount(0);
  await page.goto('/auditoria');
  await expect(page.getByRole('heading', { name: /Acceso denegado/i })).toBeVisible();
  const headers = await credenciales(request, 'vendedor');
  expect((await request.get(`${api}/auditoria`, { headers })).status()).toBe(403);
  await captura(page, info, 'auditoria-denegada');
});

test('E2E-15 altas de clientes y bajas de categorías aparecen con su petición', async ({ page, request }, info) => {
  const headers = await credenciales(request, 'admin');
  const vendedor = await credenciales(request, 'vendedor');
  const sufijo = randomUUID().slice(0, 8);
  const cliente = await request.post(`${api}/clientes`, { headers: vendedor, data: {
    nombres: 'Cliente', apellidos: 'Autonoma ' + sufijo, dni: String(94000000 + parseInt(sufijo, 16) % 1000000),
    email: `autonoma-${sufijo}@demo.invalid`, estado: true,
  } });
  expect(cliente.status()).toBe(201);
  const categoria = await request.post(`${api}/categorias`, { headers, data: { nombre: 'Temporal ' + sufijo, estado: true } });
  expect(categoria.status()).toBe(201);
  const categoriaId = (await categoria.json()).id;
  const baja = await request.delete(`${api}/categorias/${categoriaId}`, { headers });
  expect(baja.status()).toBe(204);
  await iniciarSesion(page, 'admin', '/auditoria?accion=CLIENTE_REGISTRADO');
  const tabla = page.getByTestId('tabla-auditoria');
  await expect(tabla).toContainText(cliente.headers()['x-request-id']);
  await expect(tabla).not.toContainText(sufijo);
  await captura(page, info, 'evento-cliente');
  await page.getByLabel('Acción', { exact: true }).selectOption('CATEGORIA_ELIMINADA');
  await page.getByRole('button', { name: 'Aplicar filtros' }).click();
  await expect(tabla).toContainText(baja.headers()['x-request-id']);
  await expect(tabla).toContainText('Temporal ' + sufijo);
  await captura(page, info, 'evento-categoria');
});
