import "./App.css";
import { useState } from "react";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Tasks");
  const [selectedFilter, setSelectedFilter] = useState("All Tasks");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedCompleted, setSelectedCompleted] = useState(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");

  function cleanDate(dateValue) {
    if (!dateValue) return null;
    return dateValue.slice(0, 10);
  }

  function login() {
    fetch("http://localhost:3001/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setLoggedIn(true);
        fetchTasks();
      })
      .catch((err) => console.log(err));
  }

  function register() {
    fetch("http://localhost:3001/register", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setLoggedIn(true);
        fetchTasks();
      })
      .catch((err) => console.log(err));
  }

  function logout() {
    fetch("http://localhost:3001/logout", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.json())
      .then(() => {
        setLoggedIn(false);
        setTasks([]);
        clearForm();
      })
      .catch((err) => console.log(err));
  }

  function fetchTasks() {
    fetch("http://localhost:3001/tasks", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.log(err));
  }

  function clearForm() {
    setSelectedTaskId(null);
    setSelectedCompleted(0);
    setTitle("");
    setDescription("");
    setDueDate("");
    setCategory("");
  }

  function saveTask() {
    const taskData = {
      title,
      description,
      due_date: dueDate || null,
      category,
      completed: selectedCompleted,
    };

    const url = selectedTaskId
      ? `http://localhost:3001/tasks/${selectedTaskId}`
      : "http://localhost:3001/tasks";

    const method = selectedTaskId ? "PUT" : "POST";

    fetch(url, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    })
      .then((res) => res.json())
      .then(() => {
        fetchTasks();
        clearForm();
      })
      .catch((err) => console.log(err));
  }

  function editTask(task) {
    setSelectedTaskId(task.id);
    setSelectedCompleted(task.completed ? 1 : 0);
    setTitle(task.title || "");
    setDescription(task.description || "");
    setDueDate(cleanDate(task.due_date) || "");
    setCategory(task.category || "");
  }

  function deleteTask(id) {
    fetch(`http://localhost:3001/tasks/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => res.json())
      .then(() => {
        fetchTasks();
        clearForm();
      })
      .catch((err) => console.log(err));
  }

  function toggleComplete(task) {
    fetch(`http://localhost:3001/tasks/${task.id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: task.title || "",
        description: task.description || "",
        due_date: cleanDate(task.due_date),
        category: task.category || "",
        completed: task.completed ? 0 : 1,
      }),
    })
      .then((res) => res.json())
      .then(() => fetchTasks())
      .catch((err) => console.log(err));
  }

  function isDueSoon(task) {
    if (!task.due_date) return false;

    const today = new Date();
    const due = new Date(task.due_date);
    const sevenDaysFromNow = new Date();

    sevenDaysFromNow.setDate(today.getDate() + 7);

    return due >= today && due <= sevenDaysFromNow;
  }

  let visibleTasks = tasks;

  if (selectedCategory !== "All Tasks") {
    visibleTasks = visibleTasks.filter(
      (task) =>
        task.category &&
        task.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }

  if (selectedFilter === "Due Soon") {
    visibleTasks = visibleTasks.filter((task) => isDueSoon(task));
  }

  if (selectedFilter === "Completed") {
    visibleTasks = visibleTasks.filter((task) => task.completed === 1);
  }

  if (!loggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>TaskTrackr</h1>
          <p>Simple task management without the clutter.</p>

          <input
            type="email"
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
      <header className="top-bar">
        <div className="logo">TaskTrackr</div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <h2>Categories</h2>

          <button
            className={
              selectedCategory === "All Tasks" ? "category active" : "category"
            }
            onClick={() => setSelectedCategory("All Tasks")}
          >
            All Tasks
          </button>

          <button
            className={
              selectedCategory === "School" ? "category active" : "category"
            }
            onClick={() => setSelectedCategory("School")}
          >
            School
          </button>

          <button
            className={
              selectedCategory === "Work" ? "category active" : "category"
            }
            onClick={() => setSelectedCategory("Work")}
          >
            Work
          </button>

          <button
            className={
              selectedCategory === "Personal" ? "category active" : "category"
            }
            onClick={() => setSelectedCategory("Personal")}
          >
            Personal
          </button>
        </aside>

        <section className="dashboard">
          <div className="hero-card">
            <h1>Your tasks, organized.</h1>

            <p>
              Create a task, save it to MySQL, and display it back on this page.
            </p>

            <div className="filter-row">
              <button
                className={
                  selectedFilter === "All Tasks" ? "filter active" : "filter"
                }
                onClick={() => setSelectedFilter("All Tasks")}
              >
                All Tasks
              </button>

              <button
                className={
                  selectedFilter === "Due Soon" ? "filter active" : "filter"
                }
                onClick={() => setSelectedFilter("Due Soon")}
              >
                Due Soon
              </button>

              <button
                className={
                  selectedFilter === "Completed" ? "filter active" : "filter"
                }
                onClick={() => setSelectedFilter("Completed")}
              >
                Completed
              </button>
            </div>
          </div>

          {visibleTasks.map((task) => (
            <div className="task-card" key={task.id}>
              <div>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <span>Category: {task.category}</span>
                <p>Status: {task.completed ? "Completed" : "Incomplete"}</p>
              </div>

              <div className="task-buttons">
                <button onClick={() => editTask(task)}>Edit</button>

                <button onClick={() => toggleComplete(task)}>
                  {task.completed ? "Undo" : "Complete"}
                </button>

                <button
                  className="delete-btn"
                  onClick={() => deleteTask(task.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </section>

        <aside className="editor">
          <h2>Task Editor</h2>

          <label>Title</label>
          <input
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label>Description</label>
          <textarea
            placeholder="Task details"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>

          <label>Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <label>Category</label>
          <input
            placeholder="School, Work, Personal"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <div className="editor-buttons">
            <button className="save-btn" onClick={saveTask}>
              {selectedTaskId ? "Save Edit" : "New Task"}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;