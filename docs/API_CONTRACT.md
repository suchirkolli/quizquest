# QuizQuest API Contract (v0.1)

This doc defines the initial REST API contract for QuizQuest.
Backend: Node.js + TypeScript
Auth: JWT (Bearer token)
DB: PostgreSQL

## Conventions
- Base URL: /api
- Auth header: Authorization: Bearer <token>
- All timestamps: ISO 8601 strings
- Error response shape:
  {
    "error": {
      "code": "STRING_CODE",
      "message": "Human readable message"
    }
  }

## Health
### GET /api/health
Response 200:
{
  "status": "ok"
}

---

# Auth

## POST /api/auth/register
Creates a new player or admin account.

Request:
{
  "email": "user@ufl.edu",
  "password": "string",
  "displayName": "string",
  "role": "PLAYER" | "ADMIN"
}

Response 201:
{
  "user": {
    "id": "uuid",
    "email": "user@ufl.edu",
    "displayName": "string",
    "role": "PLAYER" | "ADMIN",
    "createdAt": "2026-03-03T00:00:00.000Z"
  }
}

Notes:
- email must be unique
- password is stored hashed (never returned)

## POST /api/auth/login
Request:
{
  "email": "user@ufl.edu",
  "password": "string"
}

Response 200:
{
  "token": "jwt_string",
  "user": {
    "id": "uuid",
    "email": "user@ufl.edu",
    "displayName": "string",
    "role": "PLAYER" | "ADMIN"
  }
}

## GET /api/me
Auth required.

Response 200:
{
  "user": {
    "id": "uuid",
    "email": "user@ufl.edu",
    "displayName": "string",
    "role": "PLAYER" | "ADMIN"
  }
}

---

# Quests (Admin)

## POST /api/quests
Auth required (ADMIN). Creates a quest with questions + explanations.

Request:
{
  "title": "string",
  "description": "string",
  "topic": "string",
  "questions": [
    {
      "prompt": "string",
      "choices": ["string", "string", "string", "string"],
      "correctIndex": 0,
      "explanation": "string"
    }
  ]
}

Response 201:
{
  "quest": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "topic": "string",
    "ownerId": "uuid",
    "createdAt": "2026-03-03T00:00:00.000Z"
  }
}

## GET /api/quests
Auth required.
- ADMIN sees quests they own
- PLAYER sees only "published" quests (future enhancement)

Response 200:
{
  "quests": [
    {
      "id": "uuid",
      "title": "string",
      "topic": "string"
    }
  ]
}

## GET /api/quests/:questId
Auth required.

Response 200:
{
  "quest": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "topic": "string",
    "questions": [
      {
        "id": "uuid",
        "prompt": "string",
        "choices": ["string","string","string","string"]
      }
    ]
  }
}

## PUT /api/quests/:questId
Auth required (ADMIN + owner only). Updates quest content.

Request: same shape as POST /api/quests (partial allowed later)

Response 200:
{ "quest": { "id": "uuid" } }

---

# Runs (Player)

## POST /api/runs
Auth required (PLAYER). Starts a run from a quest.

Request:
{
  "questId": "uuid"
}

Response 201:
{
  "run": {
    "id": "uuid",
    "questId": "uuid",
    "status": "IN_PROGRESS",
    "currentQuestionIndex": 0,
    "score": 0,
    "money": 0,
    "abilityCharges": { "fiftyFifty": 1 },
    "createdAt": "2026-03-03T00:00:00.000Z"
  }
}

## GET /api/runs/:runId
Auth required (owner only).

Response 200:
{
  "run": {
    "id": "uuid",
    "questId": "uuid",
    "status": "IN_PROGRESS" | "COMPLETED",
    "currentQuestionIndex": 0,
    "score": 0,
    "money": 0,
    "abilityCharges": { "fiftyFifty": 1 }
  }
}

## POST /api/runs/:runId/answer
Auth required (owner only). Submits an answer.

Request:
{
  "questionId": "uuid",
  "selectedIndex": 2
}

Response 200:
{
  "result": {
    "isCorrect": true,
    "correctIndex": 1,
    "explanation": "string",
    "moneyDelta": 100,
    "newMoney": 300,
    "nextQuestionIndex": 1,
    "runStatus": "IN_PROGRESS" | "COMPLETED"
  }
}

Notes:
- If incorrect: moneyDelta is negative or 0; explanation must be returned

## POST /api/runs/:runId/ability/5050
Auth required (owner only). Uses 50/50 on the current question.

Request:
{
  "questionId": "uuid"
}

Response 200:
{
  "fiftyFifty": {
    "removedIndices": [1, 3],
    "remainingIndices": [0, 2],
    "chargesLeft": 0
  }
}

---

# Run Summary

## GET /api/runs/:runId/summary
Auth required (owner only). Available only after COMPLETED.

Response 200:
{
  "summary": {
    "runId": "uuid",
    "questId": "uuid",
    "totalQuestions": 10,
    "correctCount": 7,
    "accuracy": 0.7,
    "finalMoney": 800,
    "completedAt": "2026-03-03T00:00:00.000Z"
  }
}
