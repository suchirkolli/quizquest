import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const firstMessage =
    (location.state as { message?: string } | null)?.message || '';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(firstMessage);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (username.trim() === '' || password.trim() === '') {
      setMessage('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Invalid username or password.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setMessage('');
      navigate('/dashboard');
    } catch {
      setMessage('Could not connect to the server.');
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <div className="wrap">
        <div className="panel small-panel form-text">
          <h1 className="title">Login</h1>

          <p className="text">
            Enter your username and password to open your dashboard.
          </p>

          <label>Username: </label>
          <input
            type="text"
            name="username"
            placeholder="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />

          <p></p>

          <label>Password: </label>
          <input
            type="password"
            name="password"
            placeholder="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <p></p>

          <p className="error">{message}</p>

          <div className="buttons">
            <button className="button" type="submit">
              Log In
            </button>
          </div>

          <p>
            <Link className="form-link" to="/register">
              Need a new account?
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}

export default Login;