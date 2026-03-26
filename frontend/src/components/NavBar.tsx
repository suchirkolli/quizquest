import { Link } from 'react-router-dom';

function NavBar() {
  return (
    <nav className="bar">
      <div className="brand">Quiz Quest</div>

      <div className="links">
        <Link to="/welcome">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
    </nav>
  );
}

export default NavBar;