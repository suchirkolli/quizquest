import { Link } from 'react-router-dom';

function NavBar() {
    return (
        <nav>
            <h2>Quiz Quest</h2>
            <div>
                <Link to="/welcome">Home</Link>{' '}
                <Link to="/login">Login</Link>{' '}
                <Link to="/register">Register</Link>
            </div>
        </nav>
    );
}
export default NavBar;