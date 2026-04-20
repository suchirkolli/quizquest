// References:
// React useState: https://react.dev/reference/react/useState
// React useEffect: https://react.dev/reference/react/useEffect
// React Router useNavigate, useParams: https://reactrouter.com/api/hooks/useNavigate
// MDN Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
import { Fragment, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Click } from '../components/SoundEffects';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

interface AttemptSummary {
  id: number;
  score: number;
  totalQuestions: number;
  createdAt: string;
  quest: { id: number; title: string };
}

interface AttemptAnswer {
  id: number;
  questionId: number;
  selectedIndex: number;
  isCorrect: boolean;
  question: {
    prompt: string;
    explanation: string;
    correctIndex: number;
  };
}

interface AttemptDetail {
  id: number;
  score: number;
  totalQuestions: number;
  createdAt: string;
  quest: { id: number; title: string };
  answers: AttemptAnswer[];
}

function QuestStats() {
  const navigate = useNavigate();
  const { questId } = useParams();

  const token = localStorage.getItem('token');
  const rawUser = localStorage.getItem('user');

  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [expandedAttemptId, setExpandedAttemptId] = useState<number | null>(null);
  const [expandedDetail, setExpandedDetail] = useState<AttemptDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!token || !rawUser) {
      navigate('/login');
      return;
    }

    async function fetchAttempts() {
      try {
        const response = await fetch('http://localhost:3000/api/play/attempts/mine', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.message || 'Could not load attempts.');
          return;
        }
        const filtered = (data.attempts as AttemptSummary[]).filter(
          (a) => a.quest.id === Number(questId)
        );
        setAttempts(filtered);
      } catch {
        setError('Could not connect to the server.');
      } finally {
        setLoading(false);
      }
    }

    fetchAttempts();
  }, [questId, navigate, token, rawUser]);

  async function handleToggleReview(attemptId: number) {
    if (expandedAttemptId === attemptId) {
      setExpandedAttemptId(null);
      setExpandedDetail(null);
      return;
    }

    setExpandedAttemptId(attemptId);
    setExpandedDetail(null);
    setLoadingDetail(true);

    try {
      const response = await fetch(`http://localhost:3000/api/play/attempts/${attemptId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Could not load attempt details.');
        setExpandedAttemptId(null);
        return;
      }
      setExpandedDetail(data.attempt);
    } catch {
      setError('Could not connect to the server.');
      setExpandedAttemptId(null);
    } finally {
      setLoadingDetail(false);
    }
  }

  const questTitle =
    attempts.length > 0 ? attempts[0].quest.title : `Quest ${questId}`;

  const bestAttempt =
    attempts.length > 0
      ? attempts.reduce((best, a) =>
          a.score / a.totalQuestions > best.score / best.totalQuestions ? a : best
        )
      : null;

  return (
    <div className="quest-creation-page">
      <div className="quest-creation-max-width">
        <div className="quest-creation-header">
          <h1 className="quest-creation-title">Quest Stats</h1>
        </div>

        <div className="parchment-container">
          <div className="quest-creation-intro">
            <h2 className="quest-creation-build-title">{questTitle}</h2>
            <p className="quest-creation-subtitle">Your attempt history for this quest</p>
          </div>

          {loading && (
            <p className="quest-creation-subtitle" style={{ textAlign: 'center' }}>
              Loading...
            </p>
          )}

          {error && (
            <p className="error" style={{ textAlign: 'center' }}>{error}</p>
          )}

          {!loading && !error && (
            <>
              <div className="dashboard-stats-bar">
                <span>
                  Total Runs: <strong>{attempts.length}</strong>
                </span>
                {bestAttempt && (
                  <>
                    <span className="dashboard-stats-divider">|</span>
                    <span>
                      Best Score:{' '}
                      <strong>
                        {bestAttempt.score} / {bestAttempt.totalQuestions}
                      </strong>
                    </span>
                  </>
                )}
              </div>

              {attempts.length === 0 ? (
                <p className="quest-creation-subtitle" style={{ textAlign: 'center' }}>
                  No attempts yet. Start a run from the dashboard!
                </p>
              ) : (
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Run</th>
                      <th>Date</th>
                      <th>Score</th>
                      <th>Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((attempt, index) => (
                      <Fragment key={attempt.id}>
                        <tr>
                          <td>{attempts.length - index}</td>
                          <td>{new Date(attempt.createdAt).toLocaleDateString()}</td>
                          <td>
                            {attempt.score} / {attempt.totalQuestions}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="qc-gold-button dashboard-action-btn"
                              onClick={() => {handleToggleReview(attempt.id);}}
                            >
                              {expandedAttemptId === attempt.id ? 'Hide' : 'Review'}
                            </button>
                          </td>
                        </tr>

                        {expandedAttemptId === attempt.id && (
                          <tr>
                            <td colSpan={4} style={{ padding: 0 }}>
                              {loadingDetail ? (
                                <p
                                  className="quest-creation-subtitle"
                                  style={{ textAlign: 'center', padding: '16px' }}
                                >
                                  Loading...
                                </p>
                              ) : expandedDetail ? (
                                <div style={{ padding: '16px 8px' }}>
                                  {expandedDetail.answers.map((answer, answerIndex) => (
                                    <div key={answer.id} className="question-block">
                                      <h3 className="question-block-title">
                                        Question {answerIndex + 1}
                                      </h3>

                                      <div className="question-block-fields">
                                        <div className="row">
                                          <label className="quest-field-label">Prompt</label>
                                          <div className="qc-input-field">
                                            {answer.question.prompt}
                                          </div>
                                        </div>

                                        <div className="row">
                                          <label className="quest-field-label">Your Answer</label>
                                          <div className="qc-input-field">
                                            Option {OPTION_LABELS[answer.selectedIndex] ?? '—'}
                                          </div>
                                        </div>

                                        <div className="row">
                                          <label className="quest-field-label">Correct Answer</label>
                                          <div className="qc-input-field">
                                            Option {OPTION_LABELS[answer.question.correctIndex]}
                                          </div>
                                        </div>

                                        <div className="row">
                                          <label className="quest-field-label">Result</label>
                                          <div className="qc-input-field">
                                            {answer.isCorrect ? 'Correct' : 'Wrong'}
                                          </div>
                                        </div>

                                        <div className="row">
                                          <label className="quest-field-label">Explanation</label>
                                          <div className="qc-input-field">
                                            {answer.question.explanation}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestStats;
