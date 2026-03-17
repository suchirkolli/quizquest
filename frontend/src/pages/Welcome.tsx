import { Link } from 'react-router-dom';

function Welcome() {
  return (
    <div className="welcome-page-wrapper">
      <div className="welcome-panel">
        <div className="welcome-top-text">Welcome to Quiz Quest</div>

        <h1 className="welcome-main-title">Embark on your quest for knowledge</h1>

        <p className="welcome-description">
          Quiz Quest turns studying into a more interactive and game-like
          experience.
        </p>

        <p className="welcome-description">
          Choose whether you want to return as an existing user or create a new
          account and begin your journey.
        </p>

        <div className="welcome-button-area">
          <Link className="quest-link-button" to="/login">
            Existing User
          </Link>

          <Link className="quest-link-button" to="/register">
            New Account
          </Link>
        </div>

        <div className="welcome-small-box">
          <p className="welcome-small-box-title">Mock data:</p>
          <p>username: gandalf</p>
          <p>passowrd: wizard101</p>
        </div>
      </div>
    </div>
  );
}

export default Welcome;