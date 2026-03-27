import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function TeacherRegister() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (username.trim() === '' || password.trim() === '') {
      setMessage('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
          role: 'TEACHER',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Could not create account.');
        return;
      }

      setMessage('');
      navigate('/login', {
        state: {
          message: 'Registration successful. Please log in.',
        },
      });
    } catch {
      setMessage('Could not connect to the server.');
    }
  }

  return (
    <form onSubmit={handleRegister}>
      <div className="wrap">
        <div className="panel small-panel form-text">
          <h1 className="title">Teacher Registration</h1>

          <p className="text">
            Create quiz runs, manage content, and review results.
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
              Create Account
            </button>
          </div>

          <p>
            <Link className="form-link" to="/register">
              Choose a Different Role
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}

export default TeacherRegister;