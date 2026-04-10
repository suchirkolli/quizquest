import { Link } from 'react-router-dom';

function Register() {
  return (
    <div className="wrap">
      <div className="panel">
        <h1 className="title">Choose Your Role</h1>

        <p className="text">Select how you want to use Quiz Quest.</p>

        <div className="grid">
          <div className="card">
            <div className="card-top">Teacher</div>

            <div className="card-body">
              <p className="card-text">
                Build quests, manage content, and review student results.
              </p>

              <ul className="list">
                <li>Create quiz-based quest content</li>
                <li>Edit and manage your created quests</li>
                <li>Use the dashboard to organize your work</li>
              </ul>

              <div className="buttons">
                <Link className="button" to="/register/teacher">
                  Embark as Teacher
                </Link>
              </div>
            </div>
          </div>

          <div className="card green">
            <div className="card-top">Student</div>

            <div className="card-body">
              <p className="card-text">
                Play quests, answer questions, and view available runs.
              </p>

              <ul className="list">
                <li>Join interactive study adventures</li>
                <li>Open your dashboard after login</li>
                <li>Start teacher-made quests as more features are added</li>
              </ul>

              <div className="buttons">
                <Link className="button" to="/register/student">
                  Embark as Student
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="box">
          <p className="box-title">Registration Rules</p>
          <ul className="list">
            <li>Username must be between 3 and 30 characters</li>
            <li>Password must be at least 6 characters</li>
            <li>Confirm password must match your password</li>
            <li>Each account must use a unique username</li>
            <li>After registration, you will go to login and then open your dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Register;