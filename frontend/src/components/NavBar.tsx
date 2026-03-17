import { Link } from 'react-router-dom';

function NavBar() {
  return (
    <nav className="main-nav-bar">
      <div className="main-nav-title">Quiz Quest</div>

      <div className="main-nav-links">
        <Link to="/welcome">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
    </nav>
  );
}

export default NavBar;