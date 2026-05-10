const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "tasktrackr_user",
  password: "tasktrackr123",
  database: "tasktrackr_db",
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
    return;
  }

  console.log("Connected to MySQL database");
});

module.exports = db;
