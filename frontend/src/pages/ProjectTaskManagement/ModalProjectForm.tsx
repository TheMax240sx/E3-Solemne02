import React, { useState, useEffect } from "react";
// Importamos los tipos y funciones de nuestro apiService
import {
  createProyectoApi,
  updateProyectoApi,
} from "../../services/apiService";
import type { Proyecto, ProyectoFormData } from "../../services/apiService";
import "../../assets/styles/projectTaskManagement/ProjectTaskManagementPage.css";

// Definimos el estado inicial del formulario
const initialState: ProyectoFormData = {
  name: "",
  description: "",
  fecha_inicio: "",
  fecha_fin: "",
};

export default function ModalProjectForm({
  project,
  onClose,
  onSave,
}: {
  project?: Proyecto | null; // Usamos el tipo importado
  onClose: () => void;
  onSave: () => void;
}) {

  const [form, setForm] = useState<Partial<ProyectoFormData>>(initialState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      // Si estamos editando, poblamos el formulario con los datos del proyecto
      setForm({
        name: project.name || "",
        description: project.description || "",
        fecha_inicio: project.fecha_inicio || "",
        fecha_fin: project.fecha_fin || "",
      });
    } else {
      // Si es nuevo, reseteamos el formulario
      setForm(initialState);
    }
  }, [project]);

  // Handler genérico para los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    // Filtramos campos vacíos para no enviar 'null' innecesariamente
    const dataToSave: Partial<ProyectoFormData> = { ...form };
    if (!dataToSave.fecha_inicio) dataToSave.fecha_inicio = null;
    if (!dataToSave.fecha_fin) dataToSave.fecha_fin = null;

    try {
      if (project?.id) {
        // Actualizar
        await updateProyectoApi(project.id, dataToSave);
      } else {
        // Crear
        await createProyectoApi(dataToSave);
      }
      onSave(); // Llama a onSave (que recarga la lista)
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
          <input name="name" value={form.name} onChange={handleChange} required />
          
          <label>Descripción</label>
          <textarea name="description" value={form.description || ''} onChange={handleChange} />
          
          <label>Fecha de Inicio</label>
          <input name="fecha_inicio" type="date" value={form.fecha_inicio || ''} onChange={handleChange} />
          
          <label>Fecha de Fin</label>
          <input name="fecha_fin" type="date" value={form.fecha_fin || ''} onChange={handleChange} />

          <div className="ptm-form-actions">
            <button type="button" onClick={onClose} disabled={saving}>Cancelar</button>
            <button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}