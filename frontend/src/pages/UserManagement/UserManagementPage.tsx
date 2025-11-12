import React, { useEffect, useState } from 'react';
import {
  getUsuariosApi,
  createUsuarioApi,
  updateUsuarioApi,
  deleteUsuarioApi,
  type User,
  type RegisterData,
} from '../../services/apiService';
import '../../assets/styles/userManagement/UserManagementPage.css';
import ModalUserForm from './ModalUserForm';
import { useAuth } from '../../hooks/useAuth'; // <-- importar hook

// Página de gestión de usuarios
const UserManagementPage = () => {
  const { user } = useAuth(); // obtener usuario actual
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Partial<RegisterData>>({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si el usuario no es superusuario, mostramos mensaje de no autorizado
  if (!user?.is_superuser) {
    return (
      <div className="user-mgmt-container">
        <h1>Gestión de Usuarios</h1>
        <div style={{ color: 'red' }}>No autorizado. Se requiere ser superusuario para gestionar usuarios.</div>
      </div>
    );
  }

  // Cargar usuarios desde API
  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsuariosApi();
      setUsers(data);
    } catch (e: any) {
      setError(e.message || 'Error al cargar usuarios');
    }
    setLoading(false);
  };
  useEffect(() => {
    loadUsers();
  }, []);

  // Abrir modal para crear usuario
  const handleOpenCreate = () => {
    setEditingId(null);
    setEditingData({ username: '', email: '', password: '' });
    setModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setEditingData({ username: user.username, email: user.email, password: '' });
    setModalOpen(true);
  };
  // Enviar datos del modal para crear o actualizar usuario
  const handleModalSubmit = async (form: Partial<RegisterData>) => {
    setLoading(true);
    setError(null);
    try {
      if (editingId) {
        await updateUsuarioApi(editingId, form);
      } else {
        await createUsuarioApi(form as RegisterData);
      }
      setModalOpen(false);
      setEditingId(null);
      setEditingData({ username: '', email: '', password: '' });
      await loadUsers();
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message || 'Error al guardar usuario');
    }
    setLoading(false);
  };
  // Eliminar usuario
  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    setLoading(true);
    setError(null);
    try {
      await deleteUsuarioApi(id);
      await loadUsers();
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message || 'Error al eliminar usuario');
    }
    setLoading(false);
  };
  return (
    <div className="user-mgmt-container">
      <h1>Gestión de Usuarios</h1>
      <button style={{ marginBottom: 18 }} onClick={handleOpenCreate}>
        Crear usuario
      </button>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <table className="user-mgmt-list">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={4}>No hay usuarios.</td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td className="user-mgmt-actions">
                  <button onClick={() => handleEdit(user)}>Editar</button>
                  <button onClick={() => handleDelete(user.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <ModalUserForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        loading={loading}
        initialData={editingData}
        editing={!!editingId}
      />
    </div>
  );
};

export default UserManagementPage;