import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { api, captura, credenciales, iniciarSesion } from './apoyo';

test('el vendedor registra una venta que actualiza stock, reporte y auditoría', async ({ page, request, browser }, info) => {
  const headers = await credenciales(request, 'admin');
  const vendedor = await credenciales(request, 'vendedor');
  const sufijo = randomUUID().slice(0, 8);
  const categoria = await request.post(`${api}/categorias`, {
    headers, data: { nombre: `S14 E2E ${sufijo}`, estado: true },
  });
  expect(categoria.status()).toBe(201);
  const categoriaId = (await categoria.json()).id;
  const nombre = `Paracetamol S14 ${sufijo}`;
  const producto = { nombre, categoriaId, precio: 3.5, stock: 10, estado: true };
  const creado = await request.post(`${api}/productos`, { headers, data: producto });
  expect(creado.status()).toBe(201);
  const { id: productoId, creadoPor } = await creado.json();
  expect(creadoPor).toBe('admin');

  const editado = await request.put(`${api}/productos/${productoId}`, {
    headers, data: { ...producto, precio: 4.5 },
  });
  expect(editado.status()).toBe(200);
  expect(await editado.json()).toMatchObject({ modificadoPor: 'admin', precio: 4.5 });
  const cambios = await request.get(`${api}/auditoria?accion=PRECIO_MODIFICADO&tamanio=20`, { headers });
  expect((await cambios.json()).contenido).toContainEqual(expect.objectContaining({
    entidadId: productoId, detalle: expect.stringMatching(/3\.50? -> 4\.5/),
    requestId: editado.headers()['x-request-id'],
  }));

  for (const [etiqueta, datos] of [['sin stock', { stock: 0 }], ['inactivo', { estado: false }]] as const) {
    const respuesta = await request.post(`${api}/productos`, {
      headers, data: { ...producto, ...datos, nombre: `${nombre} ${etiqueta}` },
    });
    expect(respuesta.status()).toBe(201);
  }

  await iniciarSesion(page, 'vendedor', '/ventas/nueva');
  const cliente = await request.post(`${api}/clientes`, { headers: vendedor, data: {
    nombres: 'Cliente', apellidos: `Mamani ${sufijo}`,
    dni: String(92000000 + parseInt(sufijo, 16) % 1000000),
    email: `s14-${sufijo}@demo.invalid`, estado: true,
  } });
  expect(cliente.status()).toBe(201);
  const clienteId = (await cliente.json()).id;
  const errores: string[] = [];
  page.on('pageerror', e => errores.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
  page.on('response', r => { if (r.status() >= 500) errores.push(`HTTP ${r.status()} ${r.url()}`); });

  await page.getByTestId('buscar-cliente').fill(`Mamani ${sufijo}`);
  await page.getByTestId('opcion-cliente').click();
  await page.getByTestId('buscar-producto').fill(nombre);
  const opcion = page.getByTestId('opcion-producto');
  await expect(opcion).toHaveCount(1);
  await expect(opcion).toContainText(/4[.,]50/);
  const stock = Number(await opcion.getAttribute('data-stock'));
  expect(stock).toBeGreaterThanOrEqual(2);
  await captura(page, info, 'stock-antes');
  const paginaCatalogo = `${api}/productos?pagina=0&tamanio=20&ordenarPor=nombre&direccion=asc&categoriaId=${categoriaId}`;
  for (let i = 0; i < 2; i++) {
    const previa = await request.get(paginaCatalogo, { headers: vendedor });
    expect((await previa.json()).contenido).toContainEqual(expect.objectContaining({ id: productoId, stock }));
  }
  await opcion.click();
  await page.getByTestId('cantidad').fill('2');
  await expect(page.getByTestId('total-venta')).toContainText(/9[.,]00/);
  await page.getByRole('button', { name: 'Revisar venta' }).click();
  const registro = page.waitForResponse(r => r.url() === `${api}/ventas` && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Confirmar venta' }).click();
  const respuesta = await registro;
  expect(respuesta.status()).toBe(201);
  const venta = await respuesta.json();
  expect(venta).toMatchObject({ clienteId, creadoPor: 'vendedor', total: 9 });
  await expect(page.getByRole('heading', { name: /Comprobante/ })).toBeVisible();
  await captura(page, info, 'comprobante');
  await page.getByRole('link', { name: 'Productos', exact: true }).click();
  await page.getByLabel('Filtrar por categoría').selectOption(String(categoriaId));
  const fila = page.getByRole('row').filter({ has: page.getByRole('cell', { name: nombre, exact: true }) });
  await expect(fila.getByTestId('stock-producto')).toHaveText(String(stock - 2));
  await captura(page, info, 'stock-despues');

  const reporte = await request.get(`${api}/reportes/productos-mas-vendidos`, { headers });
  expect(reporte.status()).toBe(200);
  expect(await reporte.json()).toContainEqual(expect.objectContaining({ productoId, cantidadVendida: 2, montoTotal: 9 }));
  expect(errores).toEqual([]);
  const administrador = await browser.newPage({ baseURL: 'http://localhost:4200' });
  try {
    await iniciarSesion(administrador, 'admin');
    const filaReporte = administrador.getByRole('row').filter({
      has: administrador.getByRole('cell', { name: nombre, exact: true }),
    });
    await expect(filaReporte.getByRole('cell', { name: '2', exact: true })).toBeVisible();
    await captura(administrador, info, 'reporte-admin');
  } finally {
    await administrador.close();
  }

  const auditoria = await request.get(`${api}/auditoria?accion=VENTA_REGISTRADA&usuario=vendedor&tamanio=20`, { headers });
  expect(auditoria.status()).toBe(200);
  const evento = (await auditoria.json()).contenido.find((e: { entidadId: number }) => e.entidadId === venta.id);
  expect(evento).toMatchObject({ usuario: 'vendedor', requestId: respuesta.headers()['x-request-id'] });
  await info.attach('auditoria-venta', { body: JSON.stringify(evento, null, 2), contentType: 'application/json' });
  expect(errores).toEqual([]);
});
