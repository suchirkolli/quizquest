// References:
// React useState: https://react.dev/reference/react/useState
// React useEffect: https://react.dev/reference/react/useEffect
// React Router useNavigate: https://reactrouter.com/api/hooks/useNavigate
// React Router useParams: https://reactrouter.com/api/hooks/useParams
// MDN Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
// MDN localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
// MDN setTimeout: https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Click } from '../components/SoundEffects';
import Healthbar from '../components/HealthBar';

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
  shieldBlockedDamage: boolean;
  fiftyUsed: boolean;
  freezeUsed: boolean;
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

  const [shieldAvailable, setShieldAvailable] = useState(true);
  const [shieldActive, setShieldActive] = useState(false);

  const [fiftyAvailable, setFiftyAvailable] = useState(true);
  const [fiftyHiddenIndexes, setFiftyHiddenIndexes] = useState<number[]>([]);
  const [fiftyUsedThisQuestion, setFiftyUsedThisQuestion] = useState(false);

  const [freezeAvailable, setFreezeAvailable] = useState(true);
  const [freezeActive, setFreezeActive] = useState(false);

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
    if (loading || !quest || runFinished || questionResult || checking || freezeActive) {
      return;
    }

    if (timeLeft <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [loading, quest, runFinished, questionResult, checking, freezeActive, timeLeft]);

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
        setAttemptMessage('No answers were saved.');
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
        setAttemptMessage('Attempt saved.');
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

  function handleUseShield() {
    if (!shieldAvailable || shieldActive || questionResult || runFinished) {
      return;
    }

    setShieldActive(true);
    setMessage('Shield is on.');
  }

  async function handleUseFifty() {
    if (!quest || !id || !token) {
      return;
    }

    if (!fiftyAvailable || questionResult || runFinished || checking) {
      return;
    }

    const currentQuestion = quest.questions[currentQuestionIndex];

    if (!currentQuestion) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/play/quests/${id}/questions/${currentQuestion.id}/fifty`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Could not use 50/50.');
        return;
      }

      const hideIndexes: number[] = data.result.hideIndexes || [];

      setFiftyHiddenIndexes(hideIndexes);
      setFiftyUsedThisQuestion(true);
      setFiftyAvailable(false);

      if (selectedIndex !== null && hideIndexes.includes(selectedIndex)) {
        setSelectedIndex(null);
      }

      setMessage('50/50 is on.');
    } catch {
      setMessage('Could not connect to the server.');
    }
  }

  function handleUseFreeze() {
    if (!freezeAvailable || freezeActive || questionResult || runFinished) {
      return;
    }

    setFreezeActive(true);
    setFreezeAvailable(false);
    setMessage('Timer is frozen.');
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

    const shieldWasActive = shieldActive;
    const fiftyWasUsed = fiftyUsedThisQuestion;
    const freezeWasUsed = freezeActive;

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

      const shieldBlockedDamage = shieldWasActive && !data.result.isCorrect;

      const review: ReviewItem = {
        questionId: currentQuestion.id,
        prompt: currentQuestion.prompt,
        choices: currentQuestion.choices,
        selectedIndex: data.result.selectedIndex,
        correctIndex: data.result.correctIndex,
        isCorrect: data.result.isCorrect,
        explanation: data.result.explanation,
        timedOut: timedOut,
        shieldBlockedDamage: shieldBlockedDamage,
        fiftyUsed: fiftyWasUsed,
        freezeUsed: freezeWasUsed,
      };

      setQuestionResult(review);
      setRunResults((prev) => [...prev, review]);

      if (!review.isCorrect) {
        if (shieldBlockedDamage) {
          setShieldAvailable(false);
        } else {
          setHealth((prev) => Math.max(prev - 1, 0));
        }
      }

      setShieldActive(false);
      setFreezeActive(false);
    } catch {
      setMessage('Could not connect to the server.');
    } finally {
      setChecking(false);
    }
  }

  function handleConfirmAnswer() {
    if (selectedIndex === null) {
      setMessage('Choose an answer first.');
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
    setShieldActive(false);
    setFiftyHiddenIndexes([]);
    setFiftyUsedThisQuestion(false);
    setFreezeActive(false);
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-max-width">
          <div className="parchment-container">
            <div className="quest-creation-intro">
              <h1 className="quest-creation-build-title">Loading</h1>
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
              <h1 className="quest-creation-build-title">Error</h1>
              <p className="error">{message}</p>
            </div>

            <div className="buttons">
              <button type="button" className="button" onClick={handleGoBack}>
                Back
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
            {runFinished ? 'Summary' : 'Quest'}
          </h1>

          <div className="quest-creation-header-actions">
            <button
              type="button"
              className="qc-gold-button quest-header-btn"
              onClick={handleGoBack}
            >
              Back
            </button>
          </div>
        </div>

        <div className="parchment-container">
          <div className="quest-creation-intro">
            <h2 className="quest-creation-build-title">{quest.title}</h2>

            {!runFinished && (
              <p className="quest-creation-subtitle">
                Answer each question before your health runs out.
              </p>
            )}

            {runFinished && (
              <p className="quest-creation-subtitle">
                Here are your results.
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
                  Health: <Healthbar healthNumber={health} />
                </span>
                <span className="dashboard-stats-divider">|</span>
                <span>
                  Time: <strong>{timeLeft}</strong>
                </span>
                <span className="dashboard-stats-divider">|</span>
                <span>
                  Shield:{' '}
                  <strong>{shieldActive ? 'On' : shieldAvailable ? 'Ready' : 'Used'}</strong>
                </span>
                <span className="dashboard-stats-divider">|</span>
                <span>
                  50/50: <strong>{fiftyAvailable ? 'Ready' : 'Used'}</strong>
                </span>
                <span className="dashboard-stats-divider">|</span>
                <span>
                  Freeze:{' '}
                  <strong>{freezeActive ? 'On' : freezeAvailable ? 'Ready' : 'Used'}</strong>
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
                      <label className="quest-field-label">Question</label>
                      <div className="qc-input-field">{currentQuestion.prompt}</div>
                    </div>

                    <div className="row">
                      <label className="quest-field-label">Answers</label>

                      <div className="options-grid">
                        {currentQuestion.choices.map((choice, choiceIndex) => {
                          if (fiftyHiddenIndexes.includes(choiceIndex)) {
                            return null;
                          }

                          return (
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
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="quest-form-actions">
                    <button
                      type="button"
                      className="qc-gold-button quest-action-btn"
                      onClick={handleGoBack}
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      className="qc-gold-button quest-action-btn"
                      onClick={handleUseShield}
                      disabled={!shieldAvailable || shieldActive || checking}
                    >
                      {shieldActive ? 'Shield On' : shieldAvailable ? 'Shield' : 'Shield Used'}
                    </button>

                    <button
                      type="button"
                      className="qc-gold-button quest-action-btn"
                      onClick={handleUseFifty}
                      disabled={!fiftyAvailable || checking}
                    >
                      {fiftyAvailable ? '50/50' : '50/50 Used'}
                    </button>

                    <button
                      type="button"
                      className="qc-gold-button quest-action-btn"
                      onClick={handleUseFreeze}
                      disabled={!freezeAvailable || freezeActive || checking}
                    >
                      {freezeActive ? 'Freeze On' : freezeAvailable ? 'Freeze' : 'Freeze Used'}
                    </button>

                    <button
                      type="button"
                      className="qc-gold-button forge-button quest-action-btn"
                      onClick={handleConfirmAnswer}
                      disabled={checking}
                    >
                      {checking ? 'Checking...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              )}

              {questionResult && (
                <div className="question-block">
                  <h3 className="question-block-title">
                    Review
                  </h3>

                  <div className="question-block-fields">
                    <div className="row">
                      <label className="quest-field-label">Question</label>
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
                        {questionResult.isCorrect ? 'Correct' : 'Wrong'}
                      </div>
                    </div>

                    <div className="row">
                      <label className="quest-field-label">Explanation</label>
                      <div className="qc-input-field">
                        {questionResult.explanation}
                      </div>
                    </div>

                    <div className="row">
                      <label className="quest-field-label">Health</label>
                      <div className="qc-input-field">{health}</div>
                    </div>

                    {questionResult.shieldBlockedDamage && (
                      <div className="row">
                        <label className="quest-field-label">Shield</label>
                        <div className="qc-input-field">
                          Shield blocked the damage.
                        </div>
                      </div>
                    )}

                    {questionResult.fiftyUsed && (
                      <div className="row">
                        <label className="quest-field-label">50/50</label>
                        <div className="qc-input-field">
                          50/50 was used here.
                        </div>
                      </div>
                    )}

                    {questionResult.freezeUsed && (
                      <div className="row">
                        <label className="quest-field-label">Freeze</label>
                        <div className="qc-input-field">
                          Freeze was used here.
                        </div>
                      </div>
                    )}

                    {questionResult.timedOut && (
                      <div className="row">
                        <label className="quest-field-label">Time</label>
                        <div className="qc-input-field">
                          Time ran out.
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
                      Back
                    </button>

                    <button
                      type="button"
                      className="qc-gold-button forge-button quest-action-btn"
                      onClick={handleNextQuestion}
                    >
                      {health <= 0 || currentQuestionIndex >= quest.questions.length - 1
                        ? 'Summary'
                        : 'Next'}
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
                  Health: <strong>{health}</strong>
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
                  Shield: <strong>{shieldAvailable ? 'Ready' : 'Used'}</strong>
                </span>
                <span className="dashboard-stats-divider">|</span>
                <span>
                  50/50: <strong>{fiftyAvailable ? 'Ready' : 'Used'}</strong>
                </span>
                <span className="dashboard-stats-divider">|</span>
                <span>
                  Freeze: <strong>{freezeAvailable ? 'Ready' : 'Used'}</strong>
                </span>
                <span className="dashboard-stats-divider">|</span>
                <span>
                  Seen: <strong>{runResults.length}</strong> /{' '}
                  <strong>{quest.questions.length}</strong>
                </span>
              </div>

              <div className="box">
                <p className="box-title">Status</p>

                {health <= 0 ? (
                  <p>You ran out of health.</p>
                ) : (
                  <p>You finished the quest.</p>
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
                      <label className="quest-field-label">Question</label>
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
                        {item.isCorrect ? 'Correct' : 'Wrong'}
                      </div>
                    </div>

                    <div className="row">
                      <label className="quest-field-label">Explanation</label>
                      <div className="qc-input-field">{item.explanation}</div>
                    </div>

                    {item.shieldBlockedDamage && (
                      <div className="row">
                        <label className="quest-field-label">Shield</label>
                        <div className="qc-input-field">
                          Shield blocked damage here.
                        </div>
                      </div>
                    )}

                    {item.fiftyUsed && (
                      <div className="row">
                        <label className="quest-field-label">50/50</label>
                        <div className="qc-input-field">
                          50/50 was used here.
                        </div>
                      </div>
                    )}

                    {item.freezeUsed && (
                      <div className="row">
                        <label className="quest-field-label">Freeze</label>
                        <div className="qc-input-field">
                          Freeze was used here.
                        </div>
                      </div>
                    )}

                    {item.timedOut && (
                      <div className="row">
                        <label className="quest-field-label">Time</label>
                        <div className="qc-input-field">
                          No answer was chosen in time.
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
                  onClick={() => {handleGoBack(); Click();}} // Added clicking sound 
                >
                  Back
                </button>

                <button
                  type="button"
                  className="qc-gold-button forge-button quest-action-btn"
                  onClick={() => { Click(); window.location.reload(); }}
                >
                  Retry
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RunningQuest;