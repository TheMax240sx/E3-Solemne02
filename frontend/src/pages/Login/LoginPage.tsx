import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const LoginPage = () => {
  const { login, isLoading } = useAuth();

  const handleTestLogin = async () => {
    try {
      // Intenta un login de prueba (fallará hasta que Django lo tenga)
      await login('usuario', 'clave'); 
      alert('¡Login exitoso!');
    } catch (error) {
      // Comprobamos si el error es una instancia de Error
      if (error instanceof Error) {
        alert('Error de login (esperado): ' + error.message);
      } else {
        // Si es otra cosa (ej. un string), lo mostramos
        alert('Ocurrió un error desconocido: ' + String(error));
      }
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <h1>Página de Login</h1>
      <p>Aquí irá tu formulario.</p>
      <button onClick={handleTestLogin}>Probar Login (Test)</button>
    </div>
  );
};

export default LoginPage;