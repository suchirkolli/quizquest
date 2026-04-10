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

interface ReviewItem {
  questionId: number;
  prompt: string;
  choices: string[];
  selectedIndex: number | null;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
  timedOut: boolean;
}

function RunningQuest() {
  const navigate = useNavigate();
  const { id } = useParams();

  const token = localStorage.getItem('token');
  const rawUser = localStorage.getItem('user');

  const [quest, setQuest] = useState<RunQuestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [health, setHealth] = useState(3);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);

  const [checking, setChecking] = useState(false);
  const [questionResult, setQuestionResult] = useState<ReviewItem | null>(null);
  const [runResults, setRunResults] = useState<ReviewItem[]>([]);
  const [runFinished, setRunFinished] = useState(false);

  const [savingAttempt, setSavingAttempt] = useState(false);
  const [attemptSaved, setAttemptSaved] = useState(false);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [attemptMessage, setAttemptMessage] = useState('');

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

        if (!data.quest.questions || data.quest.questions.length === 0) {
          setMessage('This quest has no questions.');
        }
      } catch {
        setMessage('Could not connect to the server.');
      } finally {
        setLoading(false);
      }
    }

    fetchQuest();
  }, [id, navigate, rawUser, token]);

  useEffect(() => {
    if (loading || !quest || runFinished || questionResult || checking) {
      return;
    }

    if (timeLeft <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [loading, quest, runFinished, questionResult, checking, timeLeft]);

  useEffect(() => {
    if (!quest || runFinished || questionResult || checking) {
      return;
    }

    if (timeLeft !== 0) {
      return;
    }

    handleCheckQuestion(null, true);
  }, [timeLeft, quest, runFinished, questionResult, checking]);

  useEffect(() => {
    if (!runFinished || attemptSaved || savingAttempt || !quest || !id || !token) {
      return;
    }

    async function saveAttempt() {
      const answersToSave = runResults
        .filter((item) => item.selectedIndex !== null)
        .map((item) => ({
          questionId: item.questionId,
          selectedIndex: item.selectedIndex as number,
        }));

      if (answersToSave.length === 0) {
        setAttemptSaved(true);
        setAttemptMessage('No answered questions were saved for this attempt.');
        return;
      }

      setSavingAttempt(true);

      try {
        const response = await fetch(`http://localhost:3000/api/play/quests/${id}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            answers: answersToSave,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setAttemptSaved(true);
          setAttemptMessage(data.message || 'Could not save attempt.');
          return;
        }

        setAttemptId(data.result?.attemptId || null);
        setAttemptSaved(true);
        setAttemptMessage('Attempt saved successfully.');
      } catch {
        setAttemptSaved(true);
        setAttemptMessage('Could not save attempt.');
      } finally {
        setSavingAttempt(false);
      }
    }

    saveAttempt();
  }, [runFinished, attemptSaved, savingAttempt, quest, id, token, runResults]);

  function handleGoBack() {
    navigate('/dashboard');
  }

  function getChoiceText(choices: string[], choiceIndex: number | null) {
    if (choiceIndex === null) {
      return 'No answer selected';
    }

    return choices[choiceIndex] || '';
  }

  async function handleCheckQuestion(
    answerIndex: number | null,
    timedOut: boolean
  ) {
    if (!quest || !id || !token || checking || questionResult) {
      return;
    }

    const currentQuestion = quest.questions[currentQuestionIndex];

    if (!currentQuestion) {
      return;
    }

    setChecking(true);
    setMessage('');

    try {
      const response = await fetch(
        `http://localhost:3000/api/play/quests/${id}/questions/${currentQuestion.id}/check`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            selectedIndex: answerIndex,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Could not check answer.');
        return;
      }

      const review: ReviewItem = {
        questionId: currentQuestion.id,
        prompt: currentQuestion.prompt,
        choices: currentQuestion.choices,
        selectedIndex: data.result.selectedIndex,
        correctIndex: data.result.correctIndex,
        isCorrect: data.result.isCorrect,
        explanation: data.result.explanation,
        timedOut: timedOut,
      };

      setQuestionResult(review);
      setRunResults((prev) => [...prev, review]);

      if (!review.isCorrect) {
        setHealth((prev) => prev - 1);
      }
    } catch {
      setMessage('Could not connect to the server.');
    } finally {
      setChecking(false);
    }
  }

  function handleConfirmAnswer() {
    if (selectedIndex === null) {
      setMessage('Please choose an answer before confirming.');
      return;
    }

    handleCheckQuestion(selectedIndex, false);
  }

  function handleNextQuestion() {
    if (!quest || !questionResult) {
      return;
    }

    const lastQuestion = currentQuestionIndex >= quest.questions.length - 1;
    const noHealthLeft = health <= 0;

    if (lastQuestion || noHealthLeft) {
      setQuestionResult(null);
      setRunFinished(true);
      return;
    }

    setCurrentQuestionIndex((prev) => prev + 1);
    setSelectedIndex(null);
    setQuestionResult(null);
    setTimeLeft(15);
    setMessage('');
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

  if (message !== '' && !quest) {
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

  const currentQuestion = quest.questions[currentQuestionIndex];
  const correctCount = runResults.filter((item) => item.isCorrect).length;
  const wrongCount = runResults.filter((item) => !item.isCorrect).length;

  return (
    <div className="quest-creation-page">
      <div className="quest-creation-max-width">
        <div className="quest-creation-header">
          <h1 className="quest-creation-title">
            {runFinished ? 'Quest Summary' : 'Run Quest'}
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

            {!runFinished && (
              <p className="quest-creation-subtitle">
                Answer one question at a time before your health runs out.
              </p>
            )}

            {runFinished && (
              <p className="quest-creation-subtitle">
                Your run is over. Review your full quest summary below.
              </p>
            )}
          </div>

          {message !== '' && quest && !runFinished && (
            <p className="error" style={{ textAlign: 'center' }}>
              {message}
            </p>
          )}

          {!runFinished && currentQuestion && (
            <>
              <div className="dashboard-stats-bar">
                <span>
                  Health: <strong>{health}</strong>
                </span>
                <span className="dashboard-stats-divider">|</span>
                <span>
                  Time Left: <strong>{timeLeft}</strong>
                </span>
                <span className="dashboard-stats-divider">|</span>
                <span>
                  Question: <strong>{currentQuestionIndex + 1}</strong> /{' '}
                  <strong>{quest.questions.length}</strong>
                </span>
              </div>

              {!questionResult && (
                <div className="question-block">
                  <h3 className="question-block-title">
                    Question {currentQuestionIndex + 1}
                  </h3>

                  <div className="question-block-fields">
                    <div className="row">
                      <label className="quest-field-label">Prompt</label>
                      <div className="qc-input-field">{currentQuestion.prompt}</div>
                    </div>

                    <div className="row">
                      <label className="quest-field-label">Choices</label>

                      <div className="options-grid">
                        {currentQuestion.choices.map((choice, choiceIndex) => (
                          <label key={choiceIndex} className="option-row">
                            <input
                              className="option-radio"
                              type="radio"
                              name={`question-${currentQuestion.id}`}
                              checked={selectedIndex === choiceIndex}
                              onChange={() => setSelectedIndex(choiceIndex)}
                            />
                            <div className="qc-input-field option-text-input">
                              {choice}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

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
                      onClick={handleConfirmAnswer}
                      disabled={checking}
                    >
                      {checking ? 'Checking...' : 'Confirm Answer'}
                    </button>
                  </div>
                </div>
              )}

              {questionResult && (
                <div className="question-block">
                  <h3 className="question-block-title">
                    Review for Question {currentQuestionIndex + 1}
                  </h3>

                  <div className="question-block-fields">
                    <div className="row">
                      <label className="quest-field-label">Prompt</label>
                      <div className="qc-input-field">{questionResult.prompt}</div>
                    </div>

                    <div className="row">
                      <label className="quest-field-label">Your Answer</label>
                      <div className="qc-input-field">
                        {getChoiceText(
                          questionResult.choices,
                          questionResult.selectedIndex
                        )}
                      </div>
                    </div>

                    <div className="row">
                      <label className="quest-field-label">Correct Answer</label>
                      <div className="qc-input-field">
                        {getChoiceText(
                          questionResult.choices,
                          questionResult.correctIndex
                        )}
                      </div>
                    </div>

                    <div className="row">
                      <label className="quest-field-label">Result</label>
                      <div className="qc-input-field">
                        {questionResult.isCorrect ? 'Correct' : 'Incorrect'}
                      </div>
                    </div>

                    <div className="row">
                      <label className="quest-field-label">Explanation</label>
                      <div className="qc-input-field">
                        {questionResult.explanation}
                      </div>
                    </div>

                    <div className="row">
                      <label className="quest-field-label">Health Now</label>
                      <div className="qc-input-field">{health}</div>
                    </div>

                    {questionResult.timedOut && (
                      <div className="row">
                        <label className="quest-field-label">Timer</label>
                        <div className="qc-input-field">
                          Time ran out on this question.
                        </div>
                      </div>
                    )}
                  </div>

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
                      onClick={handleNextQuestion}
                    >
                      {health <= 0 || currentQuestionIndex >= quest.questions.length - 1
                        ? 'View Final Summary'
                        : 'Next Question'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {runFinished && (
            <>
              <div className="dashboard-stats-bar">
                <span>
                  Health Left: <strong>{health}</strong>
                </span>
                <span className="dashboard-stats-divider">|</span>
                <span>
                  Correct: <strong>{correctCount}</strong>
                </span>
                <span className="dashboard-stats-divider">|</span>
                <span>
                  Wrong: <strong>{wrongCount}</strong>
                </span>
                <span className="dashboard-stats-divider">|</span>
                <span>
                  Questions Seen: <strong>{runResults.length}</strong> /{' '}
                  <strong>{quest.questions.length}</strong>
                </span>
              </div>

              <div className="box">
                <p className="box-title">Run Status</p>
                {health <= 0 ? (
                  <p>You ran out of health before finishing the full quest.</p>
                ) : (
                  <p>You completed the quest run.</p>
                )}

                {savingAttempt && <p>Saving attempt...</p>}
                {!savingAttempt && attemptMessage !== '' && <p>{attemptMessage}</p>}
                {attemptId !== null && <p>Attempt Id: {attemptId}</p>}
              </div>

              {runResults.map((item, index) => (
                <div key={item.questionId} className="question-block">
                  <h3 className="question-block-title">
                    Question {index + 1}
                  </h3>

                  <div className="question-block-fields">
                    <div className="row">
                      <label className="quest-field-label">Prompt</label>
                      <div className="qc-input-field">{item.prompt}</div>
                    </div>

                    <div className="row">
                      <label className="quest-field-label">Your Answer</label>
                      <div className="qc-input-field">
                        {getChoiceText(item.choices, item.selectedIndex)}
                      </div>
                    </div>

                    <div className="row">
                      <label className="quest-field-label">Correct Answer</label>
                      <div className="qc-input-field">
                        {getChoiceText(item.choices, item.correctIndex)}
                      </div>
                    </div>

                    <div className="row">
                      <label className="quest-field-label">Result</label>
                      <div className="qc-input-field">
                        {item.isCorrect ? 'Correct' : 'Incorrect'}
                      </div>
                    </div>

                    <div className="row">
                      <label className="quest-field-label">Explanation</label>
                      <div className="qc-input-field">{item.explanation}</div>
                    </div>

                    {item.timedOut && (
                      <div className="row">
                        <label className="quest-field-label">Timer</label>
                        <div className="qc-input-field">
                          No answer was selected before time ran out.
                        </div>
                      </div>
                    )}
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
                  Retry This Quest
                </button>
              </div>
            </>
          )}

          <div className="box">
            <p className="box-title">Phase 5 Status</p>
            <p>
              This run page now uses health, a timer, one question at a time,
              immediate question review, and a final summary at the end.
            </p>
            <p>
              The next phase can add the first real protective powerup without
              changing the teacher quest flow.
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