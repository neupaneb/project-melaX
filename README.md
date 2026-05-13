# Project melaX

This project is now structured with separate frontend and backend apps:

- `frontend/` - Vite + React client
- `backend/` - Express + PostgreSQL API

Workspace folder: `Project melaX`

## Run the frontend

```bash
cd "Project melaX"
cd frontend
npm install
npm run dev
```

## Run the backend

```bash
cd "Project melaX"
cd backend
npm install
npm run dev
```

## Optional root shortcuts

From the repository root:

```bash
npm run dev:frontend
npm run dev:backend
```

## Deploy

The simplest hosting setup for this project is:

- Render static site for `frontend/`
- Render web service for `backend/`
- Render PostgreSQL database

Deployment files:

- [render.yaml](/Users/bibekneupane/Downloads/Project%20melaX/render.yaml)
- [DEPLOY_RENDER.md](/Users/bibekneupane/Downloads/Project%20melaX/DEPLOY_RENDER.md)
