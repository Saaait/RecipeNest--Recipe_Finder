# RecipeNest – Full-Stack Recipe Finder 🍲

**RecipeNest** is a MERN-style web application that enables users to explore, save, and manage recipes. It features a Node.js/Express backend with MongoDB and a React+Vite frontend. The system also integrates with external APIs (TheMealDB) and includes a lightweight recommendation engine.

This README covers everything needed to understand, install, run, and extend the project.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Installation & Setup](#installation--setup)
4. [Environment Variables](#environment-variables)
5. [Running the Application](#running-the-application)
6. [Project Structure](#project-structure)
7. [API Endpoints](#api-endpoints)
8. [Core Features](#core-features)
9. [Algorithms & Implementation](#algorithms--implementation)
10. [Frontend Details](#frontend-details)
11. [Testing](#testing)
12. [Packages & Dependencies](#packages--dependencies)
13. [Contribution & Development Notes](#contribution--development-notes)

---

## Project Overview
RecipeNest allows users to:
- Register and authenticate (with role-based access).
- Search recipes (built-in or external via TheMealDB).
- Submit, edit, delete, and save recipes.
- View personalized recommendations based on saved recipes.
- Admins can approve or reject submissions and manage users.

The backend exposes a RESTful API; the frontend is a single-page React app.

## Technology Stack
- **Backend:** Node.js, Express, Mongoose (MongoDB)
- **Frontend:** React, Vite, Axios, Tailwind CSS
- **Authentication:** JWT (jsonwebtoken), bcrypt
- **Search:** Fuse.js (fuzzy search)
- **External API:** TheMealDB for recipe data
- **Hosting/DB:** MongoDB Atlas by default
- **OS Support:** Linux/macOS & Windows via shell/batch scripts

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (installed and running)
- npm or yarn

### Quick Setup

**Step 1: Run setup (first time only)**
```bash
# Linux/Mac
./setup.sh

# Windows
Setup.bat
```
This will:
- ✅ Check Node.js and npm
- ✅ Create environment files (.env)
- ✅ Install all dependencies

⚠️ **Important:** After running setup, you MUST open `backend-v2/.env` and replace `your_mongodb_connection_string_here` with your actual MongoDB Atlas connection string.

**Step 2: Start the application**
```bash
# Linux/Mac
./start-dev.sh

# Windows
start-dev.bat
```
This will:
- ✅ Auto-check and start MongoDB
- ✅ Start backend (port 5001)
- ✅ Start frontend (port 5173)

## Environment Variables
Fill the `.env` files located in root of `frontend` and `backend-v2`.

### backend-v2/.env
```env
PORT=5001
CONNECTION_STRING=<your mongo connection string>
ACCESS_TOKEN_SECERT=<jwt secret>            # typo kept for legacy compatibility
REFRESH_TOKEN_SECRET=<jwt refresh secret>
MEALDB_BASE=https://www.themealdb.com/api/json/v1/1
```

### frontend/.env
```env
VITE_API_BASE_URL=http://localhost:5001
```

## Running the Application

### Quick Start (Recommended)

**Linux/Mac:**
```bash
./start-dev.sh
```

**Windows:**
```batch
start-dev.bat
```

These scripts will:
- ✅ Auto-check and start MongoDB
- ✅ Create environment files if missing
- ✅ Install dependencies if needed
- ✅ Start backend (port 5001) and frontend (port 5173)

### Access URLs
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5001

### Stopping Servers
Press `Ctrl+C` in the terminal to stop both servers.

## Project Structure
```
RecipeNest/
├── backend-v2/        # Express API server
│   ├── controllers/   # business logic
│   ├── models/        # mongoose schemas
│   ├── routes/        # API routes
│   ├── middleware/    # auth, error handling
│   ├── utils/         # helper functions (search, personalization)
│   ├── scripts/       # one-off utilities (seed, fixes)
│   └── server.js      # entrypoint
├── frontend/          # React app (Vite)
│   ├── src/
│   │   ├── api/       # axios instance
│   │   ├── components/ # reusable UI
│   │   ├── context/   # React context/provider
│   │   ├── pages/     # route components
│   │   └── services/  # client-side helpers
│   └── index.html
├── documentation/     # system docs (incl. this README)
├── Postman Files/     # API collections
└── *.sh / *.bat        # helper scripts for setup/start/stop
```

## API Endpoints
Refer to the [documentation section](#api-endpoints) above or the Postman collection. Endpoints include:
- `/api/users` – auth, registration, profile
- `/api/recipes` – CRUD and search
- `/api/recommend` – personalized suggestions
- `/api/recipes/external` – TheMealDB integration

## Core Features
- Authentication with JWT & password hashing
- Recipe management with image uploads (multer)
- Role-based access (user vs admin)
- Mobile-responsive frontend
- Hybrid recommendation algorithm (tags + ingredients)
- External recipe fetch from TheMealDB

## Algorithms & Implementation
### Recommendation Engine
A hybrid rule-based & content-based strategy: collects the user’s five most recent saved recipes, extracts tags/ingredients, scores all approved recipes by overlapping content, sorts by score and popularity, and returns top results. This lightweight algorithm lives in `recommendationController.js`.

### Search
Fuse.js provides fuzzy, in-memory search on the recipe dataset. The logic is encapsulated in `utils/searchUtility.js` and used by `recipeController.js`.

## Frontend Details
- Built with React functional components and hooks.
- State and authentication managed via `UserContext`.
- Axios instance (`api/axiosInstance.js`) attaches JWT automatically.
- Responsive UI built using Tailwind CSS classes and custom styles.

## Testing
- Manual API tests via Postman (collection included).
- Temporary in-memory test scripts (deleted after use) demonstrated algorithm behavior.
- No automated test suite; focus was on manual/visual verification.

## Packages & Dependencies
### Backend
- express, mongoose, bcryptjs, jsonwebtoken, express-async-handler, multer, dotenv, axios, cors, fuse.js (for search)

### Frontend
- react, react-dom, react-router-dom, axios, fuse.js, tailwindcss (if used), vite

Refer to `package.json` files in each subproject for exact version lists.

## Contribution & Development Notes
- All debug `console.log` statements have been removed from production code.
- Scripts in the root simplify setup; feel free to adapt them to containerized workflows.
- Future work could include unit testing, ML-based recommendations, or external search engines.

---

Thank you for exploring RecipeNest! Feel free to fork, extend, or deploy this project. Happy cooking! 🍽️

## 🛠️ Troubleshooting

### MongoDB Connection Error (ECONNREFUSED)
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod

# Test connection
nc -zv localhost 27017
```

### Port Already in Use
```bash
# Kill process on port 5001 (backend)
sudo lsof -ti:5001 | xargs kill -9

# Kill process on port 5173 (frontend)
sudo lsof -ti:5173 | xargs kill -9
```

### Windows MongoDB Issues
1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start service: `net start MongoDB`
3. Or use MongoDB Compass to connect to `mongodb://localhost:27017`
