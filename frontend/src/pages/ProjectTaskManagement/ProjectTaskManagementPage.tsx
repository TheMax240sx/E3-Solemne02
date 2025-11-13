import React, { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import ModalProjectForm from "./ModalProjectForm";
import ModalTaskForm from "./ModalTaskForm";
import "../../assets/styles/projectTaskManagement/ProjectTaskManagementPage.css";

type Project = {
  id: number;
  name: string;
  description?: string;
};

type Task = {
  id: number;
  title: string;
  project?: number | null;
  status?: string;
};

export default function ProjectTaskManagementPage() {
  const { getToken } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchJson(url: string, options: RequestInit = {}) {
    const token = getToken?.();
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  }

  async function loadAll() {
    try {
      setLoading(true);
      const [p, t] = await Promise.all([
        fetchJson("/api/projects/"),
        fetchJson("/api/tasks/"),
      ]);
      setProjects(p);
      setTasks(t);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function onProjectSaved() {
    setShowProjectModal(false);
    setEditProject(null);
    loadAll();
  }

  function onTaskSaved() {
    setShowTaskModal(false);
    setEditTask(null);
    loadAll();
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
                    <strong>{t.title}</strong>
                    <div className="ptm-muted">Proyecto: {t.project ?? "—"} — Estado: {t.status ?? "—"}</div>
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
          onClose={() => { setShowTaskModal(false); setEditTask(null); }}
          onSave={onTaskSaved}
        />
      )}
    </div>
  );
}