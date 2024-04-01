// File made with the assistance of Chat-GPT
require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./authRoutes');
const cookieParser = require('cookie-parser');
const User = require('./user');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/auth', authRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Test database connection endpoint
app.get('/test-db', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Database connection test failed:', error);
    res.status(500).send('Failed to connect to the database.');
  }
});
