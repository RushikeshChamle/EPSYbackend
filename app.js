const express = require("express");
const mysql = require("mysql");
const app = express();
const cors = require("cors");

const bodyParser = require("body-parser");

const crypto = require("crypto");
const bcrypt = require("bcrypt");
app.use(cors());
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
// Apply CORS middleware

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
  const { project_id, events } = req.body; // Extract project_id from request body
  const sessionData = JSON.stringify(events);

  const INSERT_SESSION_QUERY =
    "INSERT INTO sessions (project_id, session_data) VALUES (?, ?)";
  connection.query(
    INSERT_SESSION_QUERY,
    [project_id, sessionData],
    (err, results) => {
      if (err) {
        console.error("Error inserting session: " + err.stack);
        res.status(500).send("Error inserting session");
        return;
      }
      console.log("Inserted a new session with ID: " + results.insertId);
      res.status(201).send("Session recorded successfully");
    }
  );
});

// Handle OPTIONS requests for the /record endpoint
app.options("/record", (req, res) => {
  res.sendStatus(200);
});

app.get("/replay/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  const SELECT_SESSION_QUERY =
    "SELECT id, session_data, project_id  FROM sessions WHERE id = ?";
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

// Updated Fech Session with all fields

app.get("/project/:projectId", (req, res) => {
  const { projectId } = req.params;

  const SELECT_SESSION_QUERY =
    "SELECT id as session_id,  project_id , created_date FROM sessions WHERE project_id = ?";
  connection.query(SELECT_SESSION_QUERY, [projectId], (err, results) => {
    if (err) {
      console.error("Error retrieving session: " + err.stack);
      res.status(500).send("Error retrieving session");
      return;
    }

    if (results.length === 0) {
      res.status(404).send("Session not found");
      return;
    }

    const project = results.map((result) => ({
      session_id: result.session_id,
      project_id: result.project_id,
      created_date: result.created_date,
    }));

    res.json(project);
  });
});

const PORT = process.env.PORT || 8000;
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

//Login API

const jwt = require("jsonwebtoken");
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
      const token = jwt.sign({ userId: user.id }, "your_secret_key", {
        expiresIn: "1h",
      });

      // Include user data in the response
      const userWithoutPassword = { ...user, password: undefined }; // Remove password from the user object
      res.status(200).json({
        message: "Login successful",
        token,
        user: userWithoutPassword,
      });
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
    console.log("Token not provided");
    res.setHeader("Content-Type", "application/json"); // Add this line
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.decode(token, "your_secret_key");
    console.log("Token decoded successfully:", decoded);

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error decoding token:", error);
    res.setHeader("Content-Type", "application/json"); // Add this line
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
      res.setHeader("Content-Type", "application/json"); // Add this line
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      console.log("User not found with ID:", userId);
      res.setHeader("Content-Type", "application/json"); // Add this line
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];

    console.log("Session user details:", user); // Log session response
    // Respond with user details
    res.setHeader("Content-Type", "application/json"); // Add this line
    res.json(user);
  });
});

// Assuming you have already set up your Express app and database connection...

// Route for creating an organization
app.post("/organisations", (req, res) => {
  const { name } = req.body;

  // Insert organization into the database
  const INSERT_ORG_QUERY =
    "INSERT INTO Organisation (name, createdAt) VALUES (?, NOW())";
  connection.query(INSERT_ORG_QUERY, [name], (err, results) => {
    if (err) {
      console.error("Error creating organization:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    const orgId = results.insertId;
    res
      .status(201)
      .json({ message: "Organization created successfully", orgId });
  });
});

// Route for creating a project
app.post("/projects", (req, res) => {
  const { orgId, name, ProjectKey } = req.body;

  // Insert project into the database
  const INSERT_PROJECT_QUERY =
    "INSERT INTO Project (orgId, Name, ProjectKey, createdAt) VALUES (?, ?, ?, NOW())";
  connection.query(
    INSERT_PROJECT_QUERY,
    [orgId, name, ProjectKey],
    (err, results) => {
      if (err) {
        console.error("Error creating project:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      const projectId = results.insertId;
      res
        .status(201)
        .json({ message: "Project created successfully", projectId });
    }
  );
});

app.get("/users/:userId", (req, res) => {
  const userId = req.params.userId;

  // Query to fetch user data from the database
  const SELECT_USER_QUERY = "SELECT * FROM users WHERE id = ?";
  connection.query(SELECT_USER_QUERY, [userId], (err, results) => {
    if (err) {
      console.error("Error retrieving user:", err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const user = results[0];
    res.status(200).json(user);
  });
});

app.get("/projects/:orgId", (req, res) => {
  const orgId = req.params.orgId;
  const SELECT_PROJECTS_QUERY = "SELECT * FROM Project WHERE orgId = ?";

  connection.query(SELECT_PROJECTS_QUERY, [orgId], (err, results) => {
    if (err) {
      console.error("Error fetching projects:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    res.json(results);
  });
});

// app.get("/projects/:orgId", (req, res) => {
//   const orgId = req.params.orgId;
//   const SELECT_PROJECTS_QUERY = "SELECT * FROM Project WHERE orgId = ?";

//   connection.query(SELECT_PROJECTS_QUERY, [orgId], (err, results) => {
//     if (err) {
//       console.error("Error fetching projects:", err);
//       return res.status(500).json({ error: "Internal server error" });
//     }

//     // Construct project objects
//     const projects = results.map((project) => ({
//       Id: project.id,
//       ProjectKey: project.projectKey,
//       orgId: project.orgId,
//       Name: project.name,
//       CreatedAt: project.createdDate,
//     }));

//     res.json(projects);
//   });
// });

// Session data
// app.get("/sessiondata/:userId", (req, res) => {
//   const { userId } = req.params;

//   // Query to fetch user, organization, and project details based on userId
// const SELECT_SESSIONDATA_QUERY = `
//   SELECT *
//   FROM users
//   RIGHT JOIN my_database.Organisation ON users.orgId = Organisation.Id
//   RIGHT JOIN my_database.Project ON Organisation.Id = Project.orgId
//   WHERE users.id = ?`;

//   connection.query(SELECT_SESSIONDATA_QUERY, [userId], (err, results) => {
//     if (err) {
//       console.error("Error retrieving session data:", err);
//       res.status(500).json({ message: "Internal server error" });
//       return;
//     }

//     if (results.length === 0) {
//       res.status(404).json({ message: "Session data not found" });
//       return;
//     }

//     // Send the entire results array as the response
//     res.status(200).json(results);
//   });
// });

app.get("/sessiondata/:userId", (req, res) => {
  const { userId } = req.params;

  res.set("name", "sessiondata");

  // Query to fetch user, organization, and project details based on userId
  const SELECT_SESSIONDATA_QUERY = `
    SELECT 
      u.id AS UserId, 
      u.name AS UserName, 
      u.email AS UserEmail,
      u.contact_no AS UserContactNo,
      u.created_at AS UserCreatedAt,
      o.Id AS OrgId, 
      o.Name AS OrgName, 
      o.Email AS OrgEmail,
      o.CreatedAt AS OrgCreatedAt,
      p.Id AS ProjectId, 
      p.Name AS ProjectName, 
      p.ProjectKey AS ProjectKey,
      p.CreatedAt AS ProjectCreatedAt
    FROM users u
    RIGHT JOIN Organisation o ON u.orgId = o.Id
    RIGHT JOIN Project p ON o.Id = p.orgId
    WHERE u.id = ?`;

  connection.query(SELECT_SESSIONDATA_QUERY, [userId], (err, results) => {
    if (err) {
      console.error("Error retrieving session data:", err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ message: "Session data not found" });
      return;
    }

    // Initialize arrays to store user, organization, and project data
    const users = [];
    const organizations = [];
    const projects = [];

    // Extract user, organization, and project data from the results
    results.forEach((row) => {
      const user = {
        UserId: row.UserId,
        UserName: row.UserName,
        UserEmail: row.UserEmail,
        UserContactNo: row.UserContactNo,
        UserCreatedAt: row.UserCreatedAt,
      };
      users.push(user);

      const organization = {
        OrgId: row.OrgId,
        OrgName: row.OrgName,
        OrgEmail: row.OrgEmail,
        OrgCreatedAt: row.OrgCreatedAt,
      };
      organizations.push(organization);

      const project = {
        ProjectId: row.ProjectId,
        ProjectName: row.ProjectName,
        ProjectKey: row.ProjectKey,
        ProjectCreatedAt: row.ProjectCreatedAt,
      };
      projects.push(project);
    });

    // Construct the response object
    const responseData = {
      users: users,
      organizations: organizations,
      projects: projects,
    };

    // Send the response
    res.status(200).json(responseData);
  });
});

app.get("/sessiondata", verifyToken, (req, res) => {
  const userId = req.user.userId; // Extract userId from the decoded JWT token

  // Query to fetch user, organization, and project details based on userId
  const SELECT_SESSIONDATA_QUERY = `
    SELECT 
      u.id AS UserId, 
      u.name AS UserName, 
      u.email AS UserEmail,
      u.contact_no AS UserContactNo,
      u.created_at AS UserCreatedAt,
      o.Id AS OrgId, 
      o.Name AS OrgName, 
      o.Email AS OrgEmail,
      o.CreatedAt AS OrgCreatedAt,
      p.Id AS ProjectId, 
      p.Name AS ProjectName, 
      p.ProjectKey AS ProjectKey,
      p.CreatedAt AS ProjectCreatedAt
    FROM users u
    RIGHT JOIN Organisation o ON u.orgId = o.Id
    RIGHT JOIN Project p ON o.Id = p.orgId
    WHERE u.id = ?`;

  connection.query(SELECT_SESSIONDATA_QUERY, [userId], (err, results) => {
    if (err) {
      console.error("Error retrieving session data:", err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ message: "Session data not found" });
      return;
    }

    // Initialize arrays to store user, organization, and project data
    const users = [];
    const organizations = [];
    const projects = [];

    // Extract user, organization, and project data from the results
    results.forEach((row) => {
      const user = {
        UserId: row.UserId,
        UserName: row.UserName,
        UserEmail: row.UserEmail,
        UserContactNo: row.UserContactNo,
        UserCreatedAt: row.UserCreatedAt,
      };
      users.push(user);

      const organization = {
        OrgId: row.OrgId,
        OrgName: row.OrgName,
        OrgEmail: row.OrgEmail,
        OrgCreatedAt: row.OrgCreatedAt,
      };
      organizations.push(organization);

      const project = {
        ProjectId: row.ProjectId,
        ProjectName: row.ProjectName,
        ProjectKey: row.ProjectKey,
        ProjectCreatedAt: row.ProjectCreatedAt,
      };
      projects.push(project);
    });

    // Construct the response object
    const responseData = {
      users: users,
      organizations: organizations,
      projects: projects,
    };

    // Send the response
    res.status(200).json(responseData);
  });
});

// Middleware function to verify token
function verifyToken(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    console.log("Token not provided");
    res.setHeader("Content-Type", "application/json"); // Add this line
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, "your_secret_key"); // Verify the JWT token
    console.log("Token decoded successfully:", decoded);

    req.user = decoded; // Set the decoded user information in the request object
    next();
  } catch (error) {
    console.error("Error decoding token:", error);
    res.setHeader("Content-Type", "application/json"); // Add this line
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = app;
