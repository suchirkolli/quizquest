// References:
// React useState: https://react.dev/reference/react/useState
// React useEffect: https://react.dev/reference/react/useEffect
// React Router useNavigate: https://reactrouter.com/api/hooks/useNavigate
// MDN Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
// MDN localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Shape of a quest row returned by GET /api/quests/mine
interface TeacherQuest {
  id: number;
  title: string;
  createdAt: string;
  questions: { id: number }[];
}

// Shape of a quest row returned by GET /api/quests/all (includes owner info)
interface StudentQuest {
  id: number;
  title: string;
  createdAt: string;
  owner: { username: string };
  _count: { questions: number };
}

// Shape of user stored in localStorage after login
interface StoredUser {
  id: number;
  username: string;
  role: 'TEACHER' | 'STUDENT';
}

function Dashboard() {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const rawUser = localStorage.getItem('user');

  // Redirect if not logged in
  useEffect(() => {
    if (!token || !rawUser) {
      navigate('/login');
    }
  }, [token, rawUser, navigate]);

  if (!token || !rawUser) return null;

  const user: StoredUser = JSON.parse(rawUser);

  return user.role === 'TEACHER' ? (
    <TeacherDashboard user={user} token={token} />
  ) : (
    <StudentDashboard user={user} token={token} />
  );
}

// ─── Teacher Dashboard ────────────────────────────────────────────────────────

function TeacherDashboard({ user, token }: { user: StoredUser; token: string }) {
  const navigate = useNavigate();
  const [quests, setQuests] = useState<TeacherQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuests();
  }, []);

  async function fetchQuests() {
    try {
      const response = await fetch('http://localhost:3000/api/quests/mine', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Could not load quests.');
        return;
      }
      setQuests(data.quests);
    } catch {
      setError('Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      const response = await fetch(`http://localhost:3000/api/quests/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setQuests((prev) => prev.filter((q) => q.id !== id));
      } else {
        const data = await response.json();
        alert(data.message || 'Could not delete quest.');
      }
    } catch {
      alert('Could not connect to the server.');
    }
  }

  const totalQuestions = quests.reduce((sum, q) => sum + q.questions.length, 0);

  return (
    <div className="dashboard-page">
      <div className="dashboard-max-width">

        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">Admin Dashboard</h1>
        </div>

        {/* Parchment container */}
        <div className="parchment-container">

          {/* Intro */}
          <div className="dashboard-intro">
            <h2 className="quest-creation-build-title">Welcome, {user.username}</h2>
            
          </div>

          {/* Stats bar */}
          <div className="dashboard-stats-bar">
            <span>Total Quests Created: <strong>{quests.length}</strong></span>
            <span className="dashboard-stats-divider">|</span>
            <span>Total Questions: <strong>{totalQuestions}</strong></span>
          </div>

          {/* Two-column layout */}
          <div className="dashboard-columns">

            {/* Left: Quest Creation Hub */}
            <div className="dashboard-card">
              <div className="dashboard-card-header">Quest Creation</div>
              <div className="dashboard-card-body">
                <p className="dashboard-card-desc">
                  Design new trials for your students. Each quest is a unique interactive run.
                </p>
                <button
                  type="button"
                  className="qc-gold-button forge-button dashboard-create-btn"
                  onClick={() => {navigate('/admin/create-quest');}} 
                >
                  + Create New Quest
                </button>
              </div>
            </div>

            {/* Right: Manage Quests */}
            <div className="dashboard-card">
              <div className="dashboard-card-header">Manage Your Created Quests</div>
              <div className="dashboard-card-body">
                {loading && <p className="quest-creation-subtitle">Loading quests...</p>}
                {error && <p className="error">{error}</p>}
                {!loading && !error && quests.length === 0 && (
                  <p className="quest-creation-subtitle">No quests yet. Create one!</p>
                )}
                {!loading && quests.length > 0 && (
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Quest Title</th>
                        <th>Date Created</th>
                        <th># Questions</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quests.map((quest) => (
                        <tr key={quest.id}>
                          <td>{quest.title}</td>
                          <td>{new Date(quest.createdAt).toLocaleDateString()}</td>
                          <td>{quest.questions.length} Q</td>
                          <td className="dashboard-table-actions">
                            <button
                              type="button"
                              className="qc-gold-button dashboard-action-btn"
                              onClick={() => {navigate(`/admin/create-quest/${quest.id}`);}}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="qc-gold-button dashboard-delete-btn"
                              onClick={() => {handleDelete(quest.id);}} 
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Student Dashboard ────────────────────────────────────────────────────────

function StudentDashboard({ user, token }: { user: StoredUser; token: string }) {
  const navigate = useNavigate();
  const [quests, setQuests] = useState<StudentQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchQuests() {
      try {
        const response = await fetch('http://localhost:3000/api/quests/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.message || 'Could not load quests.');
          return;
        }
        setQuests(data.quests);
      } catch {
        setError('Could not connect to the server.');
      } finally {
        setLoading(false);
      }
    }
    fetchQuests();
  }, []);

  function handleStartRun(questId: number) {
    navigate(`/quests/${questId}/run`);
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-max-width">

        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">Welcome, {user.username}!</h1>
        </div>

        {/* Parchment container */}
        <div className="parchment-container">

          <div className="quest-creation-intro">
            <h2 className="quest-creation-build-title">Explore Teacher Quests</h2>
            <p className="quest-creation-subtitle">Browse the world of knowledge runs</p>
          </div>

          {loading && <p className="quest-creation-subtitle" style={{ textAlign: 'center' }}>Loading quests...</p>}
          {error && <p className="error" style={{ textAlign: 'center' }}>{error}</p>}
          {!loading && !error && quests.length === 0 && (
            <p className="quest-creation-subtitle" style={{ textAlign: 'center' }}>No quests available yet.</p>
          )}

          {!loading && quests.length > 0 && (
            <div className="student-quest-list">
              {quests.map((quest) => (
                <div key={quest.id} className="student-quest-row">
                  <div className="student-quest-info">
                    <span className="student-quest-title">{quest.title}</span>
                    <span className="student-quest-meta">
                      Created by {quest.owner.username} &nbsp;·&nbsp; {quest._count.questions} questions
                    </span>
                  </div>
                  <div className="student-quest-actions">
                    <button
                      type="button"
                      className="qc-gold-button forge-button dashboard-action-btn"
                      onClick={() => {handleStartRun(quest.id);}}
                    >
                      Start Run
                    </button>
                    <button
                      type="button"
                      className="qc-gold-button dashboard-action-btn"
                      onClick={() => { navigate(`/quests/${quest.id}/stats`);}}
                    >
                      View Stats
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
