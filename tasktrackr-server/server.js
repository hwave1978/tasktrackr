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
  if (!req.cookies.tasktrackr_session) {
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

    res.cookie("tasktrackr_session", user.id, {
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
   GET TASKS
---------------------------- */
app.get("/tasks", authMiddleware, (req, res) => {
  const sql = `
    SELECT id, title, description, category, due_date, completed
    FROM tasks
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Failed to load tasks" });
    }

    res.json(results);
  });
});

/* ---------------------------
   ADD TASK
---------------------------- */
app.post("/tasks", authMiddleware, (req, res) => {
  const {
    title,
    description,
    category = "General",
    due_date = null,
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Task title is required" });
  }

  const sql = `
    INSERT INTO tasks (title, description, category, due_date, completed)
    VALUES (?, ?, ?, ?, false)
  `;

  db.query(
    sql,
    [title, description || "", category || "General", due_date || null],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Failed to add task" });
      }

      res.json({
        message: "Task added",
        taskId: result.insertId,
      });
    }
  );
});

/* ---------------------------
   UPDATE TASK
---------------------------- */
app.put("/tasks/:id", authMiddleware, (req, res) => {
  const { id } = req.params;

  const {
    title,
    description,
    category = "General",
    due_date = null,
    completed = false,
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Task title is required" });
  }

  const sql = `
    UPDATE tasks
    SET title = ?, description = ?, category = ?, due_date = ?, completed = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      title,
      description || "",
      category || "General",
      due_date || null,
      completed ? 1 : 0,
      id,
    ],
    (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to update task" });
      }

      res.json({ message: "Task updated" });
    }
  );
});

/* ---------------------------
   DELETE TASK
---------------------------- */
app.delete("/tasks/:id", authMiddleware, (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM tasks
    WHERE id = ?
  `;

  db.query(sql, [id], (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to delete task" });
    }

    res.json({ message: "Task deleted" });
  });
});

/* ---------------------------
   START SERVER
---------------------------- */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});