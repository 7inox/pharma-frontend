export interface ProductoRequest {
  nombre: string;
  precio: number;
  stock: number;
  estado: boolean;
  categoriaId: number;
}
export interface Producto extends ProductoRequest {
  id: number;
  creadoPor?: string | null;
  modificadoPor?: string | null;
  categoriaNombre: string;
  fechaCreacion: string;
  fechaModificacion: string | null;
}
export type OrdenProducto = 'id' | 'nombre' | 'precio' | 'stock';
export type Direccion = 'asc' | 'desc';
