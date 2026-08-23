# Jira Clone App 🚀

A modern full-stack Agile Project Management and issue-tracking application built with **Next.js**, **React 19**, **Tailwind CSS**, **Node.js/Express**, and **MongoDB**.

---

## 📌 Features

- **Interactive Kanban Board**: Group issues dynamically across status columns (`To Do`, `In Progress`, `In Review`, `Done`).
- **Real-Time Status Integration**: Update issue status directly from card dropdowns with seamless backend persistence (`PUT /api/issues/:id`).
- **Issue Details Modal**: Inspect comprehensive issue metadata including priority, issue type (Task, Bug, Story, Epic), assignee details, and due dates.
- **Create Issue Flow**: Easily create new project issues with immediate placement into the Kanban board.
- **RESTful API Backend**: Scalable Express server integrated with MongoDB and Mongoose ODM.

---

## 🛠️ Tech Stack

### **Frontend (`/client`)**
- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI & Styling**: React 19, Tailwind CSS, Lucide Icons
- **Language**: TypeScript

### **Backend (`/server`)**
- **Runtime & Server**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication & Security**: JSON Web Tokens (JWT), bcryptjs, CORS

---

## 📁 Project Structure

```text
jira-clone-app/
├── client/                 # Next.js Frontend Application
│   ├── app/                # App Router pages (Kanban, Backlog, Projects, etc.)
│   ├── component/          # UI Components (KanbanCard, IssueDetailsModel, etc.)
│   ├── components/ui/      # Reusable UI primitives (Button, Input, Card, etc.)
│   └── package.json
├── server/                 # Express.js API Backend
│   ├── src/
│   │   ├── config/         # Database connection configuration
│   │   ├── controllers/    # Issue, Project, and Auth controllers
│   │   ├── models/         # Mongoose schemas (Issue, Project, User, Comment)
│   │   ├── routes/         # Express API routes
│   │   └── server.js       # Express server entry point
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### **Prerequisites**
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) running locally on `mongodb://127.0.0.1:27017` (or MongoDB Atlas URI)

---

### **1. Backend Setup (`server`)**

```bash
# Navigate to server folder
cd server

# Install dependencies
npm install

# Configure environment variables (create .env file)
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/jira_clone
JWT_SECRET=your_jwt_secret_key

# Start backend dev server
npm run dev
```
The server will start listening at `http://localhost:5000`.

---

### **2. Frontend Setup (`client`)**

```bash
# Navigate to client folder
cd client

# Install dependencies
npm install

# Start Next.js frontend dev server
npm run dev
```
The application will be accessible at `http://localhost:3000`.

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend server health check |
| `GET` | `/api/issues` | Retrieve all issues |
| `POST` | `/api/issues` | Create a new issue |
| `PUT` | `/api/issues/:id` | Update issue details (e.g. status, assignee) |
| `GET` | `/api/issues/project/:projectId` | Fetch issues belonging to a specific project |

---

## 📝 License

This project is open-source and available under the [ISC License](LICENSE).
