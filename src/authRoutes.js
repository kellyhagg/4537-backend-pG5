// File made with the assistance of Chat-GPT
require('dotenv').config();
const { messages } = require('../public/lang/messages/en/messages.js');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('./user');
const ApiCall = require('./apiCall');
const recordApiCall = require('./apiStats');
const ApiStats = require('./apiSchema');
const { sendPasswordResetEmail } = require('./mailer');
const router = express.Router();
router.use(recordApiCall); // Record API call stats for all routes

// User Registration Endpoint
router.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      firstName: req.body.firstName,
      email: req.body.email,
      password: hashedPassword,
    });
    await user.save();

    // Create an ApiCall entry for the new user with the initial apiCallsCount set to 0
    const newApiCall = new ApiCall({
      userId: user._id, // Reference the newly created user's ID
      apiCallsCount: 0 // Initialize the count to 0
    });
    await newApiCall.save();

    const confirmationPage = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta http-equiv="refresh" content="5;url=/login.html">
        <title>Registration Successful</title>
      </head>
      <body>
        <h1>Registration Successful!</h1>
        <p>You will be redirected to the login page in 5 seconds. If not, click <a href="/login.html">here</a> to go to the login page.</p>
      </body>
      </html>
    `;
    res.send(confirmationPage);
  } catch (error) {
    console.error(error);
    res.status(500).send(messages.registerError);
  }
});

// User Login Endpoint
router.post('/login', async (req, res) => {
  // Admin user authentication
  if (req.body.email === process.env.ADMIN_EMAIL && req.body.password === process.env.ADMIN_PASSWORD) {
    const adminToken = jwt.sign({ adminId: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('adminToken', adminToken, { httpOnly: true });
    return res.redirect('/admin.html'); // Return here to prevent further execution
  }

  // Regular user authentication
  const user = await User.findOne({ email: req.body.email });
  if (user && await bcrypt.compare(req.body.password, user.password)) {
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, { httpOnly: true, sameSite: 'strict', path: '/' });
    return res.redirect('/home.html'); // Return here as well
  }

  return res.status(400).send("Incorrect password or email."); // Return here to ensure response is sent only once
});

// User Logout Endpoint
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.clearCookie('adminToken');
  res.redirect('/index.html');
});

// Get users endpoint
router.get('/users', async (req, res) => {
  try {
    // Retrieve all users but exclude password and __v fields
    const users = await User.find().select('-password -__v');
    res.json(users);
  } catch (error) {
    console.error('Failed to retrieve users:', error);
    res.status(500).send('Failed to get users.');
  }
});

// Check Login Endpoint
router.get('/check-login', authenticateToken, async (req, res) => {
  try {
    // req.user is set by the authenticateToken middleware
    const user = await User.findById(req.user.userId);
    if (user) {
      res.json({ loggedIn: true, name: user.firstName });
    } else {
      res.json({ loggedIn: false });
    }
  } catch (error) {
    console.error('Error checking login status:', error);
    res.status(500).send('Error checking login status.');
  }
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  // Check for the admin token first
  const adminToken = req.cookies.adminToken;
  if (adminToken) {
    return jwt.verify(adminToken, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        return res.sendStatus(403); // Admin token is invalid or expired
      }
      if (decodedToken.adminId === 'admin') {
        req.admin = true; // Mark the request as authenticated by an admin
        return next();
      }
      return res.sendStatus(403); // Token did not decode to an admin ID
    });
  }

  // Check for a regular user token if no admin token is found
  const token = req.cookies.token;
  if (token) {
    return jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        return res.sendStatus(403); // Token is invalid or expired
      }
      req.user = { userId: decodedToken.userId }; // Set the user object for the next middleware
      return next();
    });
  }

  // No token found, unauthorized
  return res.sendStatus(401);
}


// Translation endpoint
router.post('/translate', authenticateToken, async (req, res) => {
  try {
    // Extract data from the request body
    const { text, source_language, target_language } = req.body;

    // Call the external API for translation
    const translationResponse = await axios.post('https://588d-2604-3d08-657c-8100-912d-2b88-2ba-b66e.ngrok-free.app/translate', {
      text: text,
      source_language: source_language,
      target_language: target_language
    });

    // Get the translation from the external API's response
    const translatedText = translationResponse.data.translation;

    // Find or create the ApiCall document for the user
    const apiCallDocument = await ApiCall.findOneAndUpdate(
      { userId: req.user.userId },
      { $inc: { apiCallsCount: 1 } },
      { new: true, upsert: true } // Use upsert option to create a new document if it doesn't exist
    );

    // Respond to the client with the translation
    res.json({ translation: translatedText }); // Make sure translatedText is defined
  } catch (error) {
    console.error("Error during translation:", error);
    res.status(500).send("Error processing translation.");
  }
});

// Endpoint to get the number of free API calls
router.get('/free-calls', authenticateToken, async (req, res) => {
  try {
    const apiCallDocument = await ApiCall.findOne({ userId: req.user.userId });
    if (!apiCallDocument) return res.status(404).send('ApiCall document not found');

    res.json({ apiCallsCount: apiCallDocument.apiCallsCount });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Endpoint to get API call counts for all users
router.get('/user-api-calls', async (req, res) => {
  try {
    // Retrieve all users and join with the ApiCalls collection
    const usersWithApiCalls = await User.aggregate([
      {
        $lookup: {
          from: "apicalls",
          localField: "_id",
          foreignField: "userId",
          as: "apiCallsInfo"
        }
      },
      {
        $unwind: "$apiCallsInfo" // Unwind the array to merge the data into the user object
      },
      {
        $project: {
          firstName: 1,
          email: 1,
          apiCallsCount: "$apiCallsInfo.apiCallsCount" // Project the apiCallsCount from the joined document
        }
      }
    ]);
    res.json(usersWithApiCalls);
  } catch (error) {
    console.error('Failed to retrieve user API calls:', error);
    res.status(500).send('Server error');
  }
});

// Middleware to verify the admin token
function authenticateAdmin(req, res, next) {
  const token = req.cookies.adminToken; // Get admin token from HTTP-only cookie
  if (!token) {
    return res.sendStatus(401); // No token, unauthorized
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
    if (err || decodedToken.adminId !== 'admin') {
      return res.sendStatus(403); // Token is invalid or expired, or not admin
    }
    next(); // Token is valid, proceed
  });
}

// PUT endpoint to reset a user's API calls count
router.put('/reset-api-calls/:userId', authenticateAdmin, async (req, res) => {
  try {
    // Reset the apiCallsCount for the user specified by userId param
    const updatedApiCall = await ApiCall.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: { apiCallsCount: 0 } }, // Use $set to update the field
      { new: true }
    );

    if (!updatedApiCall) {
      return res.status(404).send("User's API call record not found.");
    }

    res.send({ message: "API calls count has been reset.", apiCallsCount: updatedApiCall.apiCallsCount });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error while resetting API calls count.");
  }
});

// DELETE endpoint to delete a user
router.delete('/delete-user/:userId', authenticateAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // First, delete or handle related data like the user's API calls records
    await ApiCall.deleteMany({ userId });

    // Then, delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).send("User not found.");
    }

    res.send({ message: "User deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error while deleting user.");
  }
});


// Endpoint to get API stats for all endpoints
router.get('/api-stats', async (req, res) => {
  try {
    const apiStats = await ApiStats.find(); // Fetch all stats from the ApiStats collection
    res.json(apiStats); // Send the stats back to the client
  } catch (error) {
    console.error('Failed to retrieve API stats:', error);
    res.status(500).send('Server error');
  }
});

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).send(messages.userNotFound);
  }

  const token = require('crypto').randomBytes(20).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 600000; // 10 minutes, can change
  await user.save();

  sendPasswordResetEmail(user.email, token);

  res.send(messages.resetSent);
});

// GET endpoint for displaying the password reset page
router.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;
  // You might want to verify the token here and then render a reset password form
  // For simplicity, we'll assume the token is valid and just send back an HTML form
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Reset Password</title>
    </head>
    <body>
      <h2>Reset Password</h2>
      <form action="/auth/reset-password/${token}" method="post">
        <label for="password">New Password:</label>
        <input type="password" id="password" name="password" required>
        <label for="confirmPassword">Confirm New Password:</label>
        <input type="password" id="confirmPassword" name="confirmPassword" required>
        <button type="submit">Reset Password</button>
      </form>
    </body>
    </html>
  `);
});

// Reset password endpoint
// TODO: Test this
router.post('/reset-password/:token', async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).send(messages.invalidToken);
  }

  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).send(messages.mismatchPassword);
  }

  user.password = await bcrypt.hash(req.body.password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.send(messages.updatePassword);
});

module.exports = {
  router,
  authenticateToken
};

