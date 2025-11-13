import React, { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import "../../assets/styles/projectTaskManagement/ProjectTaskManagementPage.css";

type Task = {
  id?: number;
  title: string;
  project?: number | null;
  status?: string;
};

type Project = {
  id: number;
  name: string;
};

export default function ModalTaskForm({
  task,
  projects,
  onClose,
  onSave,
}: {
  task?: Task | null;
  projects: Project[];
  onClose: () => void;
  onSave: () => void;
}) {
  const { getToken } = useAuth();
  const [form, setForm] = useState<Task>({ title: "", project: null, status: "todo" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) setForm({ title: task.title || "", project: task.project ?? null, status: task.status || "todo" });
  }, [task]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const token = getToken?.();
      const url = task?.id ? `/api/tasks/${task.id}/` : "/api/tasks/";
      const method = task?.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error guardando tarea");
      onSave();
    } catch (err) {
      console.error(err);
      alert("Error al guardar tarea");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="ptm-modal-backdrop">
      <div className="ptm-modal">
        <h4>{task ? "Editar Tarea" : "Nueva Tarea"}</h4>
        <form onSubmit={submit} className="ptm-form">
          <label>Título</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <label>Proyecto</label>
          <select value={form.project ?? ""} onChange={(e) => setForm({ ...form, project: e.target.value ? Number(e.target.value) : null })}>
            <option value="">Sin proyecto</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <label>Estado</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>

          <div className="ptm-form-actions">
            <button type="button" onClick={onClose} disabled={saving}>Cancelar</button>
            <button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}