# Hospital Monorepo (Backend + Frontend)

This folder contains two separate Node.js apps (non-MVC):

- `backend/` – Express API server
- `frontend/` – Vite + React client

## Quick start

Open two terminals:

1) Backend
```
cd backend
copy .env.example .env
npm install
npm run dev
```

2) Frontend
```
cd frontend
npm install
npm run dev
```

Frontend dev server: http://localhost:5173
Backend API server: http://localhost:5000

Set `frontend/.env` with `VITE_API_URL` to point to the backend if needed.