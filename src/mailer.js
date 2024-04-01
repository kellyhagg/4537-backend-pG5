// File made with the assistance of Chat-GPT
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const sendPasswordResetEmail = (to, token) => {
  const resetURL = `http://<your-domain>/reset-password/${token}`;
  const mailOptions = {
    from: process.env.EMAIL,
    to: to,
    subject: 'Password Reset Link',
    text: `Please click on the following link to reset your password: ${resetURL}`
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

module.exports = { sendPasswordResetEmail };
