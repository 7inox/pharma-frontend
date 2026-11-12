import { expect, type APIRequestContext, type Page, type TestInfo } from '@playwright/test';

export const api = process.env['PHARMA_E2E_API'] ?? 'http://localhost:8081/api/v1';
type Usuario = 'admin' | 'vendedor' | 'almacen';

export function clave(): string {
  const valor = process.env['PHARMA_DEMO_PASSWORD'];
  if (!valor) throw new Error('Define PHARMA_DEMO_PASSWORD para los usuarios de prueba.');
  return valor;
}

export async function ingresar(page: Page, usuario: Usuario) {
  await page.getByLabel('Usuario', { exact: true }).fill(usuario);
  await page.getByLabel('Contraseña', { exact: true }).fill(clave());
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByRole('button', { name: /Cerrar sesión/i })).toBeVisible();
}

export async function iniciarSesion(page: Page, usuario: Usuario, ruta = '/inicio') {
  await page.goto(ruta);
  await expect(page).toHaveURL(/\/login/);
  await ingresar(page, usuario);
}

export async function credenciales(request: APIRequestContext, usuario: Usuario) {
  const respuesta = await request.post(`${api}/auth/login`, {
    data: { username: usuario, password: clave() },
  });
  expect(respuesta.status()).toBe(200);
  return { Authorization: `Bearer ${(await respuesta.json()).token}` };
}

export async function captura(page: Page, info: TestInfo, nombre: string) {
  const path = info.outputPath(`${nombre}.png`);
  await page.screenshot({ path, animations: 'disabled' });
  await info.attach(nombre, { path, contentType: 'image/png' });
}
