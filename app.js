const express = require("express");
const mysql = require("mysql");
const app = express();

const jwt = require("jwt-simple");
// const bcrypt = require("bcrypt"); // Add this line
const bodyParser = require("body-parser");
// const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

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

// Signup API

app.post("/signup", (req, res) => {
  const { name, email, password, contact_no } = req.body;

  const INSERT_USER_QUERY =
    "INSERT INTO users (name, email, password, contact_no) VALUES (?, ?, ?, ?)";
  connection.query(
    INSERT_USER_QUERY,
    [name, email, password, contact_no],
    (err, results) => {
      if (err) {
        console.error("Error inserting user: " + err.stack);
        res.status(500).json({ message: "Error inserting user" });
        return;
      }
      console.log("Inserted a new user with ID: " + results.insertId);
      res.status(201).json({ message: "User signed up successfully" });
    }
  );
});

// Sign-in / Authentication API -- HAshing
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Check if user exists
//     const SELECT_USER_QUERY = "SELECT * FROM users WHERE email = ?";
//     connection.query(SELECT_USER_QUERY, [email], async (err, results) => {
//       if (err) {
//         console.error("Error retrieving user:", err);
//         return res.status(500).json({ message: "Internal server error" });
//       }

//       if (results.length === 0) {
//         return res.status(401).json({ message: "Invalid email or password" });
//       }

//       // Retrieve user record
//       const user = results[0];

//       // Compare plain-text password with hashed password
//       if (password === user.password) {
//         // Passwords match, generate JWT token
//         const secretKey = crypto.randomBytes(32).toString("hex");
//         const token = jwt.sign({ userId: user.id }, secretKey, {
//           expiresIn: "1h",
//         });
//         return res.status(200).json({ message: "Login successful", token });
//       } else {
//         // Passwords don't match
//         return res.status(401).json({ message: "Invalid email or password" });
//       }
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// Cuurent Login api
// app.post("/login", (req, res) => {
//   const { email, password } = req.body;

//   console.log("Attempting to sign in with email:", email);

//   // Retrieve user from the database based on the email
//   const SELECT_USER_QUERY = "SELECT * FROM users WHERE email = ?";
//   connection.query(SELECT_USER_QUERY, [email], (err, results) => {
//     if (err) {
//       console.error("Error retrieving user:", err);
//       return res.status(500).json({ message: "Internal server error" });
//     }

//     console.log("Fetched user data from the database:", results);

//     if (results.length === 0) {
//       console.log("User not found with email:", email);
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     const user = results[0];

//     // Compare the plain-text password with the password retrieved from the database
//     if (password === user.password) {
//       // Passwords match, authentication successful
//       res.status(200).json({ message: "Login successful" });
//     } else {
//       // Passwords don't match
//       res.status(401).json({ message: "Invalid email or password" });
//     }
//   });
// });

// Login with data response
// app.post("/login", (req, res) => {
//   const { email, password } = req.body;

//   // Retrieve user from the database based on the email
//   const SELECT_USER_QUERY = "SELECT * FROM users WHERE email = ?";
//   connection.query(SELECT_USER_QUERY, [email], (err, results) => {
//     if (err) {
//       console.error("Error retrieving user:", err);
//       return res.status(500).json({ message: "Internal server error" });
//     }

//     if (results.length === 0) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     const user = results[0];

//     // Compare the plain-text password with the password retrieved from the database
//     if (password === user.password) {
//       // Passwords match, generate JWT token
//       const token = jwt.sign({ userId: user.id }, "your_secret_key", {
//         expiresIn: "1h",
//       });

//       res.status(200).json({ message: "Login successful", token });
//     } else {
//       // Passwords don't match
//       res.status(401).json({ message: "Invalid email or password" });
//     }
//   });
// });

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Retrieve user from the database based on the email
  const SELECT_USER_QUERY = "SELECT * FROM users WHERE email = ?";
  connection.query(SELECT_USER_QUERY, [email], (err, results) => {
    if (err) {
      console.error("Error retrieving user:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];

    // Compare the plain-text password with the password retrieved from the database
    if (password === user.password) {
      // Passwords match, generate JWT token
      const token = jwt.encode({ userId: user.id }, "your_secret_key", "HS256");

      res.status(200).json({ message: "Login successful", token });
    } else {
      // Passwords don't match
      res.status(401).json({ message: "Invalid email or password" });
    }
  });
});

// Middleware function to verify token
function verifyToken(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.decode(token, "your_secret_key");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Protected route to get session details
app.get("/session", verifyToken, (req, res) => {
  // You can use req.user.userId to fetch user details from the database
  const userId = req.user.userId;

  // Fetch user details from the database using userId
  const SELECT_USER_QUERY = "SELECT * FROM users WHERE id = ?";
  connection.query(SELECT_USER_QUERY, [userId], (err, results) => {
    if (err) {
      console.error("Error retrieving user details:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];
    // Respond with user details
    res.json(user);
  });
});
