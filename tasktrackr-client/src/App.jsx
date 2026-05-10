import "./App.css";
import { useEffect, useState } from "react";

const API_URL = "http://13.220.217.58:3001";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [dueDate, setDueDate] = useState("");

  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    fetchTasks();
  }, []);

  function fetchTasks() {
    fetch(`${API_URL}/tasks`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          setLoggedIn(false);
          return;
        }

        const data = await res.json();
        setTasks(data);
        setLoggedIn(true);
      })
      .catch(() => {
        setLoggedIn(false);
      });
  }

  function login() {
    fetch(`${API_URL}/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Login failed");
        }

        setLoggedIn(true);
        setCurrentUser(data.user.email);
        fetchTasks();
      })
      .catch((err) => {
        alert(err.message);
      });
  }

  function register() {
    fetch(`${API_URL}/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Register failed");
        }

        alert("Account created. Now log in.");
      })
      .catch((err) => {
        alert(err.message);
      });
  }

  function logout() {
    fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    }).finally(() => {
      setLoggedIn(false);
      setTasks([]);
      setCurrentUser("");
      setEmail("");
      setPassword("");
    });
  }

  function addTask() {
    if (!title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    fetch(`${API_URL}/tasks`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        category,
        due_date: dueDate,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Could not add task");
        }

        setTitle("");
        setDescription("");
        setCategory("General");
        setDueDate("");
        fetchTasks();
      })
      .catch((err) => {
        alert(err.message);
      });
  }

  function filteredTasks() {
    if (activeFilter === "All") return tasks;

    if (activeFilter === "Due Soon") {
      return tasks.filter((task) => task.due_date);
    }

    if (activeFilter === "Completed") {
      return tasks.filter((task) => task.completed);
    }

    return tasks.filter((task) => task.category === activeFilter);
  }

  if (!loggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>TaskTrackr</h1>
          <p>Track your work and stay organized.</p>

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={login}>Login</button>
          <button onClick={register}>Register</button>
        </div>
      </div>
    );
  }

  const visibleTasks = filteredTasks();

  return (
    <div className="app">
      <div className="top-bar">
        <div>
          <div className="logo">TaskTrackr</div>
          <p style={{ margin: 0, color: "#65715e" }}>
            Logged in as {currentUser}
          </p>
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="layout">
        <div className="sidebar">
          <h2>Categories</h2>

          {["All", "General", "School", "Work", "Personal", "Due Soon", "Completed"].map(
            (item) => (
              <button
                key={item}
                className={activeFilter === item ? "category active" : "category"}
                onClick={() => setActiveFilter(item)}
              >
                {item === "All" ? "All Tasks" : item}
              </button>
            )
          )}
        </div>

        <div>
          <div className="hero-card">
            <h1>Your Tasks</h1>
            <p>Manage your work and stay productive.</p>

            <div className="filter-row">
              {["All", "Due Soon", "Completed"].map((item) => (
                <button
                  key={item}
                  className={activeFilter === item ? "filter active" : "filter"}
                  onClick={() => setActiveFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {visibleTasks.length === 0 ? (
            <div className="task-card">
              <div>
                <h3>No tasks yet</h3>
                <p>Add a task using the editor on the right.</p>
                <span>Waiting for task</span>
              </div>
            </div>
          ) : (
            visibleTasks.map((task) => (
              <div className="task-card" key={task.id}>
                <div>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <span>
                    {task.category || "General"}
                    {task.due_date ? ` • Due ${task.due_date}` : ""}
                  </span>
                </div>

                <button>Edit</button>
              </div>
            ))
          )}
        </div>

        <div className="editor">
          <h2>Task Editor</h2>

          <label>Task Title</label>
          <input
            placeholder="Enter task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label>Description</label>
          <textarea
            placeholder="Enter task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>General</option>
            <option>School</option>
            <option>Work</option>
            <option>Personal</option>
          </select>

          <label>Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <div className="editor-buttons">
            <button className="save-btn" onClick={addTask}>
              Save Task
            </button>

            <button className="delete-btn">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;