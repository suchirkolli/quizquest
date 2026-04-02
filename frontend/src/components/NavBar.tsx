import { Link, useNavigate } from 'react-router-dom';

function NavBar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/welcome');
  }

  return (
    <nav className="bar">
      <div className="brand">Quiz Quest</div>

      <div className="links">
        {token ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button className="nav-logout-btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/welcome">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default NavBar;