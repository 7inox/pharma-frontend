import { expect, test } from '@playwright/test';
import { captura, iniciarSesion } from './apoyo';

test('Productos y Ventas paginan en Oracle y conservan su estado en la URL', async ({ page }, info) => {
  await iniciarSesion(page, 'admin', '/productos');
  const filas = page.getByTestId('tabla-productos').locator('tbody tr');
  await expect(filas).toHaveCount(20);
  await expect(page.getByTestId('pagina-actual')).toHaveText(/Página 1 de \d+/);
  const respuesta = page.waitForResponse(r => r.url().includes('/api/v1/productos?pagina=1&'));
  await page.getByRole('button', { name: 'Siguiente' }).click();
  expect((await respuesta).status()).toBe(200);
  await expect(page).toHaveURL(/pagina=1/);
  await page.reload();
  await expect(page.getByTestId('pagina-actual')).toHaveText(/Página 2 de/);
  await page.getByTestId('pagina-actual').scrollIntoViewIfNeeded();
  await captura(page, info, 'productos-pagina-2');
  await page.getByLabel('Filas').selectOption('50');
  await expect(filas).toHaveCount(50);
  await expect(page).toHaveURL(/pagina=0.*tamanio=50/);
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.getByTestId('pagina-actual')).toHaveText(/Página 2 de/);
  await page.getByRole('button', { name: /Precio/ }).click();
  await expect(page.getByTestId('pagina-actual')).toHaveText(/Página 1 de/);
  await expect(page).toHaveURL(/orden=precio/);

  await page.goto('/ventas?pagina=4');
  await expect(page.getByTestId('pagina-actual')).toHaveText(/Página 5 de/);
  await page.getByLabel('Desde', { exact: true }).fill('2026-11-01');
  await page.getByLabel('Hasta', { exact: true }).fill('2026-11-12');
  const ventas = page.waitForResponse(r => r.url().includes('/api/v1/ventas/buscar?pagina=0&'));
  await page.getByRole('button', { name: 'Buscar ventas' }).click();
  expect((await ventas).status()).toBe(200);
  await expect(page).toHaveURL(/pagina=0.*desde=2026-11-01.*hasta=2026-11-12/);
  await expect(page.getByTestId('pagina-actual')).toHaveText(/Página 1 de/);
  await page.getByTestId('pagina-actual').scrollIntoViewIfNeeded();
  await captura(page, info, 'ventas-filtro-fechas');
});
