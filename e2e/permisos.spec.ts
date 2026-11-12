import { expect, test } from '@playwright/test';
import { api, credenciales, iniciarSesion } from './apoyo';

test('almacén no ve Ventas y el acceso directo se deniega', async ({ page }) => {
  await iniciarSesion(page, 'almacen');
  await expect(page.getByRole('link', { name: 'Ventas', exact: true })).toHaveCount(0);
  await page.goto('/ventas');
  await expect(page.getByRole('heading', { name: /Acceso denegado/i })).toBeVisible();
});

test('vendedor ve Productos sin edición y no puede consultar auditoría', async ({ page, request }) => {
  await iniciarSesion(page, 'vendedor', '/productos');
  await expect(page.getByTestId('tabla-productos')).toBeVisible();
  await expect(page.getByRole('link', { name: /Nuevo producto|Editar/i })).toHaveCount(0);
  const headers = await credenciales(request, 'vendedor');
  expect((await request.get(`${api}/auditoria`, { headers })).status()).toBe(403);
});
