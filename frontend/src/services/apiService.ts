// Este archivo define las funciones para interactuar con la API de Django usando Axios.
// Esta como esqueleto por ahora

import axios from 'axios';

// 1. CREA LA INSTANCIA DE AXIOS
// La URL base es '/api/' porque Apache (webserver) está configurado
// para redirigir todo lo que empiece con /api/ a tu backend de Django.
const apiService = axios.create({
  baseURL: '/api/',
  timeout: 5000, // 5 segundos de tiempo límite
});

/*
 * 2. DEFINE LOS TIPOS (¡ESTO ES TYPESCRIPT!)
 * Define cómo se ven los datos que esperas.
 * Deberás crear estos "endpoints" en Django.
 */

// Esto es lo que le enviarás a Django para el login
interface LoginCredentials {
  username: string;
  password: string;
}

// Esto es lo que Django te devolverá (ej. un token y datos del usuario)
interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

/*
 * 3. CREA Y EXPORTA LAS FUNCIONES DE LA API
 * Cada función llama a un endpoint de tu API de Django.
 */

/**
 * Llama al endpoint de Django para iniciar sesión.
 * (Debes crear este endpoint en Django, ej: en '/api/token/' o '/api/login/')
 */
export const loginApi = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // El "post" irá a "/api/login/" gracias al baseURL
  const { data } = await apiService.post<AuthResponse>('/login/', credentials);
  return data;
};

/**
 * Llama al endpoint para obtener los datos del dashboard.
 * (Debes crear este endpoint en Django, ej: '/api/dashboard-stats/')
 */
export const getDashboardDataApi = async () => {
  const { data } = await apiService.get('/dashboard-stats/');
  return data;
};

// ---
// Aquí puedes añadir el resto de tus llamadas a la API:
// export const createUsuarioApi = async (userData) => { ... }
// export const resetPasswordApi = async (email) => { ... }
// ---