
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
    const { to, subject, html, scheduled_at } = req.body;

    if (!to) {
      return res.status(400).send('No recipients defined');
    }

    const userAttachments = req.files ? req.files.map(file => ({ filename: file.originalname, path: file.path })) : [];

    if (scheduled_at) {
      const attachments = JSON.stringify(userAttachments);
      db.run(`INSERT INTO scheduled_emails (recipients, subject, message, attachments, scheduled_at) VALUES (?, ?, ?, ?, ?)`, [to, subject, html, attachments, scheduled_at], (err) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.status(200).send('Email scheduled successfully');
      });
      return;
    }

    const mailOptions = {
      from: `"Minds in Motion Foundation" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: html + '<br><img src="cid:mim-logo"/>',
      attachments: [
        ...userAttachments,
        {
          filename: 'MIM_logo.jpeg',
          path: 'd:/Projects/expocomms2025/images/MIM_logo.jpeg',
          cid: 'mim-logo'
        }
      ],
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

  router.delete('/logs/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM email_logs WHERE id = ?`, [id], function(err) {
      if (err) {
        return res.status(500).send(err.message);
      }
      if (this.changes === 0) {
        return res.status(404).send({ message: "Log not found" });
      }
      res.status(200).send({ message: "Log deleted successfully" });
    });
  });

  router.get('/scheduled', (req, res) => {
    db.all(`SELECT * FROM scheduled_emails ORDER BY scheduled_at DESC`, [], (err, rows) => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }
      res.json(rows);
    });
  });

  router.delete('/scheduled/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM scheduled_emails WHERE id = ?`, [id], function(err) {
      if (err) {
        return res.status(500).send(err.message);
      }
      if (this.changes === 0) {
        return res.status(404).send({ message: "Scheduled email not found" });
      }
      res.status(200).send({ message: "Scheduled email deleted successfully" });
    });
  });

  return router;
}
