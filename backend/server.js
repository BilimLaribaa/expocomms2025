
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
      }
    });
  }
});

app.use(cors());
app.use(bodyParser.json());

// GET all contacts
app.get('/api/contacts', (req, res) => {
  db.all("SELECT * FROM contacts", [], (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json(rows);
  });
});

// POST a new contact
app.post('/api/contacts', (req, res) => {
  const { name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite, is_active } = req.body;
  const stmt = db.prepare(`INSERT INTO contacts (
    name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite, is_active
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  stmt.run(name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite ? 1 : 0, is_active ? 1 : 0, function (err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.status(201).json({ id: this.lastID, ...req.body });
  });
  stmt.finalize();
});

// POST multiple contacts (bulk import)
app.post('/api/contacts/bulk-import', (req, res) => {
  const importedContacts = req.body;
  if (Array.isArray(importedContacts)) {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");
      const stmt = db.prepare(`INSERT INTO contacts (
        name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      importedContacts.forEach(contact => {
        stmt.run(contact.name_title, contact.full_name, contact.phone, contact.whatsapp, contact.email, contact.alternate_email, contact.address, contact.city, contact.state, contact.postal_code, contact.country, contact.contact_type, contact.organization_name, contact.job_title, contact.department, contact.website, contact.linkedin, contact.facebook, contact.instagram, contact.relationship, contact.notes, contact.is_favorite ? 1 : 0, contact.is_active ? 1 : 0);
      });
      stmt.finalize();
      db.run("COMMIT", (err) => {
        if (err) {
          res.status(400).json({ "error": err.message });
          return;
        }
        res.status(200).json({ message: `${importedContacts.length} contacts imported successfully!`, count: importedContacts.length });
      });
    });
  } else {
    res.status(400).json({ message: 'Request body must be an array of contacts.' });
  }
});

// PUT (update) a contact
app.put('/api/contacts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite, is_active } = req.body;
  db.run(`UPDATE contacts SET
    name_title = ?,
    full_name = ?,
    phone = ?,
    whatsapp = ?,
    email = ?,
    alternate_email = ?,
    address = ?,
    city = ?,
    state = ?,
    postal_code = ?,
    country = ?,
    contact_type = ?,
    organization_name = ?,
    job_title = ?,
    department = ?,
    website = ?,
    linkedin = ?,
    facebook = ?,
    instagram = ?,
    relationship = ?,
    notes = ?,
    is_favorite = ?,
    is_active = ?
    WHERE id = ?`,
    name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite ? 1 : 0, is_active ? 1 : 0, id, function (err) {
      if (err) {
        res.status(400).json({ "error": err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ message: 'Contact not found' });
      } else {
        res.status(200).json({ id: id, ...req.body });
      }
    }
  );
});

// DELETE a contact
app.delete('/api/contacts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.run("DELETE FROM contacts WHERE id = ?", id, function (err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ message: 'Contact not found' });
    } else {
      res.status(204).send();
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
