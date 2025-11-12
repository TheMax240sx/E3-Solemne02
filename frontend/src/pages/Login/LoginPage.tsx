import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../assets/styles/login/LoginPage.css';

const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(username, password);
      navigate('/dashboard'); // Redirige al dashboard si el login es exitoso
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error desconocido.');
      }
    }
  };

  return (
    // 2. Reemplaza los 'style' por 'className'
    <div className="login-container">
      
      <div className="login-card">
        <h1 className="login-title">Iniciar Sesión</h1>
        
        <form onSubmit={handleSubmit} className="login-form">
          
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
          
          {/* Muestra el error de login si existe */}
          {error && <p className="form-error">{error}</p>}
          
          <button type="submit" disabled={isLoading} className="form-button">
            {isLoading ? 'Cargando...' : 'Entrar'}
          </button>
          
          <p className="form-link">
            {/* Link al reseteo de contraseña */}
            <Link to="/password-reset">¿Olvidaste tu contraseña?</Link>
          </p>
          
        </form>
      </div>
      
    </div>
  );
};

export default LoginPage;