import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTask, deleteTask, getTasks, updateTask, logout } from '../../services/api';
import '../../styles/board.css';

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

  const todoTasks = filteredTasks.filter((task) => task.status === 'todo');
  const doingTasks = filteredTasks.filter((task) => task.status === 'doing');
  const doneTasks = filteredTasks.filter((task) => task.status === 'done');

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
        <section
          className={`board-column ${dragOverStatus === 'todo' ? 'board-column-over' : ''}`}
          onDragOver={(e) => handleColumnDragOver(e, 'todo')}
          onDrop={(e) => handleColumnDrop(e, 'todo')}
        >
          <div className="board-column-head">
            <h2>To Do</h2>
            <span>{todoTasks.length}</span>
          </div>
          {todoTasks.length === 0 ? (
            <p className="board-empty">Sin tareas</p>
          ) : (
            todoTasks.map((task) => (
              <article
                key={task.id}
                className={`board-task-card ${draggedTaskId === task.id ? 'board-task-card-dragging' : ''}`}
                draggable
                onDragStart={() => handleDragStart(task.id)}
                onDragEnd={handleDragEnd}
              >
                <h3>{task.title}</h3>
                <p>{task.description || 'Sin descripcion'}</p>
                <div className="board-task-actions">
                  <button
                    className="board-ghost-btn"
                    onClick={() => handleMove(task.id, 'doing')}
                    type="button"
                  >
                    Mover a Doing
                  </button>
                  <button
                    className="board-ghost-btn"
                    onClick={() => handleMove(task.id, 'done')}
                    type="button"
                  >
                    Mover a Done
                  </button>
                  <button
                    className="board-danger-btn"
                    onClick={() => openDeleteModal(task)}
                    type="button"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        <section
          className={`board-column ${dragOverStatus === 'doing' ? 'board-column-over' : ''}`}
          onDragOver={(e) => handleColumnDragOver(e, 'doing')}
          onDrop={(e) => handleColumnDrop(e, 'doing')}
        >
          <div className="board-column-head">
            <h2>Doing</h2>
            <span>{doingTasks.length}</span>
          </div>
          {doingTasks.length === 0 ? (
            <p className="board-empty">Sin tareas</p>
          ) : (
            doingTasks.map((task) => (
              <article
                key={task.id}
                className={`board-task-card ${draggedTaskId === task.id ? 'board-task-card-dragging' : ''}`}
                draggable
                onDragStart={() => handleDragStart(task.id)}
                onDragEnd={handleDragEnd}
              >
                <h3>{task.title}</h3>
                <p>{task.description || 'Sin descripcion'}</p>
                <div className="board-task-actions">
                  <button
                    className="board-ghost-btn"
                    onClick={() => handleMove(task.id, 'done')}
                    type="button"
                  >
                    Mover a Done
                  </button>
                  <button
                    className="board-ghost-btn"
                    onClick={() => handleMove(task.id, 'todo')}
                    type="button"
                  >
                    Mover a To Do
                  </button>
                  <button
                    className="board-danger-btn"
                    onClick={() => openDeleteModal(task)}
                    type="button"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        <section
          className={`board-column ${dragOverStatus === 'done' ? 'board-column-over' : ''}`}
          onDragOver={(e) => handleColumnDragOver(e, 'done')}
          onDrop={(e) => handleColumnDrop(e, 'done')}
        >
          <div className="board-column-head">
            <h2>Done</h2>
            <span>{doneTasks.length}</span>
          </div>
          {doneTasks.length === 0 ? (
            <p className="board-empty">Sin tareas</p>
          ) : (
            doneTasks.map((task) => (
              <article
                key={task.id}
                className={`board-task-card ${draggedTaskId === task.id ? 'board-task-card-dragging' : ''}`}
                draggable
                onDragStart={() => handleDragStart(task.id)}
                onDragEnd={handleDragEnd}
              >
                <h3>{task.title}</h3>
                <p>{task.description || 'Sin descripcion'}</p>
                <div className="board-task-actions">
                  <button
                    className="board-ghost-btn"
                    onClick={() => handleMove(task.id, 'todo')}
                    type="button"
                  >
                    Mover a To Do
                  </button>
                  <button
                    className="board-ghost-btn"
                    onClick={() => handleMove(task.id, 'doing')}
                    type="button"
                  >
                    Mover a Doing
                  </button>
                  <button
                    className="board-danger-btn"
                    onClick={() => openDeleteModal(task)}
                    type="button"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </div>

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
