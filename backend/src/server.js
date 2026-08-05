const mongoose = require('mongoose');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('./app');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/enterprise_lms';

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected successfully');
    app.listen(PORT, () => {
      console.log(`Enterprise LMS Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.warn('Database Connection Error (starting server without Mongo connection):', err.message);
    app.listen(PORT, () => {
      console.log(`Enterprise LMS Server listening on port ${PORT}`);
    });
  });
