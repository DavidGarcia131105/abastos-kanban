import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks,createTask } from '../../services/api';


export default function Board() {
    const navigate = useNavigate();
    const [tasks,setTasks] = useState([]);
    const [error,setError] = useState('');
    const [loading,setLoading] = useState(true);
    const [title,setTitle] = useState('');
    const [description,setDescription] = useState('');
    const [status,setStatus] = useState('todo');

    useEffect(() => {

        const loadTasks = async () => {
            setLoading(true);
            setError('');

        try {
            const data = await getTasks();
            setTasks(data);
        } catch (error) {
            setError('No se pudieron cargar las tareas');

        } finally {
            setLoading(false);
        }

        }

        loadTasks();

    }, [navigate]);


    const todoTasks = tasks.filter(task => task.status === 'todo');
    const doingTasks = tasks.filter(task => task.status === 'doing');
    const doneTasks = tasks.filter(task => task.status === 'done');

   const handleCreate = async (e) => {
  e.preventDefault();
  try {
    const payload = { title, description, status };
    const created = await createTask(payload);
    setTasks((prev) => [created, ...prev]);
    setTitle('');
    setDescription('');
    setStatus('todo');
  } catch (error) {
    setError('No se pudo crear la tarea');
  }
};


    return (
  <div>

    <form onSubmit={handleCreate}>
  <input
    type="text"
    placeholder="Título"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    required
  />

  <input
    type="text"
    placeholder="Descripción corta"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
  />

  <select value={status} onChange={(e) => setStatus(e.target.value)}>
    <option value="todo">To Do</option>
    <option value="doing">Doing</option>
    <option value="done">Done</option>
  </select>

  <button type="submit">Crear tarea</button>
</form>

    <h1>Tablero</h1>

    {loading && <p>Cargando...</p>}
    {error && <p>{error}</p>}

    <div className="board">
      <section className="column">
        <h2>To Do</h2>
        {todoTasks.length === 0 ? (
          <p>Sin tareas</p>
        ) : (
          todoTasks.map((task) => (
            <article key={task.id} className="task">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
            </article>
          ))
        )}
      </section>

      <section className="column">
        <h2>Doing</h2>
        {doingTasks.length === 0 ? (
          <p>Sin tareas</p>
        ) : (
          doingTasks.map((task) => (
            <article key={task.id} className="task">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
            </article>
          ))
        )}
      </section>

      <section className="column">
        <h2>Done</h2>
        {doneTasks.length === 0 ? (
          <p>Sin tareas</p>
        ) : (
          doneTasks.map((task) => (
            <article key={task.id} className="task">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
            </article>
          ))
        )}
      </section>
    </div>
  </div>
);


}