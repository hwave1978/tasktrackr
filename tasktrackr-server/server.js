const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const db = require("./db");

const app = express();
const PORT = 3001;

app.use(
  cors({
    origin: "http://13.220.217.58:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

/* ---------------------------
   AUTH MIDDLEWARE
---------------------------- */
function authMiddleware(req, res, next) {
  if (req.cookies.tasktrackr_session !== "logged-in") {
    return res.status(401).json({ error: "Not logged in" });
  }

  next();
}

/* ---------------------------
   LOGIN
---------------------------- */
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = `
    SELECT id, email, role
    FROM users
    WHERE email = ? AND hashed_password = ?
  `;

  db.query(sql, [email, password], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Login failed" });
    }

    if (result.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result[0];

    res.cookie("tasktrackr_session", "logged-in", {
      httpOnly: true,
      sameSite: "lax",
    });

    res.json({
      message: "Logged in",
      user,
    });
  });
});

/* ---------------------------
   REGISTER
---------------------------- */
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  const sql = `
    INSERT INTO users (email, hashed_password, role)
    VALUES (?, ?, 'user')
  `;

  db.query(sql, [email, password], (err) => {
    if (err) {
      return res.status(500).json({ error: "Register failed" });
    }

    res.json({ message: "Registered" });
  });
});

/* ---------------------------
   LOGOUT
---------------------------- */
app.post("/logout", (req, res) => {
  res.clearCookie("tasktrackr_session");
  res.json({ message: "Logged out" });
});

/* ---------------------------
   TASK ROUTES
---------------------------- */
app.get("/tasks", authMiddleware, (req, res) => {
  db.query("SELECT * FROM tasks", (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to load tasks" });

    res.json(results);
  });
});

app.post("/tasks", authMiddleware, (req, res) => {
  const { title, description } = req.body;

  db.query(
    "INSERT INTO tasks (title, description) VALUES (?, ?)",
    [title, description],
    (err) => {
      if (err) return res.status(500).json({ error: "Failed to add task" });

      res.json({ message: "Task added" });
    }
  );
});

app.put("/tasks/:id", authMiddleware, (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  db.query(
    "UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?",
    [title, description, completed, id],
    (err) => {
      if (err) return res.status(500).json({ error: "Failed to update task" });

      res.json({ message: "Task updated" });
    }
  );
});

app.delete("/tasks/:id", authMiddleware, (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM tasks WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to delete task" });

    res.json({ message: "Task deleted" });
  });
});

/* ---------------------------
   START SERVER
---------------------------- */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});