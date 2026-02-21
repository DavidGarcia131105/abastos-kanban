import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks } from '../../services/api';


export default function Board() {
    const navigate = useNavigate();
    const [tasks,setTasks] = useState([]);
    const [error,setError] = useState('');
    const [loading,setLoading] = useState(true);

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

    return (
  <div>
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