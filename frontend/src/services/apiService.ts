// Este archivo centraliza todas las interacciones con la API de Django.
// Usamos Axios para las peticiones HTTP.

import axios from 'axios';

// ========================================================================
// 1. CONFIGURACIÓN DE AXIOS
// ========================================================================

const apiService = axios.create({
  /**
   * La URL base de nuestra API.
   * Gracias al proxy de Apache, todas las peticiones a '/api/' son
   * redirigidas automáticamente a nuestro backend de Django.
   */
  baseURL: '/api/',
  
  /**
   * Tiempo límite de 5 segundos para cada petición.
   */
  timeout: 5000,

  /**
   * ¡CRÍTICO PARA LA AUTENTICACIÓN!
   * Esto le dice a Axios que envíe cookies (como el 'sessionid' que Django
   * establece al hacer login) con cada petición. Sin esto, el backend
   * nunca sabrá que estamos logueados.
   */
  withCredentials: true,
  xsrfCookieName: 'csrftoken', // Nombre de la cookie CSRF que Django usa por defecto
  xsrfHeaderName: 'X-CSRFToken', // Nombre del header que Axios enviará con el token CSRF
});

// ========================================================================
// 2. DEFINICIÓN DE TIPOS (TYPESCRIPT)
// ========================================================================
// Estos tipos deben coincidir con los 'serializers.py' de Django.

/**
 * El objeto de Usuario que recibimos del backend.
 * (Basado en el UserSerializer)
 */
export interface User {
  id: number;
  username: string;
  email: string;
  is_superuser?: boolean;
}

/**
 * Datos para el formulario de Login.
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Datos para el formulario de Registro (Crear Usuario).
 * (Basado en el UserSerializer, omitimos 'id')
 */
export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

/**
 * Datos para el formulario de Proyecto
 */
export interface Proyecto {
  id: number;
  name: string;
  description?: string | null;
  fecha_inicio?: string | null; // Django devuelve fechas como strings ISO
  fecha_fin?: string | null;
  creador: number; // El serializer devuelve el ID
  created_at: string;
}
// Tipo para el formulario (omite campos generados por el backend)
export type ProyectoFormData = Omit<Proyecto, 'id' | 'creador' | 'created_at'>;

/**
 * Datos para el formulario de Tarea
 */
export interface Tarea {
  id: number;
  title: string;
  status?: string | null;
  estado?: string | null; // Tu modelo tiene 'status' Y 'estado'. Incluimos ambos.
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  proyecto?: number | null;
  asignado_a?: number | null;
  created_at: string;
}
// Tipo para el formulario
export type TareaFormData = Omit<Tarea, 'id' | 'created_at'>;

/**
 * Datos para el formulario de Reseteo de Contraseña.
 */
export interface PasswordResetData {
  email: string;
}

export interface PasswordResetConfirmData {
  uidb64: string;
  token: string;
  new_password: string;
}

/**
 * Datos del Dashboard.
 * (Basado en el DashboardIndicatorSerializer)
 */
export interface DashboardIndicator {
  id: string; // MongoDB usa strings para el ID
  nombre: string;
  valor: number;
}

// ========================================================================
// 3. FUNCIONES DE LA API (EXPORTADAS)
// ========================================================================

// --- Autenticación ---

/**
 * Inicia sesión en el backend.
 * No devuelve datos, solo establece una cookie de sesión si tiene éxito.
 */
export const loginApi = async (credentials: LoginCredentials): Promise<void> => {
  // Usamos 'await' para esperar la respuesta.
  // Si falla (ej. 401 Unauthorized), Axios lanzará un error
  // que nuestro 'useAuth.tsx' deberá atrapar (catch).
  await apiService.post('/login/', credentials);
};

/**
 * Cierra la sesión en el backend.
 * Esto invalida la cookie de sesión.
 */
export const logoutApi = async (): Promise<void> => {
  await apiService.post('/logout/');
};

/**
 * Obtiene los datos del usuario actualmente logueado.
 * Llama al endpoint '/api/me/' que creamos.
 */
export const getCurrentUserApi = async (): Promise<User> => {
  const { data } = await apiService.get<User>('/me/');
  return data;
};

/**
 * Solicita un reseteo de contraseña.
 * Llama a: POST /api/password-reset/
 */
export const resetPasswordApi = async (emailData: PasswordResetData): Promise<void> => {
  await apiService.post('/password-reset/', emailData);
};

/**
 * Confirma el reseteo de contraseña.
 * Llama a: POST /api/password-reset-confirm/
 */
export const confirmPasswordResetApi = async (confirmData: PasswordResetConfirmData): Promise<void> => {
  await apiService.post('/password-reset-confirm/', confirmData);
};

// --- Gestión de Usuarios (CRUD Completo) ---

/**
 * Registra (Crea) un nuevo usuario.
 * Llama a: POST /api/users/
 */
export const createUsuarioApi = async (userData: RegisterData): Promise<User> => {
  const { data } = await apiService.post<User>('/users/', userData);
  return data;
};

/**
 * Obtiene la lista completa de usuarios.
 * Llama a: GET /api/users/
 */
export const getUsuariosApi = async (): Promise<User[]> => {
  const { data } = await apiService.get<User[]>('/users/');
  return data;
};

/**
 * Obtiene los detalles de un solo usuario por su ID.
 * Llama a: GET /api/users/{id}/
 */
export const getUsuarioByIdApi = async (id: number): Promise<User> => {
  const { data } = await apiService.get<User>(`/users/${id}/`);
  return data;
};

/**
 * Actualiza los datos de un usuario por su ID.
 * Llama a: PUT /api/users/{id}/
 * * NOTA: El Serializer de Django (UserSerializer)
 * se encarga de re-hashear la contraseña si se envía una nueva.
 */
export const updateUsuarioApi = async (id: number, userData: Partial<RegisterData>): Promise<User> => {
  // Usamos 'Partial<RegisterData>' para que los campos (username, email, password)
  // sean opcionales, lo cual es típico en una actualización.
  const { data } = await apiService.put<User>(`/users/${id}/`, userData);
  return data;
};

/**
 * Elimina (o desactiva) un usuario por su ID.
 * Llama a: DELETE /api/users/{id}/
 */
export const deleteUsuarioApi = async (id: number): Promise<void> => {
  // DELETE no devuelve contenido, solo un código 204 (No Content).
  await apiService.delete(`/users/${id}/`);
};

// --- Dashboard ---

/**
 * Obtiene los indicadores del dashboard.
 * Llama al endpoint de MongoDB.
 */
export const getDashboardDataApi = async (): Promise<DashboardIndicator[]> => {
  const { data } = await apiService.get<DashboardIndicator[]>('/dashboard-stats/');
  return data;
};

export async function getMongoData(): Promise<any[]> {
  const res = await fetch('/api/dashboard-stats/', {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error al obtener datos de MongoDB: ${res.status} ${text}`);
  }
  return res.json();
}

// --- CRUD de Proyectos ---

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

// --- CRUD de Tareas ---

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