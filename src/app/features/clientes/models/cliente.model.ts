export interface ClienteRequest {
  dni: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  estado: boolean;
}
export interface Cliente extends ClienteRequest {
  id: number;
  fechaCreacion: string;
  fechaModificacion: string | null;
}
