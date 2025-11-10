// Este hook personalizado maneja la autenticación de usuarios
// usando el contexto de React y la función de login de la API.
// Esta como esqueleto por ahora

import { createContext, useContext, useState, ReactNode } from 'react';
import { loginApi } from '../services/apiService'; // Importamos nuestra función de API

// 1. DEFINE LA "FORMA" DE TU CONTEXTO DE AUTENTICACIÓN
interface AuthContextType {
  isAuthenticated: boolean;
  user: any; // Puedes crear un tipo 'User' más específico
  login: (usuario: string, clave: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// 2. CREA EL CONTEXTO
// Es el "lugar" donde vivirá la información.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. CREA EL "PROVEEDOR" (PROVIDER)
// Este es el componente que "proveerá" el estado y las funciones
// a todos los componentes "hijos" que envuelva.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Función de Login
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // 1. Llama a la API que creamos
      const data = await loginApi({ username, password });

      // 2. Si tiene éxito, guarda el estado
      setUser(data.user);
      setIsAuthenticated(true);
      
      // 3. Guarda el token en el Local Storage para recordar la sesión
      localStorage.setItem('authToken', data.token);

    } catch (error) {
      // Aquí manejarías el error (ej. "usuario o clave incorrecta")
      console.error('Error de login:', error);
      setIsAuthenticated(false);
      setUser(null);
      // Lanza el error para que el formulario de login lo sepa
      throw new Error('Usuario o contraseña incorrectos.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función de Logout
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken'); // Limpia el token
  };

  // El "valor" que se comparte con los hijos
  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 4. CREA EL HOOK PERSONALIZADO
// Este es el hook que tus páginas usarán para acceder al contexto.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};