const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = 3001;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

function authMiddleware(req, res, next) {
  const cookie = req.headers.cookie || "";

  if (!cookie.includes("tasktrackr_session=logged-in")) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }

  req.userId = 1;
  next();
}

app.get("/", (req, res) => {
  res.send("TaskTrackr backend is running");
});

app.get("/test-db", (req, res) => {
  db.query("SELECT 1 + 1 AS result", (err, results) => {
    if (err) {
      res.status(500).json({ error: "Database test failed" });
      return;
    }

    res.json(results[0]);
  });
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  const sql = `
    INSERT INTO users (id, email, hashed_password)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      email = VALUES(email),
      hashed_password = VALUES(hashed_password)
  `;

  db.query(sql, [1, email, password], (err) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: "Registration failed" });
      return;
    }

    res.setHeader(
      "Set-Cookie",
      "tasktrackr_session=logged-in; Path=/; HttpOnly; SameSite=Lax"
    );

    res.json({ message: "Registered and logged in" });
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = `
    INSERT INTO users (id, email, hashed_password)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      email = VALUES(email),
      hashed_password = VALUES(hashed_password)
  `;

  db.query(sql, [1, email, password], (err) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: "Login failed" });
      return;
    }

    res.setHeader(
      "Set-Cookie",
      "tasktrackr_session=logged-in; Path=/; HttpOnly; SameSite=Lax"
    );

    res.json({ message: "Logged in" });
  });
});

app.post("/logout", (req, res) => {
  res.setHeader(
    "Set-Cookie",
    "tasktrackr_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
  );

  res.json({ message: "Logged out" });
});

app.get("/tasks", authMiddleware, (req, res) => {
  const sql = "SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC";

  db.query(sql, [req.userId], (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: "Failed to fetch tasks" });
      return;
    }

    res.json(results);
  });
});

app.get("/tasks/:id", authMiddleware, (req, res) => {
  const sql = "SELECT * FROM tasks WHERE id = ? AND user_id = ?";

  db.query(sql, [req.params.id, req.userId], (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: "Failed to fetch task" });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.json(results[0]);
  });
});

app.post("/tasks", authMiddleware, (req, res) => {
  const { title, description, due_date, category, completed } = req.body;

  const sql = `
    INSERT INTO tasks
    (user_id, title, description, due_date, category, completed)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      req.userId,
      title,
      description,
      due_date || null,
      category,
      completed || 0,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to create task" });
        return;
      }

      res.json({ message: "Task created", id: result.insertId });
    }
  );
});

app.put("/tasks/:id", authMiddleware, (req, res) => {
  const { title, description, due_date, category, completed } = req.body;

  const sql = `
    UPDATE tasks
    SET title = ?, description = ?, due_date = ?, category = ?, completed = ?
    WHERE id = ? AND user_id = ?
  `;

  db.query(
    sql,
    [
      title,
      description,
      due_date || null,
      category,
      completed || 0,
      req.params.id,
      req.userId,
    ],
    (err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to update task" });
        return;
      }

      res.json({ message: "Task updated" });
    }
  );
});

app.delete("/tasks/:id", authMiddleware, (req, res) => {
  const sql = "DELETE FROM tasks WHERE id = ? AND user_id = ?";

  db.query(sql, [req.params.id, req.userId], (err) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: "Failed to delete task" });
      return;
    }

    res.json({ message: "Task deleted" });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});