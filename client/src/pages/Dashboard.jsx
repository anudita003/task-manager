import { useEffect, useState, useCallback } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  getStats,
  getUsers,
  getProjects,
  createProject,
} from "../services/api";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

import "./Dashboard.css";

export default function Dashboard({ token }) {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [projectId, setProjectId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("");
  const [newProject, setNewProject] = useState("");

  const role = localStorage.getItem("role") || "member";

  // 🔥 FIX: useCallback added
  const fetchAll = useCallback(async () => {
    try {
      const [t, s, u, p] = await Promise.all([
        getTasks(token),
        getStats(token),
        getUsers(token),
        getProjects(token),
      ]);

      setTasks(Array.isArray(t) ? t : []);
      setStats(s || {});
      setUsers(Array.isArray(u) ? u : []);
      setProjects(Array.isArray(p) ? p : []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // 🔥 FIX: dependency added
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleAdd = async () => {
    if (!title) return alert("Title required");
    if (!assignedTo) return alert("Assign user required");

    const payload = {
      title,
      assignedTo,
      projectId: projectId || null,
      dueDate,
      priority: priority ? priority.toLowerCase() : "low",
    };

    const res = await createTask(payload, token);

    if (res?._id) {
      fetchAll();
    } else {
      alert(res?.message || "Error creating task");
    }

    setTitle("");
    setAssignedTo("");
    setProjectId("");
    setDueDate("");
    setPriority("");
  };

  const handleCreateProject = async () => {
    if (!newProject) return alert("Enter project name");

    const res = await createProject(newProject, token);

    if (res && res._id) {
      setProjects((prev) => [...prev, res]);
    }

    setNewProject("");
  };

  const changeStatus = async (id, status) => {
    await updateTask(id, status, token);
    fetchAll();
  };

  const pieData = [
    { name: "Todo", value: stats.todo || 0 },
    { name: "Done", value: stats.done || 0 },
    { name: "Overdue", value: stats.overdue || 0 },
  ];

  const COLORS = ["#0052cc", "#36b37e", "#ff5630"];

  const userData = stats?.perUser
    ? Object.entries(stats.perUser).map(([name, count]) => ({
        name,
        tasks: count,
      }))
    : [];

  if (loading) return <h2 style={{ padding: 20 }}>Loading...</h2>;

  return (
    <div className="dashboard">

      <div className="sidebar">
        <div>
          <h2>Task Manager</h2>
          <p>Role: {role}</p>
        </div>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="main">
        <h2>Dashboard</h2>

        <div className="stats">
          <div className="stat-card">Total: {stats.total || 0}</div>
          <div className="stat-card">Todo: {stats.todo || 0}</div>
          <div className="stat-card">Done: {stats.done || 0}</div>
          <div className="stat-card">Overdue: {stats.overdue || 0}</div>
        </div>

        <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
          <div className="chart-box">
            <h4>Status Distribution</h4>
            <PieChart width={280} height={280}>
              <Pie data={pieData} dataKey="value" outerRadius={100}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>

          <div className="chart-box">
            <h4>Tasks per User</h4>
            {userData.length > 0 ? (
              <BarChart width={300} height={250} data={userData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasks" fill="#0052cc" />
              </BarChart>
            ) : (
              <p>No Data</p>
            )}
          </div>
        </div>

        {role === "admin" && (
          <>
            <div className="input-box">
              <input
                placeholder="Create Project..."
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
              />
              <button onClick={handleCreateProject}>Create Project</button>
            </div>

            <div className="input-box">
              <input
                placeholder="Create task..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                <option value="">Assign User</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>

              <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>

              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="">Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <button onClick={handleAdd}>Create</button>
            </div>
          </>
        )}

        <div className="board">
          {["todo", "inprogress", "done"].map((status) => (
            <div className="column" key={status}>
              <h3>
                {status === "todo"
                  ? "To Do"
                  : status === "inprogress"
                  ? "In Progress"
                  : "Done"}
              </h3>

              {tasks
                .filter((t) => t.status === status)
                .map((t) => {
                  const isOverdue =
                    t.dueDate &&
                    new Date(t.dueDate) < new Date() &&
                    t.status !== "done";

                  return (
                    <div
                      className={`task-card ${isOverdue ? "overdue" : ""}`}
                      key={t._id}
                    >
                      <h4>{t.title}</h4>
                      <p>👤 {t.assignedTo?.name || "Unassigned"}</p>
                      <p>📁 {t.project?.name || "No Project"}</p>

                      {isOverdue && (
                        <p style={{ color: "red", fontWeight: "bold" }}>
                          ⚠️ Overdue
                        </p>
                      )}

                      {status !== "done" && (
                        <button
                          onClick={() =>
                            changeStatus(
                              t._id,
                              status === "todo" ? "inprogress" : "done"
                            )
                          }
                        >
                          Move →
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}