import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import NavBar from './components/NavBar';
import Welcome from './pages/Welcome';

type PlaceholderPageProps = {
  title: string;
  text: string;
};

function PlaceholderPage({ title, text }: PlaceholderPageProps) {
  return (
    <div>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  );
}

function App() {
  return (
    <div>
      <NavBar />

      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />

        <Route path="/welcome" element={<Welcome />} />

        <Route
          path="/login"
          element={
            <PlaceholderPage
              title="Login"
              text="This is the temporary login page route."
            />
          }
        />

        <Route
          path="/register"
          element={
            <PlaceholderPage
              title="Register"
              text="This is the temporary register page route."
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;