import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import NavBar from './components/NavBar';
import Register from './pages/Register';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import AdminQuestCreation from './pages/AdminQuestCreation';
import TeacherRegister from './pages/TeacherRegister';
import StudentRegister from './pages/StudentRegister';
import Dashboard from './pages/Dashboard';
import RunningQuest from './pages/RunningQuest';

function App() {
  return (
    <div>
      <NavBar />

      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />

        <Route path="/welcome" element={<Welcome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/create-quest/:id?" element={<AdminQuestCreation />} />
        <Route path="/quests/:id/run" element={<RunningQuest />} />

        <Route path="/register/teacher" element={<TeacherRegister />} />
        <Route path="/register/student" element={<StudentRegister />} />
      </Routes>
    </div>
  );
}

export default App;