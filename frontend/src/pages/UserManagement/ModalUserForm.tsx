import React from 'react';
import type { RegisterData } from '../../services/apiService';
import '../../assets/styles/userManagement/ModalUserForm.css';
// Modal para crear/editar usuario
interface ModalUserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<RegisterData>) => void;
  loading: boolean;
  initialData?: Partial<RegisterData>;
  editing: boolean;
}

const ModalUserForm: React.FC<ModalUserFormProps> = ({
  open,
  onClose,
  onSubmit,
  loading,
  initialData = { username: '', email: '', password: '' },
  editing,
}) => {
  const [form, setForm] = React.useState<Partial<RegisterData>>(initialData);

  React.useEffect(() => {
    setForm(initialData);
  }, [initialData, open]);
  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  // Envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!open) return null;

  return (
    <div className="modal-user-backdrop">
      <div className="modal-user-content">
        <h2>{editing ? 'Editar Usuario' : 'Crear Usuario'}</h2>
        <form className="modal-user-form" onSubmit={handleSubmit}>
          <input
            name="username"
            placeholder="Usuario"
            value={form.username || ''}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            placeholder="Email"
            type="email"
            value={form.email || ''}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            placeholder={editing ? "Nueva contraseña (opcional)" : "Contraseña"}
            type="password"
            value={form.password || ''}
            onChange={handleChange}
            required={!editing}
          />
          <div className="modal-user-actions">
            <button type="submit" disabled={loading}>
              {editing ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalUserForm;