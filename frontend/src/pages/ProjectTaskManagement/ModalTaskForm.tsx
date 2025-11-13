import React, { useState, useEffect } from "react";
import {
  createTareaApi,
  updateTareaApi,
} from "../../services/apiService";
import type { Tarea, Proyecto, TareaFormData, User } from "../../services/apiService";
import "../../assets/styles/projectTaskManagement/ProjectTaskManagementPage.css";

// Definimos el estado inicial
const initialState: Partial<TareaFormData> = {
  title: "",
  proyecto: null,
  status: "todo",
  fecha_inicio: "",
  fecha_fin: "",
  asignado_a: null,
};

export default function ModalTaskForm({
  task,
  projects,
  users,
  onClose,
  onSave,
}: {
  task?: Tarea | null;
  projects: Proyecto[];
  users: User[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState<Partial<TareaFormData>>(initialState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        proyecto: task.proyecto ?? null,
        status: task.status || "todo",
        fecha_inicio: task.fecha_inicio || "",
        fecha_fin: task.fecha_fin || "",
        asignado_a: task.asignado_a ?? null,
      });
    } else {
      setForm(initialState);
    }
  }, [task]);
  
  // Handler genérico para inputs y selects
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const finalValue = value === "" ? null : value;
    setForm(prev => ({ ...prev, [name]: finalValue }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const dataToSave: Partial<TareaFormData> = { ...form };
    if (!dataToSave.fecha_inicio) dataToSave.fecha_inicio = null;
    if (!dataToSave.fecha_fin) dataToSave.fecha_fin = null;
    if (dataToSave.proyecto) dataToSave.proyecto = Number(dataToSave.proyecto);
    if (dataToSave.asignado_a) dataToSave.asignado_a = Number(dataToSave.asignado_a);

    try {
      if (task?.id) {
        await updateTareaApi(task.id, dataToSave);
      } else {
        await createTareaApi(dataToSave);
      }
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
          <input name="title" value={form.title} onChange={handleChange} required />
          
          <label>Proyecto</label>
          <select name="proyecto" value={form.proyecto ?? ""} onChange={handleChange}>
            <option value="">Sin proyecto</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          
          <label>Estado</label>
          <select name="status" value={form.status ?? "todo"} onChange={handleChange}>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
          
          <label>Fecha de Inicio</label>
          <input name="fecha_inicio" type="date" value={form.fecha_inicio || ''} onChange={handleChange} />
          
          <label>Fecha de Fin</label>
          <input name="fecha_fin" type="date" value={form.fecha_fin || ''} onChange={handleChange} />
          
          <label>Asignado A</label>
          <select name="asignado_a" value={form.asignado_a ?? ""} onChange={handleChange}>
            {/* El default "Sin asignar" que pediste */}
            <option value="">Sin asignar</option>
            
            {/* La lista de usuarios (solo username) que pediste */}
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.username}</option>
            ))}
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