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
                Build quiz runs, manage content, and review results.
              </p>

              <ul className="list">
                <li>Create quiz-based quest content</li>
                <li>Set up runs for students to complete</li>
                <li>Review performance and results later</li>
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
                Play through quest runs and answer quiz questions.
              </p>

              <ul className="list">
                <li>Join interactive study adventures</li>
                <li>Complete quiz runs and answer questions</li>
                <li>Track progress as more features are added</li>
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
          <p className="box-title">Another box</p>
          <p>idk what to put here yet probably more directions its a nice box tho</p>
        </div>
      </div>
    </div>
  );
}

export default Register;