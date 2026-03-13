import { Link } from 'react-router-dom';

function Welcome() {
  return (
    <div>
      <h1>Quiz Quest</h1>

      <h2>Embark on your quest for knowledge</h2>

      <p>
        Welcome to Quiz Quest, where studying is turned into a more interactive
        and game-like experience.
      </p>

      <p>
        Choose whether you are an existing user returning to continue your quest,
        or a new user creating an account for the first time.
      </p>

      <div>
        <Link to="/login">Existing User</Link>
      </div>

      <br />

      <div>
        <Link to="/register">New Account</Link>
      </div>
    </div>
  );
}

export default Welcome;