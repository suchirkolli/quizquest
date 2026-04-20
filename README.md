# Quiz Quest

Quiz Quest is a gamified quiz website where teachers create quests and students play timed quiz runs with health, powerups, and stats tracking.

## Project Stack
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Authentication: JWT
- Local database: Docker Desktop

## Main Features
- Teacher and student registration and login
- Teacher quest create, edit, and delete
- Student dashboard with available quests
- Timed quest runs with health
- Powerups: Shield, 50/50, Freeze
- Final quest summary
- Student stats page

## Prerequisites
Install these first:
- Node.js 20.19+ or 22.12+
- npm
- Docker Desktop

## Easy Setup

### 1. Start PostgreSQL in Docker
If the container does not already exist, run:

```bash
docker run --name quizquest-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=quizquest -p 5432:5432 -d postgres
```

If the container already exists, run:

```bash
docker start quizquest-postgres
```

### 2. Create `backend/.env`
Inside the `backend` folder, create a file named `.env`.

You can copy the values from `backend/.env.example`.

Example:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/quizquest"
JWT_SECRET="quizquest_local_secret"
```

### 3. Start the backend
Open a terminal in `backend` and run:

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run dev
```

The backend runs on:

```text
http://localhost:3000
```

### 4. Start the frontend
Open another terminal in `frontend` and run:

```bash
npm ci
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Demo Accounts
On a fresh database, use the built-in registration pages to create these accounts.

### Teacher Example
- Username: `gandalf`
- Password: `wizard101`

### Student Example
- Username: `frodo`
- Password: `hobbit`

## Suggested Grading Flow
1. Register the teacher account
2. Log in as teacher
3. Create at least one quest
4. Register the student account
5. Log in as student
6. Start a quest run
7. Finish the run
8. Open the stats page

## Configuration
The only local configuration values are:
- `DATABASE_URL`
- `JWT_SECRET`

## Sprint Board
Trello Link: https://trello.com/invite/b/698bc0208ac083c977531e2f/ATTIef2a9ccab623eef254daee45097bf103016FB0E4/quizquest-sprint-board

## Important Notes
- Keep the backend on port `3000`
- Keep the frontend on port `5173`
- Use `backend/.env.example` as the template