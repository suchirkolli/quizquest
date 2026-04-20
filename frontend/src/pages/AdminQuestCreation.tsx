// References:
// React useState – https://react.dev/reference/react/useState
// React useEffect - https://react.dev/reference/react/useEffect
// React Router useParams – https://reactrouter.com/en/main/hooks/use-params
// MDN Fetch API – https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
// MDN localStorage – https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Quest, Question } from '../types/Quest';
import { Click } from '../components/SoundEffects';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const blankQuestion = (): Question => ({
  prompt: '',
  choices: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
});

function AdminQuestCreation() {
  const { id } = useParams();

  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([blankQuestion()]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadQuest() {
      if (!id) return;

      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You must be logged in as a teacher.');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/api/quests/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || 'Could not load quest.');
          return;
        }

        setTitle(data.quest.title);
        setQuestions(data.quest.questions);
      } catch {
        setMessage('Could not connect to the server.');
      } finally {
        setLoading(false);
      }
    }

    loadQuest();
  }, [id]);

  function handleAddQuestion() {
    setQuestions([...questions, blankQuestion()]);
  }

  function handleQuestionChange(index: number, updated: Question) {
    const newQuestions = [...questions];
    newQuestions[index] = updated;
    setQuestions(newQuestions);
  }

  function handleDeleteQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('You must be logged in as a teacher.');
      return;
    }

    const quest: Quest = { title, questions };

    try {
      const url = id
        ? `http://localhost:3000/api/quests/${id}`
        : 'http://localhost:3000/api/quests';

      const method = id ? 'PUT' : 'POST';

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

      setMessage(id ? 'Quest updated successfully.' : 'Quest saved successfully.');

      if (!id) {
        setTitle('');
        setQuestions([blankQuestion()]);
      }
    } catch {
      setMessage('Could not connect to the server.');
    }
  }

  return (
    <div className="quest-creation-page">
      <div className="quest-creation-max-width">
        <div className="quest-creation-header">
          <h1 className="quest-creation-title">
            {id ? 'Edit Quest' : 'Question Creation'}
          </h1>
        </div>

        <div className="parchment-container">
          <div className="quest-creation-intro">
            <h2 className="quest-creation-build-title">
              {id ? 'Edit Your Quest' : 'Build Your Quest'}
            </h2>
            <p className="quest-creation-subtitle">
              Establish the challenge for your students
            </p>
          </div>

          {loading ? (
            <p className="quest-creation-subtitle">Loading quest...</p>
          ) : (
            <form onSubmit={handleSubmit}>
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

              <div>
                {questions.map((q, index) => (
                  <div key={index} className="question-block">
                    <div className="question-block-header">
                      <h3 className="question-block-title">Question #{index + 1}</h3>
                      {index > 0 && (
                        <button
                          type="button"
                          className="qc-gold-button dashboard-delete-btn"
                          onClick={() => { handleDeleteQuestion(index); Click(); }}
                        >
                          Delete Question
                        </button>
                      )}
                    </div>

                    <div className="question-block-fields">
                      <input
                        type="text"
                        placeholder="Enter the question text..."
                        className="qc-input-field question-prompt-input"
                        value={q.prompt}
                        onChange={(e) =>
                          handleQuestionChange(index, { ...q, prompt: e.target.value })
                        }
                      />

                      <div className="options-grid">
                        {q.choices.map((choice, choiceIndex) => (
                          <div key={choiceIndex} className="option-row">
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

                      <div className="explanation-section">
                        <label className="quest-field-label">Explanation (Learning Feedback)</label>
                        <textarea
                          rows={2}
                          placeholder="Why is this the correct answer?"
                          className="qc-input-field explanation-textarea"
                          value={q.explanation}
                          onChange={(e) =>
                            handleQuestionChange(index, { ...q, explanation: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {message && <p className="error">{message}</p>}

              <div className="quest-form-actions">
                <button
                  type="button"
                  className="qc-gold-button quest-action-btn"
                  onClick={() => {handleAddQuestion(); Click();}} // SFX
                >
                  + Add Another Question
                </button>
                <button type="submit" className="qc-gold-button quest-action-btn forge-button">
                  {id ? 'Update Quest' : 'Forge Quest (Save)'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminQuestCreation;