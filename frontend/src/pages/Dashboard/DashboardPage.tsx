import React from 'react';
import { useAuth } from '../../hooks/useAuth'; // Importa el hook de autenticación
import '../../assets/styles/dashboard/DashboardPage.css';

/**
 * Página principal del Dashboard.
 * Muestra el contenido solo si el usuario está autenticado.
 */
const DashboardPage = () => {
  // Obtiene los datos del usuario y la función de logout del hook
  const { user, logout, isLoading } = useAuth();

  return (
    <div className="dashboard-page">
      {/* Barra de Navegación Superior */}
      <header className="dashboard-header">
        <h1 className="title">Gestor de Proyectos</h1>
        <div className="user-info">
          {/* Muestra el nombre del usuario logueado */}
          <span>Hola, <strong>{user?.username}</strong></span>
          
          {/* Botón de Cerrar Sesión */}
          <button 
            className="logout-button" 
            onClick={logout} // Llama a la función de logout del hook
            disabled={isLoading}
          >
            {isLoading ? 'Cerrando...' : 'Cerrar Sesión'}
          </button>
        </div>
      </header>

      {/* Contenido Principal de la Página */}
      <main className="dashboard-content">
        <h2 className="welcome-title">Dashboard Principal</h2>
        <p>Aquí irán tus indicadores (desde MongoDB).</p>
        
        {/* Ejemplo de cómo mostrarías los indicadores */}
        <div className="indicator-container">
          <div className="indicator-card">
            <h3>Proyectos Activos</h3>
            <p className="indicator-value">5</p>
          </div>
          <div className="indicator-card">
            <h3>Tareas Pendientes</h3>
            <p className="indicator-value">12</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;