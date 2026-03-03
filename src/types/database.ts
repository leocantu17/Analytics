export type UserRole = 'admin' | 'user';

export interface Profile {
  id: string;
  email: string;
  rol: UserRole;
  creado_en?: string; 
}