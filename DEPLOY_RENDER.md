# Deploy melaX on Render

This project is easiest to host on Render as:

- `melax-frontend`: static Vite site
- `melax-api`: Node/Express API
- `melax-db`: PostgreSQL database

## 1. Push the project to GitHub

Render deploys from a Git repository. This folder is not currently a Git repo, so create one first:

```bash
cd "/Users/bibekneupane/Downloads/Project melaX"
git init
git add .
git commit -m "Prepare melaX for deployment"
```

Then create a GitHub repo and push it.

## 2. Create the Render blueprint

1. In Render, choose `New +` -> `Blueprint`.
2. Connect the GitHub repo.
3. Render will detect [render.yaml](/Users/bibekneupane/Downloads/Project%20melaX/render.yaml).
4. Create the services.

## 3. Set required environment variables

After Render creates the services, add these values in the dashboard.

### Backend: `melax-api`

Required:

- `CORS_ORIGIN=https://YOUR_FRONTEND_DOMAIN`
- `FRONTEND_URL=https://YOUR_FRONTEND_DOMAIN`

Optional, depending on features:

- `GOOGLE_CLIENT_ID=...`
- `EMAIL_HOST=...`
- `EMAIL_PORT=...`
- `EMAIL_USER=...`
- `EMAIL_PASS=...`
- `EMAIL_FROM=...`

### Frontend: `melax-frontend`

Required:

- `VITE_API_BASE_URL=https://YOUR_BACKEND_DOMAIN/api`

Optional:

- `VITE_GOOGLE_CLIENT_ID=...`

## 4. Redeploy after env vars are added

Once the variables are saved, trigger a redeploy for both services.

## 5. Verify production

Check these first:

- Backend health: `https://YOUR_BACKEND_DOMAIN/health`
- Frontend loads and can fetch events
- Signup/login works
- Email links point to the production frontend domain

## Notes

- The frontend production build succeeds locally.
- The backend syntax checks pass locally.
- Google auth will not work until both backend and frontend Google client IDs are configured.
- Payments are still running in mock mode because `ENABLE_MOCK_PAYMENTS=true`.
