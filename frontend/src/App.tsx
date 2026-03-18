import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import NavBar from './components/NavBar';
import Register from './pages/Register';
import Welcome from './pages/Welcome';

type PlaceholderPageProps = {
  title: string;
  text: string;
};

function PlaceholderPage({ title, text }: PlaceholderPageProps) {
  return (
    <div className="page-placeholder">
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
        <Route path="/register" element={<Register />} />

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
          path="/register/teacher"
          element={
            <PlaceholderPage
              title="Teacher Registration"
              text="This is the temporary teacher registration route."
            />
          }
        />

        <Route
          path="/register/student"
          element={
            <PlaceholderPage
              title="Student Registration"
              text="This is the temporary student registration route."
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;