const express = require("express");
const mysql = require("mysql");
const app = express();

// MySQL Connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "rishi@y23",
  database: "my_database",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL: " + err.stack);
    return;
  }
  console.log("Connected to MySQL as id " + connection.threadId);
});

// Middleware
app.use(express.json());

// CORS Middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Routes
app.post("/persons", (req, res) => {
  const { name, details } = req.body;
  const INSERT_PERSON_QUERY =
    "INSERT INTO persons (name, details) VALUES (?, ?)";
  connection.query(INSERT_PERSON_QUERY, [name, details], (err, results) => {
    if (err) {
      console.error("Error inserting person: " + err.stack);
      res.status(500).send("Error inserting person");
      return;
    }
    console.log("Inserted a new person with ID: " + results.insertId);
    res.status(201).send("Person added successfully");
  });
});

// Routes
app.post("/record", (req, res) => {
  const { events } = req.body;
  const sessionData = JSON.stringify(events);

  const INSERT_SESSION_QUERY = "INSERT INTO sessions (session_data) VALUES (?)";
  connection.query(INSERT_SESSION_QUERY, [sessionData], (err, results) => {
    if (err) {
      console.error("Error inserting session: " + err.stack);
      res.status(500).send("Error inserting session");
      return;
    }
    console.log("Inserted a new session with ID: " + results.insertId);
    res.status(201).send("Session recorded successfully");
  });
});

// Handle OPTIONS requests for the /record endpoint
app.options("/record", (req, res) => {
  res.sendStatus(200);
});

app.get("/replay/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  const SELECT_SESSION_QUERY = "SELECT session_data FROM sessions WHERE id = ?";
  connection.query(SELECT_SESSION_QUERY, [sessionId], (err, results) => {
    if (err) {
      console.error("Error retrieving session: " + err.stack);
      res.status(500).send("Error retrieving session");
      return;
    }

    if (results.length === 0) {
      res.status(404).send("Session not found");
      return;
    }
    const sessionData = JSON.parse(results[0].session_data);
    res.json(sessionData);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
