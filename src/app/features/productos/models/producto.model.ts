export interface ProductoRequest {
  nombre: string;
  precio: number;
  stock: number;
  estado: boolean;
  categoriaId: number;
}
export interface Producto extends ProductoRequest {
  id: number;
  categoriaNombre: string;
  fechaCreacion: string;
  fechaModificacion: string | null;
}
export type OrdenProducto = 'id' | 'nombre' | 'precio' | 'stock';
export type Direccion = 'asc' | 'desc';
