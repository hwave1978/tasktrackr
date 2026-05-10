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
  }),
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
  const userId = req.cookies.tasktrackr_session;

  const sql = "SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC";

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Could not get tasks" });
    }

    res.json(results);
  });
});
app.get("/tasks/:id", authMiddleware, (req, res) => {
  const userId = req.cookies.tasktrackr_session;

  const sql = "SELECT * FROM tasks WHERE id = ? AND user_id = ?";

  db.query(sql, [req.params.id, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Could not get task" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(results[0]);
  });
});

/* ---------------------------
   ADD TASK
---------------------------- */
app.post("/tasks", authMiddleware, (req, res) => {
  const userId = req.cookies.tasktrackr_session;
  const { title, description, category, due_date, completed } = req.body;

  const sql = `
    INSERT INTO tasks (user_id, title, description, category, due_date, completed)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      userId,
      title,
      description,
      category,
      due_date || null,
      completed || false,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Could not add task" });
      }

      res.json({
        id: result.insertId,
        user_id: userId,
        title,
        description,
        category,
        due_date,
        completed,
      });
    },
  );
});

/* ---------------------------
   UPDATE TASK
---------------------------- */
app.put("/tasks/:id", authMiddleware, (req, res) => {
  const userId = req.cookies.tasktrackr_session;

  const { title, description, category, due_date, completed } = req.body;

  const sql = `
    UPDATE tasks
    SET title = ?, description = ?, category = ?, due_date = ?, completed = ?
    WHERE id = ? AND user_id = ?
  `;

  db.query(
    sql,
    [
      title,
      description,
      category,
      due_date || null,
      completed,
      req.params.id,
      userId,
    ],
    (err) => {
      if (err) {
        return res.status(500).json({ error: "Could not update task" });
      }

      res.json({ success: true });
    },
  );
});

/* ---------------------------
   DELETE TASK
---------------------------- */
app.delete("/tasks/:id", authMiddleware, (req, res) => {
  const userId = req.cookies.tasktrackr_session;

  const sql = `
    DELETE FROM tasks
    WHERE id = ? AND user_id = ?
  `;

  db.query(sql, [req.params.id, userId], (err) => {
    if (err) {
      return res.status(500).json({ error: "Could not delete task" });
    }

    res.json({ success: true });
  });
});

/* ---------------------------
   START SERVER
---------------------------- */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
