import axios from 'axios';

/**
 * Configuración de axios para la API
 */
export const apiService = axios.create({
  baseURL: '/api/',
  timeout: 5000,
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

/* ===========================
   Tipos (TypeScript)
   =========================== */

export interface User {
  id: number;
  username: string;
  email: string;
  is_superuser?: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface Proyecto {
  id: number;
  name: string;
  description?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  creador: number;
  created_at: string;
}
export type ProyectoFormData = Omit<Proyecto, 'id' | 'creador' | 'created_at'>;

export interface Tarea {
  id: number;
  title: string;
  status?: string | null;
  estado?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  proyecto?: number | null;
  asignado_a?: number | null;
  created_at: string;
}
export type TareaFormData = Omit<Tarea, 'id' | 'created_at'>;

export interface PasswordResetData {
  email: string;
}
export interface PasswordResetConfirmData {
  uidb64: string;
  token: string;
  new_password: string;
}

export interface DashboardIndicator {
  id: string;
  nombre: string;
  valor: number;
}

/* ===========================
   Funciones de API (exportadas)
   =========================== */

/* --- Autenticación --- */

export const loginApi = async (credentials: LoginCredentials): Promise<void> => {
  await apiService.post('/login/', credentials);
};

export const logoutApi = async (): Promise<void> => {
  await apiService.post('/logout/');
};

export const getCurrentUserApi = async (): Promise<User> => {
  const { data } = await apiService.get<User>('/me/');
  return data;
};

/* --- Reseteo de contraseña --- */

export const resetPasswordApi = async (emailData: PasswordResetData): Promise<void> => {
  await apiService.post('/password-reset/', emailData);
};

export const confirmPasswordResetApi = async (confirmData: PasswordResetConfirmData): Promise<void> => {
  await apiService.post('/password-reset-confirm/', confirmData);
};

/* --- Gestión de usuarios --- */

export const createUsuarioApi = async (userData: RegisterData): Promise<User> => {
  const { data } = await apiService.post<User>('/users/', userData);
  return data;
};

export const getUsuariosApi = async (): Promise<User[]> => {
  const { data } = await apiService.get<User[]>('/users/');
  return data;
};

export const getUsuarioByIdApi = async (id: number): Promise<User> => {
  const { data } = await apiService.get<User>(`/users/${id}/`);
  return data;
};

export const updateUsuarioApi = async (id: number, userData: Partial<RegisterData>): Promise<User> => {
  const { data } = await apiService.put<User>(`/users/${id}/`, userData);
  return data;
};

export const deleteUsuarioApi = async (id: number): Promise<void> => {
  await apiService.delete(`/users/${id}/`);
};

/* --- Dashboard / MongoDB indicators --- */

export const getDashboardDataApi = async (): Promise<DashboardIndicator[]> => {
  const { data } = await apiService.get<DashboardIndicator[]>('/dashboard-stats/');
  return data;
};

/* Alias / alternativa usando fetch si se prefiere (mantener compatibilidad) */
export const getMongoData = async (): Promise<DashboardIndicator[]> => {
  const { data } = await apiService.get<DashboardIndicator[]>('/dashboard-stats/');
  return data;
};

/* --- CRUD Proyectos --- */

export const getProyectosApi = async (): Promise<Proyecto[]> => {
  const { data } = await apiService.get<Proyecto[]>('/projects/');
  return data;
};

export const createProyectoApi = async (proyectoData: Partial<ProyectoFormData>): Promise<Proyecto> => {
  const { data } = await apiService.post<Proyecto>('/projects/', proyectoData);
  return data;
};

export const updateProyectoApi = async (id: number, proyectoData: Partial<ProyectoFormData>): Promise<Proyecto> => {
  const { data } = await apiService.put<Proyecto>(`/projects/${id}/`, proyectoData);
  return data;
};

export const deleteProyectoApi = async (id: number): Promise<void> => {
  await apiService.delete(`/projects/${id}/`);
};

/* --- CRUD Tareas --- */

export const getTareasApi = async (): Promise<Tarea[]> => {
  const { data } = await apiService.get<Tarea[]>('/tasks/');
  return data;
};

export const createTareaApi = async (tareaData: Partial<TareaFormData>): Promise<Tarea> => {
  const { data } = await apiService.post<Tarea>('/tasks/', tareaData);
  return data;
};

export const updateTareaApi = async (id: number, tareaData: Partial<TareaFormData>): Promise<Tarea> => {
  const { data } = await apiService.put<Tarea>(`/tasks/${id}/`, tareaData);
  return data;
};

export const deleteTareaApi = async (id: number): Promise<void> => {
  await apiService.delete(`/tasks/${id}/`);
};

export default {
  apiService,
  loginApi,
  logoutApi,
  getCurrentUserApi,
  resetPasswordApi,
  confirmPasswordResetApi,
  createUsuarioApi,
  getUsuariosApi,
  getUsuarioByIdApi,
  updateUsuarioApi,
  deleteUsuarioApi,
  getDashboardDataApi,
  getMongoData,
  getProyectosApi,
  createProyectoApi,
  updateProyectoApi,
  deleteProyectoApi,
  getTareasApi,
  createTareaApi,
  updateTareaApi,
  deleteTareaApi,
};