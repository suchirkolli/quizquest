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
- Teacher and student registration/login
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

Trello Link: https://trello.com/invite/b/698bc0208ac083c977531e2f/ATTIef2a9ccab623eef254daee45097bf103016FB0E4/quizquest-sprint-board

## Docs
- API Contract: docs/API_CONTRACT.md
