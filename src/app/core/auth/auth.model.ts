export type Permiso =
  | 'CATALOGO_LEER'
  | 'CATALOGO_ESCRIBIR'
  | 'CLIENTES_LEER'
  | 'CLIENTES_ESCRIBIR'
  | 'VENTAS_LEER'
  | 'VENTAS_REGISTRAR'
  | 'REPORTES_VER'
  | 'USUARIOS_ADMINISTRAR';

export interface LoginResponse {
  token: string;
  tipo: string;
  // Nombre real del campo emitido por PharmaBackend.
  expiresIn: number;
  username: string;
  nombreCompleto: string;
  roles: string[];
  permisos: Permiso[];
}

export interface Session {
  token: string;
  username: string;
  nombreCompleto: string;
  roles: string[];
  permisos: Permiso[];
  expiraEn: number;
}
