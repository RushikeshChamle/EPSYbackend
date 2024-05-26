// // app.js

// const express = require('express');
// const app = require('./middlewares/middleware');


// const { sequelize } = require('./models/models');
// const userController = require('./controllers/controllers');

// const PORT = process.env.PORT || 9000;

// // Routes
// app.post('/signup', userController.signup);

// // Sync Sequelize models with database
// sequelize.sync().then(() => {
//   console.log('Database synced');
// }).catch(err => {
//   console.error('Error syncing database:', err);
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


