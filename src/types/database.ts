export type UserRole = 'admin' | 'user'| 'empleado';

export interface Profile {
  id: string;
  email: string;
  rol: UserRole;
  creado_en?: string; 
}

export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria_id?: string;
  categorias?: { nombre: string };
  imagen_url?: string;
}

export interface Ventas {
  nombre: string;
  totalVendido: number;
}

export interface UsuarioBloqueado {
  id: string
  email: string
  intentos_fallidos: number
  bloqueado: boolean
  ultima_actividad: string | null
}

export interface Perfil {
  id: string;
  email: string;
  rol: string;
  creado_en: string;
}

export interface Venta {
  id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  creado_en: string;
  productos?: { nombre: string; imagen_url: string };
}

export interface ItemCarrito {
  id: string;
  nombre: string;
  precio: number;
  imagen_url: string;
  cantidad: number;
  stock: number;
}

export interface Categoria {
  id: string;
  nombre: string;
}

export interface UsuarioDB {
  id: string
  email: string
  intentos: number
  bloqueado_hasta: string | null
}