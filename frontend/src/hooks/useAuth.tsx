// Este hook maneja el estado de autenticación de la aplicación
// usando el Contexto de React y nuestro apiService.

// --- Importación de VALORES de React ---
import { 
  createContext, 
  useContext, 
  useState, 
  useEffect 
} from 'react';

// --- Importación de TIPOS de React ---
import type { ReactNode } from 'react';

// --- Importación de VALORES de apiService ---
import { 
  loginApi, 
  logoutApi, 
  getCurrentUserApi 
} from '../services/apiService';

// --- Importación de TIPOS de apiService ---
import type { User } from '../services/apiService';

// 1. DEFINE LA "FORMA" DEL CONTEXTO DE AUTENTICACIÓN
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null; // Usamos el tipo 'User' que definimos en el apiService
  login: (usuario: string, clave: string) => Promise<void>;
  logout: () => Promise<void>; // Logout ahora también es asíncrono
  isLoading: boolean; // Estado de carga general
}

// 2. CREA EL CONTEXTO
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. CREA EL "PROVEEDOR" (PROVIDER)
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // isLoading se usará para dos cosas:
  // 1. Carga inicial (chequeando sesión)
  // 2. Carga durante el login/logout
  const [isLoading, setIsLoading] = useState<boolean>(true); // Inicia en true

  // -----------------------------------------------------------------
  // CHEQUEO DE SESIÓN AL CARGAR LA PÁGINA
  // -----------------------------------------------------------------
  // Usamos useEffect para chequear si el usuario YA tiene una cookie
  // de sesión válida cuando la aplicación se carga por primera vez.
  useEffect(() => {
    
    const checkUserSession = async () => {
      try {
        // 1. Llama al endpoint /api/me/
        const userData = await getCurrentUserApi();
        
        // 2. Si tiene éxito, estamos logueados
        setUser(userData);
        setIsAuthenticated(true);

      } catch (error) {
        // 3. Si falla (ej. error 401), no estamos logueados
        setUser(null);
        setIsAuthenticated(false);
        // (No es un error real, solo significa que no hay sesión)
        console.log('No se encontró sesión activa.');
      } finally {
        // 4. Pase lo que pase, terminamos la carga inicial
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []); // El array vacío [] significa que esto solo se ejecuta UNA VEZ

  // -----------------------------------------------------------------
  // FUNCIÓN DE LOGIN
  // -----------------------------------------------------------------
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // 1. Llama a la API de login. Esto solo establece la cookie.
      await loginApi({ username, password });

      // 2. SI EL LOGIN FUE EXITOSO, llamamos a /api/me/
      //    para obtener los datos del usuario que acabamos de loguear.
      const userData = await getCurrentUserApi();

      // 3. Guardamos el estado
      setUser(userData);
      setIsAuthenticated(true);

    } catch (error) {
      console.error('Error de login:', error);
      setIsAuthenticated(false);
      setUser(null);
      // Lanza el error para que el formulario de login lo sepa
      throw new Error('Usuario o contraseña incorrectos.');
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------------------------------------------
  // FUNCIÓN DE LOGOUT
  // -----------------------------------------------------------------
  const logout = async () => {
    setIsLoading(true);
    try {
      // 1. Llama a la API de logout para invalidar la cookie en el backend
      await logoutApi();
    } catch (error) {
      // Incluso si falla, limpiamos el estado local
      console.error('Error de logout:', error);
    } finally {
      // 2. Limpia el estado local
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
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
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};