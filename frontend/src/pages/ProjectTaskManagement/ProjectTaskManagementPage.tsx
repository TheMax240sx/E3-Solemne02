import React, { useEffect, useState, useCallback } from "react";
// Importamos los tipos y funciones de nuestro apiService
import {
  getProyectosApi,
  getTareasApi,
  getUsuariosApi,
} from "../../services/apiService";
import type { Proyecto, Tarea, User } from "../../services/apiService";
import ModalProjectForm from "./ModalProjectForm";
import ModalTaskForm from "./ModalTaskForm";
import "../../assets/styles/projectTaskManagement/ProjectTaskManagementPage.css";

export default function ProjectTaskManagementPage() {
  const [projects, setProjects] = useState<Proyecto[]>([]);
  const [tasks, setTasks] = useState<Tarea[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editProject, setEditProject] = useState<Proyecto | null>(null);
  const [editTask, setEditTask] = useState<Tarea | null>(null);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [p, t, u] = await Promise.all([
        getProyectosApi(),
        getTareasApi(),
        getUsuariosApi(),
      ]);
      setProjects(p);
      setTasks(t);
      setUsers(u);
    } catch (err) {
      console.error(err);
      alert("Error al cargar proyectos y tareas. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  }, []); // El array de dependencias está vacío

  useEffect(() => {
    loadAll();
  }, [loadAll]); // Dependemos de loadAll


  function onProjectSaved() {
    setShowProjectModal(false);
    setEditProject(null);
    loadAll(); // Recarga los datos
  }

  function onTaskSaved() {
    setShowTaskModal(false);
    setEditTask(null);
    loadAll(); // Recarga los datos
  }

  return (
    <div className="ptm-container">
      <div className="ptm-header">
        <h2>Proyectos y Tareas</h2>
        <div className="ptm-actions">
          <button onClick={() => setShowProjectModal(true)}>Nuevo Proyecto</button>
          <button onClick={() => setShowTaskModal(true)}>Nueva Tarea</button>
        </div>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <div className="ptm-grid">
          <section className="ptm-column">
            <h3>Proyectos</h3>
            <ul className="ptm-list">
              {projects.map((p) => (
                <li key={p.id} className="ptm-item">
                  <div>
                    {/* El modelo ahora usa 'name' y 'description' */}
                    <strong>{p.name}</strong>
                    <div className="ptm-muted">{p.description}</div>
                  </div>
                  <div className="ptm-item-actions">
                    <button onClick={() => { setEditProject(p); setShowProjectModal(true); }}>Editar</button>
                  </div>
                </li>
              ))}
              {projects.length === 0 && <li className="ptm-empty">No hay proyectos</li>}
            </ul>
          </section>

          <section className="ptm-column">
            <h3>Tareas</h3>
            <ul className="ptm-list">
              {tasks.map((t) => (
                <li key={t.id} className="ptm-item">
                  <div>
                    {/* El modelo ahora usa 'title' y 'status' */}
                    <strong>{t.title}</strong>
                    <div className="ptm-muted">Proyecto: {t.proyecto ?? "—"} — Estado: {t.status ?? "—"}</div>
                  </div>
                  <div className="ptm-item-actions">
                    <button onClick={() => { setEditTask(t); setShowTaskModal(true); }}>Editar</button>
                  </div>
                </li>
              ))}
              {tasks.length === 0 && <li className="ptm-empty">No hay tareas</li>}
            </ul>
          </section>
        </div>
      )}

      {showProjectModal && (
        <ModalProjectForm
          project={editProject}
          onClose={() => { setShowProjectModal(false); setEditProject(null); }}
          onSave={onProjectSaved}
        />
      )}

      {showTaskModal && (
        <ModalTaskForm
          task={editTask}
          projects={projects}
          users={users}
          onClose={() => { setShowTaskModal(false); setEditTask(null); }}
          onSave={onTaskSaved}
        />
      )}
    </div>
  );
}