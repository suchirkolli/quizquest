// Represents a single question inside a quest
export interface Question {
  prompt: string;          // The question text, e.g. "What is the capital of France?"
  choices: [string, string, string, string];  // Exactly 4 answer options (A, B, C, D)
  correctIndex: 0 | 1 | 2 | 3;              // Which choice is correct (0=A, 1=B, 2=C, 3=D)
  explanation: string;     // Why the correct answer is right, shown after wrong answer
}

// Represents the full quest as it's being built in the creation form
export interface Quest {
  title: string;           // The name of the quest, e.g. "Middle Earth History"
  questions: Question[];   // A list of Question objects (can be 1 or many)
}

// Represents a quest returned from the backend after it has been saved
// Extends Quest and adds server-generated fields
export interface SavedQuest extends Quest {
  id: string;              // Unique ID assigned by the database 
  ownerId: string;         // The ID of the admin who created this quest
  createdAt: string;       // Timestamp of when it was saved, e.g. "2026-03-24T00:00:00.000Z"
}
