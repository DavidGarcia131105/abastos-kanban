import { use, useState } from 'react';
import { data, useActionData, useNavigate } from 'react-router-dom';
import { login } from '../../services/api';
import '../../styles/login.css';


export default function Login(){
    const navigate = useNavigate();
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try{
            await login(email,password);
            console.log(data);
            navigate('/board');
        }catch(err){
            setError('Email o contraseña inválidos');
        }finally{
            setLoading(false);
        }
    }

      return (
    <div className="page">
      <main className="login-grid">
        <section className="login-card">
          <div className="login-header">
            <p className="login-kicker">Bienvenido</p>
            <h1>Inicia sesión</h1>
            <p className="login-subtitle">Accede a tu tablero Kanban.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Correo</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@abastos.com"
                autoComplete="username"
                required
              />
            </label>

            <label className="field">
              <span>Contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </label>

            {error && <p style={{ color: 'crimson' }}>{error}</p>}

            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Iniciar sesión'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );

}