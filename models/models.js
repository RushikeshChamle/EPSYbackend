// // Import Sequelize and define the connection

// const Sequelize = require('sequelize');
// const sequelize = require('../database/database.js');



// // Define the Organisation model
// const Organisation = sequelize.define('Organisation', {
//   name: Sequelize.STRING,
//   CreatedAt: Sequelize.DATE,
//   Email: Sequelize.STRING,
//   size: Sequelize.INTEGER
// });

// // Define the Project model
// const Project = sequelize.define('Project', {
//   ProjectKey: Sequelize.JSON,
//   Name: Sequelize.STRING,
//   CreatedAt: Sequelize.DATE
// });

// // Define the Events model
// const Events = sequelize.define('Events', {
//   user_id: Sequelize.BIGINT,
//   event_name: Sequelize.STRING,
//   event_properties: Sequelize.JSON,
//   event_timestamp: Sequelize.DATE,
//   platform: Sequelize.STRING,
//   ip_address: Sequelize.BLOB,
//   user_agent: Sequelize.TEXT
// });

// // Define the Sessions model
// const Sessions = sequelize.define('Sessions', {
//   session_data: Sequelize.JSON,
//   created_date: Sequelize.DATE
// });

// // Define the persons model
// const Persons = sequelize.define('Persons', {
//   name: Sequelize.STRING,
//   details: Sequelize.TEXT
// });

// // Define the users model
// const Users = sequelize.define('Users', {
//   name: Sequelize.STRING,
//   email: {
//     type: Sequelize.STRING,
//     unique: true
//   },
//   password: Sequelize.STRING,
//   contact_no: Sequelize.STRING,
//   created_at: Sequelize.DATE
// });

// // Define associations
// Organisation.hasMany(Project, { foreignKey: 'orgId' });
// Project.belongsTo(Organisation, { foreignKey: 'orgId' });

// Project.hasMany(Events, { foreignKey: 'project_id' });
// Events.belongsTo(Project, { foreignKey: 'project_id' });

// Project.hasMany(Sessions, { foreignKey: 'project_id' });
// Sessions.belongsTo(Project, { foreignKey: 'project_id' });

// // Export the models
// module.exports = {
//   Organisation,
//   Project,
//   Events,
//   Sessions,
//   Persons,
//   Users,
//   sequelize // Optionally, you can export the sequelize instance too
// };
