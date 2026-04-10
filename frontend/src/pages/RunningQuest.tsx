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

interface ResultAnswer {
  questionId: number;
  prompt: string;
  selectedIndex: number | null;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
}

interface SubmitResult {
  attemptId: number;
  questId: number;
  score: number;
  totalQuestions: number;
  answers: ResultAnswer[];
}

function RunningQuest() {
  const navigate = useNavigate();
  const { id } = useParams();

  const token = localStorage.getItem('token');
  const rawUser = localStorage.getItem('user');

  const [quest, setQuest] = useState<RunQuestData | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<SubmitResult | null>(null);

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

  function getChoiceText(questionId: number, choiceIndex: number | null) {
    if (!quest) {
      return '';
    }

    const foundQuestion = quest.questions.find((question) => question.id === questionId);

    if (!foundQuestion) {
      return '';
    }

    if (choiceIndex === null) {
      return 'No answer selected';
    }

    return foundQuestion.choices[choiceIndex] || '';
  }

  async function handleSubmitRun() {
    if (!quest || !id) {
      return;
    }

    if (Object.keys(answers).length < quest.questions.length) {
      setMessage('Please answer every question before submitting.');
      return;
    }

    const submitAnswers: { questionId: number; selectedIndex: number }[] = [];

    for (let i = 0; i < quest.questions.length; i++) {
      const question = quest.questions[i];
      const selectedIndex = answers[question.id];

      if (selectedIndex === undefined) {
        setMessage('Please answer every question before submitting.');
        return;
      }

      submitAnswers.push({
        questionId: question.id,
        selectedIndex: selectedIndex,
      });
    }

    setSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(`http://localhost:3000/api/play/quests/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers: submitAnswers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Could not submit quest.');
        return;
      }

      setResult(data.result);
      setMessage(data.message || 'Quest submitted successfully.');
    } catch {
      setMessage('Could not connect to the server.');
    } finally {
      setSubmitting(false);
    }
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

  if (message !== '' && !quest && !result) {
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
          <h1 className="quest-creation-title">
            {result ? 'Quest Result' : 'Run Quest'}
          </h1>

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

            {!result && (
              <p className="quest-creation-subtitle">
                Answer each question below, then submit your run.
              </p>
            )}

            {result && (
              <p className="quest-creation-subtitle">
                Your run is complete. Review your answers below.
              </p>
            )}
          </div>

          {message !== '' && (
            <p
              className={result ? 'quest-creation-subtitle' : 'error'}
              style={{ textAlign: 'center' }}
            >
              {message}
            </p>
          )}

          {!result && (
            <>
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

                <button
                  type="button"
                  className="qc-gold-button forge-button quest-action-btn"
                  onClick={handleSubmitRun}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Run'}
                </button>
              </div>
            </>
          )}

          {result && (
            <>
              <div className="dashboard-stats-bar">
                <span>
                  Score: <strong>{result.score}</strong>
                </span>
                <span className="dashboard-stats-divider">|</span>
                <span>
                  Total: <strong>{result.totalQuestions}</strong>
                </span>
                <span className="dashboard-stats-divider">|</span>
                <span>
                  Attempt Id: <strong>{result.attemptId}</strong>
                </span>
              </div>

              {result.answers.map((answer, index) => (
                <div key={answer.questionId} className="question-block">
                  <h3 className="question-block-title">
                    Question {index + 1}
                  </h3>

                  <div className="question-block-fields">
                    <div className="row">
                      <label className="quest-field-label">Prompt</label>
                      <div className="qc-input-field">{answer.prompt}</div>
                    </div>

                    <div className="row">
                      <label className="quest-field-label">Your Answer</label>
                      <div className="qc-input-field">
                        {getChoiceText(answer.questionId, answer.selectedIndex)}
                      </div>
                    </div>

                    <div className="row">
                      <label className="quest-field-label">Correct Answer</label>
                      <div className="qc-input-field">
                        {getChoiceText(answer.questionId, answer.correctIndex)}
                      </div>
                    </div>

                    <div className="row">
                      <label className="quest-field-label">Result</label>
                      <div className="qc-input-field">
                        {answer.isCorrect ? 'Correct' : 'Incorrect'}
                      </div>
                    </div>

                    <div className="row">
                      <label className="quest-field-label">Explanation</label>
                      <div className="qc-input-field">{answer.explanation}</div>
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

                <button
                  type="button"
                  className="qc-gold-button forge-button quest-action-btn"
                  onClick={() => window.location.reload()}
                >
                  Retry This Page
                </button>
              </div>
            </>
          )}

          <div className="box">
            <p className="box-title">Phase 3 Status</p>
            <p>
              This page now loads a quest, lets the student answer it, submits
              the answers to the backend, and shows the result on the same page.
            </p>
            <p>
              Next, we can add attempt history or simple abilities without
              changing the backend structure.
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