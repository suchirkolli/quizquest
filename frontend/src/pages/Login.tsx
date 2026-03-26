import { Link } from 'react-router-dom';

function Login() {
  return (
    <form>
      <div className="wrap">
        <div className="panel small-panel form-text">
          <h1 className="title">Login</h1>

          <p className="text">
            Enter your username and password to continue.
          </p>

          <label>Username: </label>
          <input type="text" name="username" placeholder="username" />

          <p></p>

          <label>Password: </label>
          <input type="text" name="password" placeholder="password" />

          <p></p>

          <p className="error">
            error message here if login is incorrect in some way, shape, or form
          </p>

          <div className="buttons">
            <button className="button" type="button">
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