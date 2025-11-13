import React from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/sidebar/Sidebar.css';

const Sidebar: React.FC = () => (
  <aside className="sidebar">
    <nav>
      <ul>
        <li><a href="/">Inicio</a></li>
        <li><a href="/perfil">Perfil</a></li>
        <li><a href="/usuarios">Usuarios</a></li>
        <li><a href="/projects-tasks">Proyectos y Tareas</a></li>
      </ul>
    </nav>
  </aside>
);

export default Sidebar;