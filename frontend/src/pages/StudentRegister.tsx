import { Link } from 'react-router-dom';

function StudentRegister() {
  return (
    <form>
      <div className="wrap">
        <div className="panel small-panel form-text">
          <h1 className="title">Student Registration</h1>

          <p className="text">
            Join interactive quiz adventures and track your progress.
          </p>

          <label>Username: </label>
          <input type="text" name="username" placeholder="username" />

          <p></p>

          <label>Password: </label>
          <input type="text" name="password" placeholder="password" />

          <p></p>

          <p className="error">
            error message here if account creation is incorrect in some way, shape, or form
          </p>

          <div className="buttons">
            <button className="button" type="button">
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

export default StudentRegister;