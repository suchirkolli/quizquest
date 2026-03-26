import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import NavBar from './components/NavBar';
import Register from './pages/Register';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import AdminQuestCreation from './pages/AdminQuestCreation';

type TempProps = {
  title: string;
  text: string;
};

function TempPage({ title, text }: TempProps) {
  return (
    <div className="wrap">
      <div className="panel small-panel">
        <h1 className="title">{title}</h1>
        <p className="text">{text}</p>
      </div>
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/create-quest" element={<AdminQuestCreation />} />

        <Route
          path="/register/teacher"
          element={
            <TempPage
              title="Teacher Registration"
              text="This page will be built in the next phase."
            />
          }
        />

        <Route
          path="/register/student"
          element={
            <TempPage
              title="Student Registration"
              text="This page will be built in the next phase."
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;