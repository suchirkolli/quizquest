import { Link } from 'react-router-dom';

function Register() {
  return (
    <div className="register-role-page-wrapper">
      <div className="register-role-panel">
        <h1 className="register-role-title">Choose Your Role</h1>

        <p className="register-role-subtitle">
          Select how you want to use Quiz Quest.
        </p>

        <div className="register-role-card-grid">
          <div className="register-role-card teacher-card">
            <div className="register-role-card-header">Teacher</div>

            <div className="register-role-card-body">
              <p className="register-role-big-text">
                Build quiz runs, manage content, and review results.
              </p>

              <ul className="register-role-list">
                <li>Create quiz-based quest content</li>
                <li>Set up runs for students to complete</li>
                <li>Review performance and results later</li>
              </ul>

              <div className="register-role-button-area">
                <Link className="quest-link-button" to="/register/teacher">
                  Embark as Teacher
                </Link>
              </div>
            </div>
          </div>

          <div className="register-role-card student-card">
            <div className="register-role-card-header">Student</div>

            <div className="register-role-card-body">
              <p className="register-role-big-text">
                Play through quest runs and answer quiz questions.
              </p>

              <ul className="register-role-list">
                <li>Join interactive study adventures</li>
                <li>Complete quiz runs and answer questions</li>
                <li>Track progress as more features are added</li>
              </ul>

              <div className="register-role-button-area">
                <Link className="quest-link-button" to="/register/student">
                  Embark as Student
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="welcome-small-box">
          <p className="welcome-small-box-title">Another box</p>
          <p>idk what to put here yet probably more directions its  a nice box tho</p>
        </div>
      </div>
    </div>
  );
}

export default Register;