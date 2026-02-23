import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTask, deleteTask, getTasks, updateTask, logout } from '../../services/api';
import '../../styles/board.css';

const STATUS_LABELS = {
  todo: 'To Do',
  doing: 'Doing',
  done: 'Done',
};

const DATE_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const formatCreatedAt = (value) => {
  if (!value) return 'Sin fecha';
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return 'Fecha invalida';
  return DATE_FORMATTER.format(parsedDate);
};

const COLUMN_STATUSES = ['todo', 'doing', 'done'];

const MOVE_TARGETS = {
  todo: ['doing', 'done'],
  doing: ['done', 'todo'],
  done: ['todo', 'doing'],
};

export default function Board() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getTasks();
        setTasks(data);
      } catch (loadError) {
        setError('No se pudieron cargar las tareas');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  const openLogoutModal = () => {
    setError('');
    setIsLogoutModalOpen(true);
  };

  const closeLogoutModal = () => {
    if (isLoggingOut) return;
    setIsLogoutModalOpen(false);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      setError('No se pudo cerrar sesión');
    } finally {
      localStorage.removeItem('token');
      navigate('/login');
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const normalizedSearch = searchText.trim().toLowerCase();

  const filteredTasks = tasks.filter((task) => {
    if (!normalizedSearch) return true;
    const currentTitle = (task.title || '').toLowerCase();
    const currentDescription = (task.description || '').toLowerCase();
    return (
      currentTitle.includes(normalizedSearch) ||
      currentDescription.includes(normalizedSearch)
    );
  });

  const tasksByStatus = filteredTasks.reduce(
    (acc, task) => {
      if (acc[task.status]) {
        acc[task.status].push(task);
      }
      return acc;
    },
    { todo: [], doing: [], done: [] }
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload = { title, description, status };
      const created = await createTask(payload);
      setTasks((prev) => [created, ...prev]);
      setTitle('');
      setDescription('');
      setStatus('todo');
    } catch (createError) {
      setError('No se pudo crear la tarea');
    }
  };

  const handleMove = async (taskId, newStatus) => {
    setError('');

    try {
      const updated = await updateTask(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updated : task))
      );
    } catch (moveError) {
      setError('No se pudo mover la tarea');
    }
  };

  const handleDragStart = (taskId) => {
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverStatus(null);
  };

  const handleColumnDragOver = (e, columnStatus) => {
    e.preventDefault();
    if (dragOverStatus !== columnStatus) {
      setDragOverStatus(columnStatus);
    }
  };

  const handleColumnDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    const draggedTask = tasks.find((task) => task.id === draggedTaskId);

    if (!draggedTask || draggedTask.status === newStatus) {
      handleDragEnd();
      return;
    }

    await handleMove(draggedTaskId, newStatus);
    handleDragEnd();
  };

  const openDeleteModal = (task) => {
    setError('');
    setTaskToDelete(task);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setTaskToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTask(taskToDelete.id);
      setTasks((prev) => prev.filter((task) => task.id !== taskToDelete.id));
      setTaskToDelete(null);
    } catch (deleteError) {
      setError('No se pudo eliminar la tarea');
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (task) => {
    setError('');
    setTaskToEdit(task);
    setEditTitle(task.title || '');
    setEditDescription(task.description || '');
  };

  const closeEditModal = () => {
    if (isEditing) return;
    setTaskToEdit(null);
    setEditTitle('');
    setEditDescription('');
  };

  const handleConfirmEdit = async (e) => {
    e.preventDefault();
    if (!taskToEdit) return;

    setError('');
    setIsEditing(true);

    try {
      const updated = await updateTask(taskToEdit.id, {
        title: editTitle,
        description: editDescription,
      });

      setTasks((prev) =>
        prev.map((task) => (task.id === taskToEdit.id ? updated : task))
      );

      setTaskToEdit(null);
      setEditTitle('');
      setEditDescription('');
    } catch (editError) {
      setError('No se pudo editar la tarea');
    } finally {
      setIsEditing(false);
    }
  };

  const renderTaskCard = (task) => (
    <article
      key={task.id}
      className={`board-task-card ${draggedTaskId === task.id ? 'board-task-card-dragging' : ''}`}
      draggable
      onDragStart={() => handleDragStart(task.id)}
      onDragEnd={handleDragEnd}
    >
      <div className="board-task-head">
        <h3>{task.title}</h3>
        <button
          className="board-icon-btn"
          onClick={() => openEditModal(task)}
          type="button"
          aria-label="Editar tarea"
          title="Editar tarea"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 20h4l10-10-4-4L4 16v4Zm12-13 2 2 1.2-1.2a1 1 0 0 0 0-1.4l-.6-.6a1 1 0 0 0-1.4 0L16 7Z" />
          </svg>
        </button>
      </div>
      <p>{task.description || 'Sin descripcion'}</p>
      <small className="board-task-date">
      Creada: {formatCreatedAt(task.created_at)}
      </small>
      <div className="board-task-actions">
        {MOVE_TARGETS[task.status].map((targetStatus) => (
          <button
            key={`${task.id}-${targetStatus}`}
            className="board-ghost-btn"
            onClick={() => handleMove(task.id, targetStatus)}
            type="button"
          >
            Mover a {STATUS_LABELS[targetStatus]}
          </button>
        ))}
        <button
          className="board-danger-btn"
          onClick={() => openDeleteModal(task)}
          type="button"
        >
          Eliminar
        </button>
      </div>
    </article>
  );

  return (
    <div className="board-page">
      <header className="board-header">
        <div className="board-title-group">
          <p className="board-eyebrow">Kanban Workspace</p>
          <h1 className="board-title">Tablero de tareas</h1>
        </div>
        <div className="board-total">
          <span>Total</span>
          <strong>{filteredTasks.length}</strong>
        </div>
        <button className="board-logout-btn" type="button" onClick={openLogoutModal}>
          Cerrar sesion
        </button>
      </header>

      <section className="board-create-card">
        <h2>Nueva tarea</h2>
        <form className="board-create-form" onSubmit={handleCreate}>
          <input
            className="board-input"
            type="text"
            placeholder="Titulo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            className="board-input"
            type="text"
            placeholder="Descripcion corta"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <select
            className="board-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="todo">To Do</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
          </select>
          <button className="board-primary-btn" type="submit">
            Crear tarea
          </button>
        </form>
      </section>

      <section className="board-filter-card">
        <h2>Filtrar tareas</h2>
        <input
          className="board-input board-filter-input"
          type="text"
          placeholder="Buscar por titulo o descripcion"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </section>

      {loading && <p className="board-message">Cargando...</p>}
      {error && <p className="board-message board-error">{error}</p>}

      <div className="board-grid">
        {COLUMN_STATUSES.map((columnStatus) => {
          const columnTasks = tasksByStatus[columnStatus];

          return (
            <section
              key={columnStatus}
              className={`board-column ${dragOverStatus === columnStatus ? 'board-column-over' : ''}`}
              onDragOver={(e) => handleColumnDragOver(e, columnStatus)}
              onDrop={(e) => handleColumnDrop(e, columnStatus)}
            >
              <div className="board-column-head">
                <h2>{STATUS_LABELS[columnStatus]}</h2>
                <span>{columnTasks.length}</span>
              </div>

              {columnTasks.length === 0 ? (
                <p className="board-empty">Sin tareas</p>
              ) : (
                columnTasks.map((task) => renderTaskCard(task))
              )}
            </section>
          );
        })}
      </div>

      {taskToEdit && (
        <div className="board-modal-backdrop" onClick={closeEditModal}>
          <div
            className="board-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-task-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="edit-task-title">Editar tarea</h3>
            <form className="board-edit-form" onSubmit={handleConfirmEdit}>
              <label className="board-edit-field">
                <span>Titulo</span>
                <input
                  className="board-input"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={255}
                  required
                  disabled={isEditing}
                />
              </label>
              <label className="board-edit-field">
                <span>Descripcion corta</span>
                <textarea
                  className="board-input board-textarea"
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  maxLength={255}
                  disabled={isEditing}
                />
              </label>
              <div className="board-modal-actions">
                <button
                  className="board-ghost-btn"
                  type="button"
                  onClick={closeEditModal}
                  disabled={isEditing}
                >
                  Cancelar
                </button>
                <button className="board-primary-btn" type="submit" disabled={isEditing}>
                  {isEditing ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {taskToDelete && (
        <div className="board-modal-backdrop" onClick={closeDeleteModal}>
          <div
            className="board-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-task-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delete-task-title">Eliminar tarea</h3>
            <p>
              Vas a eliminar <strong>{taskToDelete.title}</strong>. Esta accion no se
              puede deshacer.
            </p>
            <div className="board-modal-actions">
              <button
                className="board-ghost-btn"
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                className="board-danger-btn"
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Si, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLogoutModalOpen && (
        <div className="board-modal-backdrop" onClick={closeLogoutModal}>
          <div
            className="board-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="logout-modal-title">Cerrar sesion</h3>
            <p>
              Vas a cerrar la sesion actual. Para volver al tablero tienes que
              iniciar sesion otra vez.
            </p>
            <div className="board-modal-actions">
              <button
                className="board-ghost-btn"
                type="button"
                onClick={closeLogoutModal}
                disabled={isLoggingOut}
              >
                Cancelar
              </button>
              <button
                className="board-danger-btn"
                type="button"
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Cerrando...' : 'Si, cerrar sesion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
