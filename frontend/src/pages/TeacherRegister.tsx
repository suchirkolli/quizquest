import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function TeacherRegister() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanUsername = username.trim();

    if (
      cleanUsername === '' ||
      password.trim() === '' ||
      confirmPassword.trim() === ''
    ) {
      setMessage('Please fill in all fields.');
      return;
    }

    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      setMessage('Username must be between 3 and 30 characters.');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: cleanUsername,
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
          message: 'Teacher account created. Please log in.',
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
            Create a teacher account to manage quests and use the dashboard.
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

          <label>Confirm Password: </label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="confirm password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
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

          <div className="box">
            <p className="box-title">Registration Rules</p>
            <ul className="list">
              <li>Username must be between 3 and 30 characters</li>
              <li>Password must be at least 6 characters</li>
              <li>Confirm password must match your password</li>
              <li>Each teacher account must use a unique username</li>
              <li>After registration, you will go to login</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}

export default TeacherRegister;