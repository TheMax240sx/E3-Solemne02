import React, { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import "../../assets/styles/projectTaskManagement/ProjectTaskManagementPage.css";

type Project = {
  id?: number;
  name: string;
  description?: string;
};

export default function ModalProjectForm({
  project,
  onClose,
  onSave,
}: {
  project?: Project | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const { getToken } = useAuth();
  const [form, setForm] = useState<Project>({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) setForm({ name: project.name || "", description: project.description || "" });
  }, [project]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const token = getToken?.();
      const url = project?.id ? `/api/projects/${project.id}/` : "/api/projects/";
      const method = project?.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error guardando proyecto");
      onSave();
    } catch (err) {
      console.error(err);
      alert("Error al guardar proyecto");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="ptm-modal-backdrop">
      <div className="ptm-modal">
        <h4>{project ? "Editar Proyecto" : "Nuevo Proyecto"}</h4>
        <form onSubmit={submit} className="ptm-form">
          <label>Nombre</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <label>Descripción</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="ptm-form-actions">
            <button type="button" onClick={onClose} disabled={saving}>Cancelar</button>
            <button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}