import { expect, test } from '@playwright/test';
import { ingresar, iniciarSesion } from './apoyo';

test('una ruta protegida conserva el destino en returnUrl', async ({ page }) => {
  await page.goto('/ventas');
  await expect(page).toHaveURL(/\/login\?returnUrl=%2Fventas/);
});

test('credenciales incorrectas muestran el mensaje de la API', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Usuario', { exact: true }).fill('admin');
  await page.getByLabel('Contraseña', { exact: true }).fill('intento-incorrecto-e2e');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByRole('alert')).toContainText(/usuario o contraseña incorrectos/i);
});

test('tras iniciar sesión o recibir un 401 se recupera la ruta solicitada', async ({ page }) => {
  await iniciarSesion(page, 'vendedor', '/ventas');
  await expect(page).toHaveURL(/\/ventas$/);
  await page.getByRole('link', { name: 'Nueva venta' }).click();
  await page.route('**/api/v1/clientes/activos?*', route => route.fulfill({
    status: 401,
    json: { message: 'Token expirado' },
  }), { times: 1 });
  await page.getByTestId('buscar-cliente').fill('Volumen');
  await expect(page).toHaveURL(/\/login\?.*returnUrl=%2Fventas%2Fnueva/);
  await expect(page.getByRole('status')).toContainText(/sesión expiró/i);
  await ingresar(page, 'vendedor');
  await expect(page).toHaveURL(/\/ventas\/nueva$/);
});
