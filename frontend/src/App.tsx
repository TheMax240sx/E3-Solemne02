import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Importa tus páginas
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import UserManagementPage from './pages/UserManagement/UserManagementPage';

/**
 * Componente simple para proteger rutas.
 * Si el usuario está logueado, muestra la página.
 * Si no, lo redirige al /login.
 */
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // 1. Muestra "Cargando..." mientras el hook useAuth
  //    chequea si hay una sesión activa (recuerda el useEffect)
  if (isLoading) {
    return <div>Cargando sesión...</div>;
  }

  // 2. Define las rutas de la aplicación
  return (
    <Routes>
      {/* --- Ruta de Login --- */}
      <Route
        path="/login"
        element={
          // Si ya está logueado, no lo dejes ver el login,
          // redirígelo al Dashboard.
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      {/* --- Ruta de Dashboard (Protegida) --- */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      
      {/* --- Ruta de Gestión de Usuarios (Protegida) --- */}
      <Route
        path="/usuarios"
        element={
          <ProtectedRoute>
            <UserManagementPage />
          </ProtectedRoute>
        }
      />
      

      {/* --- Ruta Raíz (/) --- */}
      <Route
        path="*"
        // Por defecto, cualquier ruta desconocida
        // redirige al dashboard o al login.
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}

export default App;