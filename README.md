# 🚀 Team Task Manager

A full-stack web application to manage tasks in a team environment.
Built with **React, Node.js, Express, MongoDB (MERN stack)**.

---

## 📌 Features

### 🔐 Authentication

* Signup & Login using JWT
* Secure user sessions

### 👥 Role-Based Access

* **Admin**

  * Create projects
  * Assign tasks
  * Manage users
* **Member**

  * View assigned tasks
  * Update task status (To Do → In Progress → Done)

### 📂 Project Management

* Create projects
* Add members to projects
* Assign tasks within projects

### 📝 Task Management

* Create tasks with:

  * Title
  * Due Date
  * Priority (Low / Medium / High)
* Assign tasks to users
* Track status

### 📊 Dashboard

* Total tasks
* Tasks by status
* Tasks per user
* Overdue tasks visualization

---

## 🖥️ Dashboard Preview

![Dashboard](./dashboard.png)

---

## ⚙️ Tech Stack

* **Frontend:** React.js
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **Authentication:** JWT

---

## 🚀 Installation

### 1. Clone repo

```bash
git clone https://github.com/anudita003/task-manager.git
cd task-manager
```

---

### 2. Install dependencies

#### Client

```bash
cd client
npm install
npm start
```

#### Server

```bash
cd server
npm install
npm run dev
```

---

## 🌐 Environment Variables

Create `.env` inside server:

```env
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret_key
PORT=5000
```

---

## 🎯 Future Improvements

* Drag & drop tasks (like Trello)
* Notifications
* Comments on tasks
* File attachments

---

## 📌 Author

**Anudita**
GitHub: https://github.com/anudita003
