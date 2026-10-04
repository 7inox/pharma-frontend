export interface MenuItem {
    etiqueta: string;
    ruta: string;
    icono: string;
}
export const MENU: MenuItem[] = [{ etiqueta: 'Clientes', ruta: '/clientes', icono: '👥' }, { etiqueta: 'Inicio', ruta: '/inicio', icono: '⌂' }, { etiqueta: 'Categorías', ruta: '/categorias', icono: '▦' }];
