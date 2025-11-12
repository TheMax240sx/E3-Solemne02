import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { confirmPasswordResetApi } from '../../services/apiService';
import '../../assets/styles/login/LoginPage.css';

const PasswordResetConfirmPage = () => {
  // useParams lee los parámetros (ej. :uidb64) de la URL
  const { uidb64, token } = useParams<{ uidb64: string; token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uidb64 || !token) {
      setError('Link inválido o expirado.');
      return;
    }
    
    setError(null);
    setIsLoading(true);

    try {
      await confirmPasswordResetApi({
        uidb64,
        token,
        new_password: password
      });
      setSuccess('¡Contraseña actualizada! Ahora puedes iniciar sesión.');
      // Redirige al login después de 3 segundos
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError('Link inválido, expirado, o la contraseña es muy débil.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Nueva Contraseña</h1>
        
        {success ? (
          <p style={{textAlign: 'center'}}>{success}</p>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <p style={{textAlign: 'center', fontSize: '0.9rem', color: '#555'}}>
              Ingresa tu nueva contraseña.
            </p>
            
            <div className="form-group">
              <label htmlFor="password">Nueva Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>
            
            {error && <p className="form-error">{error}</p>}
            
            <button type="submit" disabled={isLoading} className="form-button">
              {isLoading ? 'Actualizando...' : 'Guardar Contraseña'}
            </button>
            
            {success && (
              <p className="form-link">
                <Link to="/login">Ir a Iniciar Sesión</Link>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default PasswordResetConfirmPage;