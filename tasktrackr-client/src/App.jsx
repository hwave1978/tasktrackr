import "./App.css";
import { useEffect, useState } from "react";

const API_URL = "http://13.220.217.58:3001";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tasks, setTasks] = useState([]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    checkSession();
  }, []);

  function checkSession() {
    fetch(`${API_URL}/tasks`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          setLoggedIn(false);
          setTasks([]);
          return;
        }

        const data = await res.json();
        setLoggedIn(true);
        setTasks(data);
      })
      .catch(() => {
        setLoggedIn(false);
        setTasks([]);
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
        setEmail("");
        setPassword("");
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
      setEmail("");
      setPassword("");
    });
  }

  function fetchTasks() {
    fetch(`${API_URL}/tasks`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          setLoggedIn(false);
          setTasks([]);
          return;
        }

        const data = await res.json();
        setTasks(data);
      })
      .catch(() => {});
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
          <p>Log in or create an account to manage your tasks.</p>

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

          <div className="button-row">
            <button onClick={login}>Login</button>
            <button onClick={register} className="secondary-button">
              Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>TaskTrackr</h1>
          <p>Your task dashboard</p>
        </div>

        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </header>

      <main className="dashboard">
        <section className="task-form">
          <h2>Add a Task</h2>

          <input
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button onClick={addTask}>Add Task</button>
        </section>

        <section className="task-list">
          <h2>Tasks</h2>

          {tasks.length === 0 ? (
            <p>No tasks yet.</p>
          ) : (
            tasks.map((task) => (
              <div className="task-card" key={task.id}>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default App;