
const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

module.exports = function(db) {
  const router = express.Router();

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  router.post('/send', (req, res) => {
    const { to, subject, html } = req.body;

    if (!to) {
      return res.status(400).send('No recipients defined');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send(error.toString());
      }

      const sent_at = new Date().toISOString();
      db.run(`INSERT INTO email_logs (recipients, subject, message, sent_at) VALUES (?, ?, ?, ?)`, [to, subject, html, sent_at], (err) => {
        if (err) {
          console.error('Error inserting email log:', err.message);
        }
      });

      res.status(200).send('Email sent: ' + info.response);
    });
  });

  router.get('/logs', (req, res) => {
    db.all(`SELECT * FROM email_logs ORDER BY sent_at DESC`, [], (err, rows) => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }
      res.json(rows);
    });
  });

  return router;
}
