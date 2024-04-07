// File made with the assistance of Chat-GPT
require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const User = require('./user');
const app = express();
const PORT = process.env.PORT || 3000;
const { router: authRouter, authenticateToken } = require('./authRoutes');
const fs = require('fs');


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/auth', authRouter);

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../simple-translator.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
const protectedRouter = express.Router();
protectedRouter.use(authenticateToken);

// Serve unprotected static files manually
app.get('*', (req, res, next) => {
  // If the root path is requested, serve index.html
  if (req.path === '/') {
    return res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  }

  const filePath = path.join(__dirname, '..', 'public', req.path);

  // Check if the file exists and it's not a protected file
  if (fs.existsSync(filePath) && !['/home.html', '/admin.html'].includes(req.path)) {
    return res.sendFile(filePath);
  } else {
    next(); // Move to the next middleware (which could be your authentication check or a 404 handler)
  }
});

// Protected routes with authentication
app.get('/home', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'home.html'));
});

app.get('/admin', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});

app.get('/home.html', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'home.html'));
});

app.get('/admin.html', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});


// app.use('/', protectedRouter);

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
