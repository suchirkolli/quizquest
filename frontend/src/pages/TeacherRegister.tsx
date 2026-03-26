import { Link } from 'react-router-dom';

function TeacherRegister() {
  return (
    <form>
      <div className="wrap">
        <div className="panel small-panel form-text">
          <h1 className="title">Teacher Registration</h1>

          <p className="text">
            Create quiz runs, manage content, and review results.
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

export default TeacherRegister;