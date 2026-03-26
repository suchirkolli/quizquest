import { Link } from 'react-router-dom';

function Welcome() {
  return (
    <div className="wrap">
      <div className="panel">
        <div className="small">Welcome to Quiz Quest</div>

        <h1 className="title">Embark on your quest for knowledge</h1>

        <p className="text">
          Quiz Quest turns studying into a more interactive and game-like
          experience.
        </p>

        <p className="text">
          Choose whether you want to return as an existing user or create a new
          account and begin your journey.
        </p>

        <div className="buttons">
          <Link className="button" to="/login">
            Existing User
          </Link>

          <Link className="button" to="/register">
            New Account
          </Link>
        </div>

        <div className="box">
          <p className="box-title">Mock data:</p>
          <p>username: gandalf</p>
          <p>password: wizard101</p>
        </div>
      </div>
    </div>
  );
}

export default Welcome;