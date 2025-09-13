
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3001;

// Connect to SQLite database
const db = new sqlite3.Database('./contacts.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Create contacts table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_title TEXT,
      full_name TEXT,
      phone TEXT,
      whatsapp TEXT,
      email TEXT,
      alternate_email TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      postal_code TEXT,
      country TEXT,
      contact_type TEXT,
      organization_name TEXT,
      job_title TEXT,
      department TEXT,
      website TEXT,
      linkedin TEXT,
      facebook TEXT,
      instagram TEXT,
      relationship TEXT,
      notes TEXT,
      is_favorite INTEGER,
      is_active INTEGER
    )`, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Contacts table created or already exists.');
        db.run(`CREATE TABLE IF NOT EXISTS email_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          recipients TEXT,
          subject TEXT,
          message TEXT,
          sent_at TEXT
        )`, (err) => {
          if (err) {
            console.error('Error creating email_logs table:', err.message);
          } else {
            console.log('email_logs table created or already exists.');
          }
        });
      }
    });
  }
});


app.use(cors());
app.use(bodyParser.json());

const contactController = require('./contactController')(db);
const emailController = require('./emailController')(db);

app.use('/api/contacts', contactController);
app.use('/api/email', emailController);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
