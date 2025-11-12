import React from 'react';
import '../../assets/styles/sidebar/Sidebar.css';

const Sidebar: React.FC = () => (
  <aside className="sidebar">
    <nav>
      <ul>
        <li><a href="/">Inicio</a></li>
        <li><a href="/perfil">Perfil</a></li>
        <li><a href="/usuarios">Usuarios</a></li>
      </ul>
    </nav>
  </aside>
);

export default Sidebar;