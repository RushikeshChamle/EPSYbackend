const express = require("express");

const app = express();
const cors = require("cors");

const bodyParser = require("body-parser");

const crypto = require("crypto");
const bcrypt = require("bcrypt");
app.use(cors());

app.use(bodyParser.json()); // Middleware to parse JSON bodies
const { Pool } = require('pg');


// // MySQL pool
// const pool = mysql.createpool({
//   host: "localhost",
//   user: "root",
//   password: "rishi@y23",
//   database: "my_database",
// });

// pool.connect((err) => {
//   if (err) {
//     console.error("Error connecting to MySQL: " + err.stack);
//     return;
//   }
//   console.log("Connected to MySQL as id " + pool.threadId);
// });



// PostgreSQL pool
const pool = new Pool({
  host: 'localhost',
  user: 'mynewuser',
  password: 'newpassword',
  database: 'mydatabase',
  port: 5432, // Default port for PostgreSQL
});


pool.connect((err) => {
  if (err) {
    console.error('Error connecting to PostgreSQL: ' + err.stack);
    return;
  }
  console.log('Connected to PostgreSQL');
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
  // const INSERT_PERSON_QUERY =
  //   "INSERT INTO persons (name, details) VALUES (?, ?)";
  // pool.query(INSERT_PERSON_QUERY, [name, details], (err, results) => {
  //   if (err) {
  //     console.error("Error inserting person: " + err.stack);
  //     res.status(500).send("Error inserting person");
  //     return;
  //   }
  //   console.log("Inserted a new person with ID: " + results.insertId);
  //   res.status(201).send("Person added successfully");
  // });


  // postgres query
  const INSERT_PERSON_QUERY = "INSERT INTO persons (name, details) VALUES ($1, $2) RETURNING id";
pool.query(INSERT_PERSON_QUERY, [name, details], (err, results) => {
  if (err) {
    console.error("Error inserting person: " + err.stack);
    res.status(500).send("Error inserting person");
    return;
  }
  console.log("Inserted a new person with ID: " + results.rows[0].id);
  res.status(201).send("Person added successfully");
});


});

// Routes
app.post("/record", (req, res) => {
  const { project_id, events } = req.body; // Extract project_id from request body
  const sessionData = JSON.stringify(events);

  // const INSERT_SESSION_QUERY =
  //   "INSERT INTO sessions (project_id, session_data) VALUES (?, ?)";
  // pool.query(
  //   INSERT_SESSION_QUERY,
  //   [project_id, sessionData],
  //   (err, results) => {
  //     if (err) {
  //       console.error("Error inserting session: " + err.stack);
  //       res.status(500).send("Error inserting session");
  //       return;
  //     }
  //     console.log("Inserted a new session with ID: " + results.insertId);
  //     res.status(201).send("Session recorded successfully");
  //   }
  // );

  const INSERT_SESSION_QUERY = "INSERT INTO sessions (project_id, session_data) VALUES ($1, $2) RETURNING id";
pool.query(INSERT_SESSION_QUERY, [project_id, sessionData], (err, results) => {
  if (err) {
    console.error("Error inserting session: " + err.stack);
    res.status(500).send("Error inserting session");
    return;
  }
  console.log("Inserted a new session with ID: " + results.rows[0].id);
  res.status(201).send("Session recorded successfully");
});



});

// Handle OPTIONS requests for the /record endpoint
app.options("/record", (req, res) => {
  res.sendStatus(200);
});


// previosuly it was like this
// app.get("/replay/:sessionId", (req, res) => {
//   const { sessionId } = req.params;

  // const SELECT_SESSION_QUERY =
  //   "SELECT id, session_data, project_id  FROM sessions WHERE id = ?";
  // pool.query(SELECT_SESSION_QUERY, [sessionId], (err, results) => {
  //   if (err) {
  //     console.error("Error retrieving session: " + err.stack);
  //     res.status(500).send("Error retrieving session");
  //     return;
  //   }

  //   if (results.length === 0) {
  //     res.status(404).send("Session not found");
  //     return;
  //   }
  //   const sessionData = JSON.parse(results[0].session_data);
  //   res.json(sessionData);
  // });


//   const SELECT_SESSION_QUERY = "SELECT id, session_data, project_id FROM sessions WHERE id = $1";
// pool.query(SELECT_SESSION_QUERY, [sessionId], (err, results) => {
//   if (err) {
//     console.error("Error retrieving session: " + err.stack);
//     res.status(500).send("Error retrieving session");
//     return;
//   }

//   if (results.rows.length === 0) {
//     res.status(404).send("Session not found");
//     return;
//   }
//   const sessionData = JSON.parse(results.rows[0].session_data);
//   res.json(sessionData);
// });


// });


// what will be the formart of the API response

// app.get("/replay/:sessionId", (req, res) => {
//   const { sessionId } = req.params;

//   const SELECT_SESSION_QUERY = "SELECT id, session_data, project_id FROM sessions WHERE id = $1";

//   pool.query(SELECT_SESSION_QUERY, [sessionId], (err, results) => {
//     if (err) {
//       console.error("Error retrieving session: " + err.stack);
//       res.status(500).send("Error retrieving session");
//       return;
//     }


//     if (results.rows.length === 0) {
//       res.status(404).send("Session not found");
//       return;
//     }

//     const sessionData = results.rows[0].session_data;

//     try {
//       const parsedData = JSON.parse(sessionData);
//       console.log(parsedData); // Log the parsed data
//       res.json(parsedData);
//     } catch (error) {
//       console.error("Invalid session data --: " + sessionData);
//       res.status(500).send("Invalid session data");
//     }
//   });
// });




// nndhhdhd

// app.get("/replay/:sessionId", (req, res) => {
//   const { sessionId } = req.params;

//   const SELECT_SESSION_QUERY = "SELECT id, session_data, project_id FROM sessions WHERE id = $1";

//   pool.query(SELECT_SESSION_QUERY, [sessionId], (err, results) => {
//     if (err) {
//       console.error("Error retrieving session: " + err.stack);
//       res.status(500).send("Error retrieving session");
//       return;
//     }

//     if (results.rows.length === 0) {
//       res.status(404).send("Session not found");
//       return;
//     }

//     const sessionData = results.rows[0].session_data;

//     try {
//       const parsedData = JSON.parse(sessionData);
      
//       // Convert the session data to rrweb format
//       const rrwebEvents = parsedData.map(event => {
//         return {
//           type: event.type,
//           data: event.data,
//           timestamp: event.timestamp
//         };
//       });

//       res.json(rrwebEvents);
//     } catch (error) {
//       console.error("Invalid session data --: " + sessionData);
//       res.status(500).send("Invalid session data");
//     }
//   });
// });



app.get("/replay/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  const SELECT_SESSION_QUERY = "SELECT id, session_data, project_id FROM sessions WHERE id = $1";

  pool.query(SELECT_SESSION_QUERY, [sessionId], (err, results) => {
    if (err) {
      console.error("Error retrieving session: " + err.stack);
      res.status(500).json({ error: "Error retrieving session" });
      return;
    }

    if (results.rows.length === 0) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    const sessionData = results.rows[0];

    try {
      const responseData = [{
        id: sessionData.id,
        session_data: (sessionData.session_data),
        project_id: sessionData.project_id
      }];
      
      res.json(responseData);
    } catch (error) {
      console.error("Invalid session data --: " + sessionData.session_data);
      res.status(500).json({ error: "Invalid session data" });
    }
  });
});




// Updated Fech Session with all fields

app.get("/project/:projectId", (req, res) => {
  const { projectId } = req.params;

  const SELECT_SESSION_QUERY =
    "SELECT id as session_id,  project_id , created_date FROM sessions WHERE project_id = $1";
  pool.query(SELECT_SESSION_QUERY, [projectId], (err, results) => {
    if (err) {
      console.error("Error retrieving session: " + err.stack);
      res.status(500).send("Error retrieving session");
      return;
    }

    if (results.length === 0) {
      res.status(404).send("Session not found");
      return;
    }

    const project = results.rows.map((result) => ({
      session_id: result.session_id,
      project_id: result.project_id,
      created_date: result.created_date,
    }));

    res.json(project);
  });
});


const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Signup API

// app.post("/signup", (req, res) => {
//   const { name, email, password, contact_no } = req.body;

//   const INSERT_USER_QUERY =
//     "INSERT INTO users (name, email, password, contact_no) VALUES (?, ?, ?, ?)";
//   pool.query(
//     INSERT_USER_QUERY,
//     [name, email, password, contact_no],
//     (err, results) => {
//       if (err) {
//         console.error("Error inserting user: " + err.stack);
//         res.status(500).json({ message: "Error inserting user" });
//         return;
//       }
//       console.log("Inserted a new user with ID: " + results.insertId);
//       res.status(201).json({ message: "User signed up successfully" });
//     }
//   );
// });

// newlogic for the signup by which the user + Organisation + Project (name as OrgNAme) will be added

// Signup API
app.post("/signup", (req, res) => {
  const { name, email, password, contact_no, org_name, size } = req.body;

  
  // First, insert the organization into the database
  const INSERT_ORG_QUERY =
    "INSERT INTO Organisation (name, size, createdAt) VALUES ($1, $2, NOW()) RETURNING id"; // Adjusted to use "Name" and "size" columns
  pool.query(INSERT_ORG_QUERY, [org_name, size], (err, orgResult) => {
    if (err) {
      console.error("Error creating organization: " + err.stack);
      res.status(500).json({ message: "Error creating organization" });
      return;
    }
    console.log("Inserted a new organization with ID: " + orgResult.rows[0].id);

    // Then, use the inserted organization's ID to create the project
    const INSERT_PROJECT_QUERY =
      "INSERT INTO Project (orgId, name, createdAt) VALUES ($1, $2, NOW())";
    pool.query(
      INSERT_PROJECT_QUERY,
      [orgResult.rows[0].id, org_name], // Use the organization ID as the foreign key and org_name as the project name
      (err, projectResult) => {
        if (err) {
          console.error("Error creating project: " + err.stack);
          res.status(500).json({ message: "Error creating project" });
          return;
        }
        console.log(
          "Inserted a new project with ID: " + projectResult.insertId
        );

        // Finally, use the inserted organization's ID to create the user
        const INSERT_USER_QUERY =
          "INSERT INTO users (name, email, password, contact_no, orgId) VALUES ($1, $2, $3, $4, $5)";
        pool.query(
          INSERT_USER_QUERY,
          [name, email, password, contact_no, orgResult.rows[0].id],
          (err, userResult) => {
            if (err) {
              console.error("Error inserting user: " + err.stack);
              res.status(500).json({ message: "Error inserting user" });
              return;
            }
            console.log("Inserted a new user with ID: " + userResult.insertId);
            res.status(201).json({
              message:
                "User signed up successfully, organization and project created",
            });
          }
        );
      }
    );
  });
});



//Login API

const jwt = require("jsonwebtoken");
// app.post("/login", (req, res) => {
//   const { email, password } = req.body;

//   // Retrieve user from the database based on the email
//   const SELECT_USER_QUERY = "SELECT * FROM users WHERE email = ?";
//   pool.query(SELECT_USER_QUERY, [email], (err, results) => {
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

//       // Include user data in the response
//       const userWithoutPassword = { ...user, password: undefined }; // Remove password from the user object
//       res.status(200).json({
//         message: "Login successful",
//         token,
//         user: userWithoutPassword,
//       });
//     } else {
//       // Passwords don't match
//       res.status(401).json({ message: "Invalid email or password" });
//     }
//   });
// });

// Middleware function to verify token
// function verifyToken(req, res, next) {
//   const token = req.headers["authorization"];

//   if (!token) {
//     console.log("Token not provided");
//     res.setHeader("Content-Type", "application/json"); // Add this line
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   try {
//     const decoded = jwt.decode(token, "your_secret_key");
//     console.log("Token decoded successfully:", decoded);

//     req.user = decoded;
//     next();
//   } catch (error) {
//     console.error("Error decoding token:", error);
//     res.setHeader("Content-Type", "application/json"); // Add this line
//     return res.status(401).json({ message: "Invalid token" });
//   }
// }

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const SELECT_USER_QUERY = 'SELECT * FROM users WHERE email = $1';
  pool.query(SELECT_USER_QUERY, [email], (err, results) => {
    if (err) {
      console.error('Error retrieving user:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results.rows[0];

    if (password === user.password) {
      const token = jwt.sign({ userId: user.id }, 'your_secret_key', {
        expiresIn: '1h',
      });

      const userWithoutPassword = { ...user, password: undefined };
      res.status(200).json({
        message: 'Login successful',
        token,
        user: userWithoutPassword,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  });
});

// Middleware function to verify token
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    console.log('Token not provided');
    res.setHeader('Content-Type', 'application/json');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, 'your_secret_key');
    console.log('Token decoded successfully:', decoded);

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error decoding token:', error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(401).json({ message: 'Invalid token' });
  }
}




// Protected route to get session details
app.get("/session", verifyToken, (req, res) => {
  // You can use req.user.userId to fetch user details from the database
  const userId = req.user.userId;

  // Fetch user details from the database using userId
  const SELECT_USER_QUERY = "SELECT * FROM users WHERE id = $1";
  pool.query(SELECT_USER_QUERY, [userId], (err, results) => {
    if (err) {
      console.error("Error retrieving user details:", err);
      res.setHeader("Content-Type", "application/json"); // Add this line
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.rows.length === 0) {
      console.log("User not found with ID:", userId);
      res.setHeader("Content-Type", "application/json"); // Add this line
      return res.status(404).json({ message: "User not found" });
    }

    const user = results.rows[0];

    console.log("Session user details:", user); // Log session response
    // Respond with user details
    res.setHeader("Content-Type", "application/json"); // Add this line
    res.json(user);
  });
});


// Assuming you have already set up your Express app and database pool...

// Route for creating an organization mysql
// app.post("/organisations", (req, res) => {
//   const { name } = req.body;

//   // Insert organization into the database
//   const INSERT_ORG_QUERY =
//     "INSERT INTO Organisation (name, createdAt) VALUES ($1, NOW())";
//   pool.query(INSERT_ORG_QUERY, [name], (err, results) => {
//     if (err) {
//       console.error("Error creating organization:", err);
//       return res.status(500).json({ message: "Internal server error" });
//     }

//     const orgId = results.insertId;
//     res
//       .status(201)
//       .json({ message: "Organization created successfully", orgId });
//   });
// });



// Route for creating an organization
app.post("/organisations", (req, res) => {
  const { name } = req.body;

  // Insert organization into the database
  const INSERT_ORG_QUERY =
    "INSERT INTO Organisation (name, createdAt) VALUES ($1, NOW()) RETURNING id";
  pool.query(INSERT_ORG_QUERY, [name], (err, results) => {
    if (err) {
      console.error("Error creating organization:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    const orgId = results.rows[0].id;
    res.status(201).json({
      message: "Organization created successfully",
      orgId,
    });
  });
});






// Route for creating a project
app.post("/projects", (req, res) => {
  const { orgId, name, ProjectKey } = req.body;

  // Insert project into the database
  const INSERT_PROJECT_QUERY =
    "INSERT INTO Project (orgId, Name, ProjectKey, createdAt) VALUES ($1, $2, $3, NOW())";
  pool.query(
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
  const SELECT_USER_QUERY = "SELECT * FROM users WHERE id = $1";
  pool.query(SELECT_USER_QUERY, [userId], (err, results) => {
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
  const SELECT_PROJECTS_QUERY = "SELECT * FROM Project WHERE orgId = $1";

  pool.query(SELECT_PROJECTS_QUERY, [orgId], (err, results) => {
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

//   pool.query(SELECT_PROJECTS_QUERY, [orgId], (err, results) => {
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

//   pool.query(SELECT_SESSIONDATA_QUERY, [userId], (err, results) => {
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

// ssss
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
    Inner JOIN Organisation o ON u.orgId = o.Id
    Inner JOIN Project p ON o.Id = p.orgId
    WHERE u.id = $1`;

    pool.query(SELECT_SESSIONDATA_QUERY, [userId], (err, results) => {
      if (err) {
        console.error("Error retrieving session data:", err);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
    
      if (results.rows.length === 0) {  // Accessing the `rows` property here
        res.status(404).json({ message: "Session data not found" });
        return;
      }
    
      // Initialize arrays to store user, organization, and project data
      const users = [];
      const organizations = [];
      const projects = [];
    
      // Extract user, organization, and project data from the results.rows
      results.rows.forEach((row) => {  // Using results.rows here
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





  
// Adding events
app.post("/events", (req, res) => {
  const eventData = req.body;

  // Insert event data into the database
  const query =
    "INSERT INTO events (project_id, event_name, event_properties) VALUES (?, ?, ?)";
  const values = [
    eventData.project_id,
    eventData.event_name,
    JSON.stringify(eventData.event_properties),
  ];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error("Error inserting event data into database:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    console.log("Event data inserted into database:", result);
    res
      .status(200)
      .json({ message: "Event data received and stored successfully" });
  });
});

// fetching events

app.get("/getevents", (req, res) => {
  const projectId = req.query.projectId;

  // Check if projectId is provided
  if (!projectId) {
    return res.status(400).json({ error: "Project ID is required" });
  }

  // Retrieve events from the database based on project ID
  const query = "SELECT * FROM events WHERE project_id = $1";

  pool.query(query, [projectId], (err, results) => {
    if (err) {
      console.error("Error retrieving events from database:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    console.log("Events retrieved from database:", results);
    res.status(200).json(results);
  });
});

// Session data fetching API

// app.get("/sessiondata", verifyToken, (req, res) => {
//   const userId = req.user.userId; // Extract userId from the decoded JWT token

//   // Query to fetch user, organization, and project details based on userId
//   const SELECT_SESSIONDATA_QUERY = `
//     SELECT 
//       u.id AS UserId, 
//       u.name AS UserName, 
//       u.email AS UserEmail,
//       u.contact_no AS UserContactNo,
//       u.created_at AS UserCreatedAt,
//       o.Id AS OrgId, 
//       o.Name AS OrgName, 
//       o.Email AS OrgEmail,
//       o.CreatedAt AS OrgCreatedAt,
//       p.Id AS ProjectId, 
//       p.Name AS ProjectName, 
//       p.ProjectKey AS ProjectKey,
//       p.CreatedAt AS ProjectCreatedAt
//     FROM users u
//     RIGHT JOIN Organisation o ON u.orgId = o.Id
//     RIGHT JOIN Project p ON o.Id = p.orgId
//     WHERE u.id = $1`;

//   pool.query(SELECT_SESSIONDATA_QUERY, [userId], (err, results) => {
//     if (err) {
//       console.error("Error retrieving session data:", err);
//       res.status(500).json({ message: "Internal server error" });
//       return;
//     }

//     if (results.length === 0) {
//       res.status(404).json({ message: "Session data not found" });
//       return;
//     }

//     // Initialize arrays to store user, organization, and project data
//     const users = [];
//     const organizations = [];
//     const projects = [];

//     // Extract user, organization, and project data from the results
//     results.forEach((row) => {
//       const user = {
//         UserId: row.UserId,
//         UserName: row.UserName,
//         UserEmail: row.UserEmail,
//         UserContactNo: row.UserContactNo,
//         UserCreatedAt: row.UserCreatedAt,
//       };
//       users.push(user);

//       const organization = {
//         OrgId: row.OrgId,
//         OrgName: row.OrgName,
//         OrgEmail: row.OrgEmail,
//         OrgCreatedAt: row.OrgCreatedAt,
//       };
//       organizations.push(organization);

//       const project = {
//         ProjectId: row.ProjectId,
//         ProjectName: row.ProjectName,
//         ProjectKey: row.ProjectKey,
//         ProjectCreatedAt: row.ProjectCreatedAt,
//       };
//       projects.push(project);
//     });

//     // Construct the response object
//     const responseData = {
//       users: users,
//       organizations: organizations,
//       projects: projects,
//     };

//     // Send the response
//     res.status(200).json(responseData);
//   });
// });

app.get("/sessiondata", verifyToken, (req, res) => {
  const userId = req.user.userId; // Extract userId from the decoded JWT token

  // Query to fetch user, organization, and project details based on userId
  const SELECT_SESSIONDATA_QUERY = `
  SELECT
  u.id AS UserId,
  u.name AS UserName,
  u.email AS UserName,
  u.contact_no AS UserContactNo,
  u.created_at AS UserCreatedAt,
  o.id AS OrgId,
  o.name AS OrgName,
  o.email AS OrgEmail,
  o.CreatedAt AS OrgCreatedAt,
  p.id AS ProjectId,
  p.name AS ProjectName,
  p.ProjectKey AS ProjectKey,
  p.CreatedAt AS ProjectCreatedAt
FROM users u
RIGHT JOIN organisation o ON u.orgid = o.id
RIGHT JOIN project p ON o.id = p.orgid
WHERE u.id = $1`;

  pool.query(SELECT_SESSIONDATA_QUERY, [userId], (err, results) => {
    if (err) {
      console.error("Error retrieving session data:", err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    // Check if results.rows is empty
    if (results.rows.length === 0) {
      res.status(404).json({ message: "Session data not found" });
      return;
    }

    // Initialize arrays to store user, organization, and project data
    const users = [];
    const organizations = [];
    const projects = [];

    // Extract user, organization, and project data from results.rows
    results.rows.forEach((row) => {
      const user = {
        UserId: row.userid,
        UserName: row.username,
        UserEmail: row.useremail,
        UserContactNo: row.usercontactno,
        UserCreatedAt: row.usercreatedat,
      };
      users.push(user);

      const organization = {
        OrgId: row.orgid,
        OrgName: row.orgname,
        OrgEmail: row.orgemail,
        OrgCreatedAt: row.orgcreatedat,
      };
      organizations.push(organization);

      const project = {
        ProjectId: row.projectid,
        ProjectName: row.projectname,
        ProjectKey: row.projectkey,
        ProjectCreatedAt: row.projectcreatedat,
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
