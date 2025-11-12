import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../assets/styles/profile/ProfilePage.css';

const ProfilePage: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="profile-container">Cargando...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>Mi Perfil</h1>

        <div className="profile-row">
          <span className="label">Usuario</span>
          <span className="value">{user?.username ?? '—'}</span>
        </div>

        <div className="profile-row">
          <span className="label">Email</span>
          <span className="value">{user?.email ?? '—'}</span>
        </div>

        <div className="profile-row">
          <span className="label">Contraseña</span>
          <span className="value masked">********</span>
        </div>

        <div className="profile-actions">
          <Link to="/password-reset" className="btn">
            Cambiar / Recuperar contraseña
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;