import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

interface RunQuestion {
  id: number;
  prompt: string;
  choices: string[];
}

interface RunQuestData {
  id: number;
  title: string;
  questions: RunQuestion[];
}

interface StoredUser {
  id: number;
  username: string;
  role: 'TEACHER' | 'STUDENT';
}

function RunningQuest() {
  const navigate = useNavigate();
  const { id } = useParams();

  const token = localStorage.getItem('token');
  const rawUser = localStorage.getItem('user');

  const [quest, setQuest] = useState<RunQuestData | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || !rawUser) {
      navigate('/login');
      return;
    }

    const user: StoredUser = JSON.parse(rawUser);

    if (user.role !== 'STUDENT') {
      navigate('/dashboard');
      return;
    }

    async function fetchQuest() {
      if (!id) {
        setMessage('Quest id is missing.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/api/quests/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || 'Could not load quest.');
          setLoading(false);
          return;
        }

        setQuest(data.quest);
      } catch {
        setMessage('Could not connect to the server.');
      } finally {
        setLoading(false);
      }
    }

    fetchQuest();
  }, [id, navigate, rawUser, token]);

  function handleChoiceChange(questionId: number, choiceIndex: number) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: choiceIndex,
    }));
  }

  function handleGoBack() {
    navigate('/dashboard');
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-max-width">
          <div className="parchment-container">
            <div className="quest-creation-intro">
              <h1 className="quest-creation-build-title">Loading Quest</h1>
              <p className="quest-creation-subtitle">Please wait...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (message !== '') {
    return (
      <div className="dashboard-page">
        <div className="dashboard-max-width">
          <div className="parchment-container">
            <div className="quest-creation-intro">
              <h1 className="quest-creation-build-title">Quest Load Error</h1>
              <p className="error">{message}</p>
            </div>

            <div className="buttons">
              <button type="button" className="button" onClick={handleGoBack}>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quest) {
    return null;
  }

  return (
    <div className="quest-creation-page">
      <div className="quest-creation-max-width">
        <div className="quest-creation-header">
          <h1 className="quest-creation-title">Run Quest</h1>

          <div className="quest-creation-header-actions">
            <button
              type="button"
              className="qc-gold-button quest-header-btn"
              onClick={handleGoBack}
            >
              Dashboard
            </button>
          </div>
        </div>

        <div className="parchment-container">
          <div className="quest-creation-intro">
            <h2 className="quest-creation-build-title">{quest.title}</h2>
            <p className="quest-creation-subtitle">
              Answer each question below. Submission comes in the next phase.
            </p>
          </div>

          <div className="dashboard-stats-bar">
            <span>
              Questions: <strong>{quest.questions.length}</strong>
            </span>
            <span className="dashboard-stats-divider">|</span>
            <span>
              Answered: <strong>{Object.keys(answers).length}</strong>
            </span>
          </div>

          {quest.questions.map((question, questionIndex) => (
            <div key={question.id} className="question-block">
              <h3 className="question-block-title">
                Question {questionIndex + 1}
              </h3>

              <div className="question-block-fields">
                <div className="row">
                  <label className="quest-field-label">Prompt</label>
                  <div className="qc-input-field">{question.prompt}</div>
                </div>

                <div className="row">
                  <label className="quest-field-label">Choices</label>

                  <div className="options-grid">
                    {question.choices.map((choice, choiceIndex) => (
                      <label key={choiceIndex} className="option-row">
                        <input
                          className="option-radio"
                          type="radio"
                          name={`question-${question.id}`}
                          checked={answers[question.id] === choiceIndex}
                          onChange={() =>
                            handleChoiceChange(question.id, choiceIndex)
                          }
                        />
                        <div className="qc-input-field option-text-input">
                          {choice}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="quest-form-actions">
            <button
              type="button"
              className="qc-gold-button quest-action-btn"
              onClick={handleGoBack}
            >
              Back to Dashboard
            </button>

            <button type="button" className="qc-gold-button forge-button quest-action-btn">
              Submit Run Next Phase
            </button>
          </div>

          <div className="box">
            <p className="box-title">Phase 1 Status</p>
            <p>
              This page now loads a real quest and stores the selected answers
              in the browser.
            </p>
            <p>
              In the next phase, we will send those answers to the backend and
              show the score and explanations.
            </p>
            <p>
              <Link className="form-link" to="/dashboard">
                Return to dashboard
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RunningQuest;