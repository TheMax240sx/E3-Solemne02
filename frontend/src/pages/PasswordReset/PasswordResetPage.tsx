import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPasswordApi } from '../../services/apiService';
import '../../assets/styles/login/LoginPage.css'; 

const PasswordResetPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      await resetPasswordApi({ email });
      setSuccess('¡Hecho! Si existe una cuenta con ese correo, recibirás un email. (Revisa Mailhog en http://localhost:8025)');
    } catch (err) {
      // El backend devuelve "éxito" incluso si el email no existe,
      // así que este error es solo para fallos de red/servidor.
      setError('Ocurrió un error. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Recuperar Contraseña</h1>
        
        {/* Mostramos un mensaje de éxito cuando se envía */}
        {success ? (
          <>
            <p style={{textAlign: 'center'}}>{success}</p>
            <p className="form-link" style={{marginTop: '1rem'}}>
              <Link to="/login">Volver a Iniciar Sesión</Link>
            </p>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <p style={{textAlign: 'center', fontSize: '0.9rem', color: '#555'}}>
              Ingresa tu email y te enviaremos un link para resetear tu contraseña.
            </p>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>
            
            {error && <p className="form-error">{error}</p>}
            
            <button type="submit" disabled={isLoading} className="form-button">
              {isLoading ? 'Enviando...' : 'Enviar Link de Reseteo'}
            </button>
            
            <p className="form-link">
              <Link to="/login">Volver a Iniciar Sesión</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default PasswordResetPage;