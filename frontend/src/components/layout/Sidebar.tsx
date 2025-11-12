import React from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/sidebar/Sidebar.css';

const Sidebar: React.FC = () => (
  <aside className="sidebar">
    <nav>
      <ul>
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/perfil">Perfil</Link></li>
        <li><Link to="/usuarios">Usuarios</Link></li>
      </ul>
    </nav>
  </aside>
);

export default Sidebar;