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
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Could not add task");
        }

        setTitle("");
        setDescription("");
        fetchTasks();
      })
      .catch((err) => {
        alert(err.message);
      });
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

          <button className="category active">All Tasks</button>
          <button className="category">Due Soon</button>
          <button className="category">Completed</button>
        </div>

        <div>
          <div className="hero-card">
            <h1>Your Tasks</h1>
            <p>Manage your work and stay productive.</p>

            <div className="filter-row">
              <button className="filter active">All</button>
              <button className="filter">Due Soon</button>
              <button className="filter">Completed</button>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="task-card">
              <div>
                <h3>No tasks yet</h3>
                <p>Add a task using the editor on the right.</p>
                <span>Waiting for task</span>
              </div>
            </div>
          ) : (
            tasks.map((task) => (
              <div className="task-card" key={task.id}>
                <div>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <span>Active Task</span>
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