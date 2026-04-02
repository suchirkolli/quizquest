import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Question } from '../types/Quest';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

// A blank question — used as the default starting question and when adding new ones
const blankQuestion = (): Question => ({
  prompt: '',
  choices: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
});

function AdminQuestCreation() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);

  // State: the quest title
  const [title, setTitle] = useState('');

  // State: the list of questions — starts with one blank question
  const [questions, setQuestions] = useState<Question[]>([blankQuestion()]);

  const [message, setMessage] = useState('');

  // When editing, load the existing quest data and pre-fill the form
  useEffect(() => {
    if (!isEditMode) return;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('http://localhost:3000/api/quests/mine', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const quest = data.quests?.find(
          (q: { id: number }) => q.id === Number(id)
        );
        if (!quest) {
          setMessage('Quest not found.');
          return;
        }
        setTitle(quest.title);
        // Convert from backend column format (choiceA/B/C/D) back to the choices array
        setQuestions(
          quest.questions.map((q: {
            prompt: string;
            choiceA: string;
            choiceB: string;
            choiceC: string;
            choiceD: string;
            correctIndex: 0 | 1 | 2 | 3;
            explanation: string;
          }) => ({
            prompt: q.prompt,
            choices: [q.choiceA, q.choiceB, q.choiceC, q.choiceD] as [string, string, string, string],
            correctIndex: q.correctIndex,
            explanation: q.explanation,
          }))
        );
      })
      .catch(() => setMessage('Could not load quest data.'));
  }, [id, isEditMode, navigate]);

  // Adds a new blank question to the bottom of the list
  function handleAddQuestion() {
    setQuestions([...questions, blankQuestion()]);
  }

  // Updates a specific question by its index in the array
  function handleQuestionChange(index: number, updated: Question) {
    const newQuestions = [...questions];
    newQuestions[index] = updated;
    setQuestions(newQuestions);
  }

  // Called when the form is submitted
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const quest = { title, questions };
    const token = localStorage.getItem('token');

    if (!token) {
      setMessage('You must be logged in as a teacher.');
      return;
    }

    const url = isEditMode
      ? `http://localhost:3000/api/quests/${id}`
      : 'http://localhost:3000/api/quests';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(quest),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Could not save quest.');
        return;
      }

      navigate('/dashboard');
    } catch {
      setMessage('Could not connect to the server.');
    }
  }

  return (
    <div className="quest-creation-page">
      <div className="quest-creation-max-width">

        {/* Page header: title on left, nav buttons on right */}
        <div className="quest-creation-header">
          <h1 className="quest-creation-title">{isEditMode ? 'Edit Quest' : 'Question Creation'}</h1>
          <div className="quest-creation-header-actions">
            <button type="button" className="qc-gold-button quest-header-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button type="button" className="qc-gold-button quest-header-btn" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/welcome'); }}>Logout</button>
          </div>
        </div>

        {/* Main parchment container with double gold border */}
        <div className="parchment-container">

          {/* Centered intro section */}
          <div className="quest-creation-intro">
            <h2 className="quest-creation-build-title">{isEditMode ? 'Edit Your Quest' : 'Build Your Quest'}</h2>
            <p className="quest-creation-subtitle">Establish the challenge for your students</p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Quest title field */}
            <div className="quest-title-section">
              <div className="quest-title-field">
                <label className="quest-field-label">Quest Title</label>
                <input
                  type="text"
                  placeholder="e.g. Middle Earth History"
                  className="qc-input-field"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            {/* Dynamic list of question blocks */}
            <div>
              {questions.map((q, index) => (
                <div key={index} className="question-block">
                  <h3 className="question-block-title">Question #{index + 1}</h3>

                  <div className="question-block-fields">
                    {/* Question prompt */}
                    <input
                      type="text"
                      placeholder="Enter the question text..."
                      className="qc-input-field question-prompt-input"
                      value={q.prompt}
                      onChange={(e) => handleQuestionChange(index, { ...q, prompt: e.target.value })}
                    />

                    {/* 2x2 answer options grid */}
                    <div className="options-grid">
                      {q.choices.map((choice, choiceIndex) => (
                        <div key={choiceIndex} className="option-row">
                          {/* Radio button — only one can be selected per question */}
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            className="option-radio"
                            checked={q.correctIndex === choiceIndex}
                            onChange={() =>
                              handleQuestionChange(index, {
                                ...q,
                                correctIndex: choiceIndex as 0 | 1 | 2 | 3,
                              })
                            }
                          />
                          <input
                            type="text"
                            placeholder={`Option ${OPTION_LABELS[choiceIndex]}`}
                            className="qc-input-field option-text-input"
                            value={choice}
                            onChange={(e) => {
                              const newChoices = [...q.choices] as [string, string, string, string];
                              newChoices[choiceIndex] = e.target.value;
                              handleQuestionChange(index, { ...q, choices: newChoices });
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Explanation textarea */}
                    <div className="explanation-section">
                      <label className="quest-field-label">Explanation (Learning Feedback)</label>
                      <textarea
                        rows={2}
                        placeholder="Why is this the correct answer?"
                        className="qc-input-field explanation-textarea"
                        value={q.explanation}
                        onChange={(e) => handleQuestionChange(index, { ...q, explanation: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom action buttons */}
            {message && <p className="form-message">{message}</p>}
            <div className="quest-form-actions">
              <button type="button" className="qc-gold-button quest-action-btn" onClick={handleAddQuestion}>
                + Add Another Question
              </button>
              <button type="submit" className="qc-gold-button quest-action-btn forge-button">
                {isEditMode ? 'Save Changes' : 'Forge Quest (Save)'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminQuestCreation;