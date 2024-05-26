


const Sequelize = require('sequelize');


// Initialize Sequelize with your database credentials
const sequelize = new Sequelize('mydatabase', 'mynewuser', 'newpassword', {
  host: 'localhost',
  dialect: 'postgres',
  port: 5432
});

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Export the Sequelize instance
module.exports = sequelize;
