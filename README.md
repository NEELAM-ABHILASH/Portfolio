# Portfolio

Personal portfolio site built with **React 19 + TypeScript + Vite**, with a small **Node.js / Express + MongoDB** backend (in [`server/`](server/)) that handles the contact form.

| Part     | Stack                         | Local URL               | Deployed on |
| -------- | ----------------------------- | ----------------------- | ----------- |
| Frontend | React, TypeScript, Vite       | http://localhost:9141   | Netlify     |
| Backend  | Node.js, Express, Mongoose    | http://localhost:3001   | Render      |

## Prerequisites

- **Node.js** 20 or newer (check with `node -v`)
- **npm** 10 or newer (check with `npm -v`)
- A **MongoDB** connection string (e.g. a free MongoDB Atlas cluster) for the backend

## 1. Install dependencies

The frontend and backend have separate `package.json` files, so install both:

```bash
# Frontend (project root)
npm install

# Backend
cd server
npm install
cd ..
```

## 2. Configure the backend

Copy the example env file and fill in your values:

```bash
cp server/.env.example server/.env
```

| Variable        | Description                                             | Local value               |
| --------------- | ------------------------------------------------------- | ------------------------- |
| `MONGODB_URI`   | MongoDB connection string                               | your Atlas URI            |
| `PORT`          | Port the API listens on (the Vite proxy expects `3001`) | `3001`                    |
| `CLIENT_ORIGIN` | Allowed CORS origin                                     | `http://localhost:9141`   |
| `DB_PASSWORD`   | Password for the admin view (`/api/admin/view`)         | any password you choose   |

> Never commit `server/.env`.

## 3. Run locally

Run the backend and frontend in **two separate terminals**.

**Terminal 1 — Node backend**

```bash
cd server
npm run dev     # starts with nodemon (auto-restarts on file changes)
# or
npm start       # plain: node index.js
```

The API runs on http://localhost:3001.

**Terminal 2 — Vite frontend**

```bash
npm run dev
```

Open http://localhost:9141. During development, Vite proxies every `/api/*` request to `http://localhost:3001` (see [`vite.config.ts`](vite.config.ts)), so the contact form talks to your local backend.

## Available scripts

### Frontend (project root)

| Command           | What it does                                              |
| ----------------- | --------------------------------------------------------- |
| `npm run dev`     | Start the Vite dev server with hot reload on port 9141    |
| `npm run build`   | Type-check (`tsc -b`) and build for production to `dist/` |
| `npm run preview` | Serve the production build from `dist/` locally           |
| `npm run lint`    | Run ESLint over the project                               |

### Backend (`server/`)

| Command       | What it does                                  |
| ------------- | --------------------------------------------- |
| `npm run dev` | Start the API with nodemon (auto-restart)     |
| `npm start`   | Start the API with `node index.js`            |

## Production build

```bash
npm run build     # outputs to dist/
npm run preview   # check the build locally before deploying
```

## Deployment

- **Frontend: Netlify.** [`netlify.toml`](netlify.toml) runs `npm run build`, publishes `dist/`, and forwards `/api/*` to the Render backend.
- **Backend: Render.** [`render.yaml`](render.yaml) deploys the `server/` folder with `npm install` and `npm start`. Set `MONGODB_URI`, `CLIENT_ORIGIN` (your Netlify URL) and `DB_PASSWORD` in the Render dashboard.
