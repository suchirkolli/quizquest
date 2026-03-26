import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import NavBar from './components/NavBar';
import Register from './pages/Register';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import AdminQuestCreation from './pages/AdminQuestCreation';

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
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div>
      {!isAdminPage && <NavBar />}

      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />

        <Route path="/welcome" element={<Welcome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/create-quest" element={<AdminQuestCreation />} />

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