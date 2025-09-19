const express = require('express');
const router = express.Router();
const { contactSchema } = require('./validation');

module.exports = (db) => {
    
    router.get('/', (req, res) => {
        db.all("SELECT * FROM contacts ORDER BY id DESC", [], (err, rows) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            res.json(rows);
        });
    });

   
    router.post('/', (req, res) => {
        req.body.full_name = req.body.full_name.trim()  
        const { error } = contactSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ "error": error.details[0].message });
        }

        const { name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite, is_active } = req.body;

        // Check for duplicate email, phone, or whatsapp
        db.all("SELECT * FROM contacts WHERE email = ? OR phone = ? OR whatsapp = ?", [email, phone, whatsapp], (err, rows) => {
            if (err) {
                return res.status(400).json({ "error": err.message });
            }
            if (rows && rows.length > 0) {
                const duplicates = rows.map(row => {
                    const duplicateField = {};
                    if (row.email === email) duplicateField.email = email;
                    if (row.phone === phone) duplicateField.phone = phone;
                    if (row.whatsapp === whatsapp) duplicateField.whatsapp = whatsapp;
                    return { ...row, duplicateField };
                });
                return res.status(409).json({ message: "Duplicate contacts found.", duplicates });
            }

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
    });

    
    router.put('/:id', (req, res) => {
        const { error } = contactSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ "error": error.details[0].message });
        }

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

    
    router.delete('/:id', (req, res) => {
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

    router.post('/bulk-import', async (req, res) => {
        const contacts = req.body;
        if (!Array.isArray(contacts)) {
            return res.status(400).json({ "error": "Request body must be an array of contacts." });
        }

        const duplicates = [];
        const nonDuplicates = [];

        for (const contact of contacts) {
            const { error } = contactSchema.validate(contact);
            if (error) {
                return res.status(400).json({ "error": error.details[0].message });
            }

            const { email, phone, whatsapp } = contact;
            const row = await new Promise((resolve, reject) => {
                db.get("SELECT * FROM contacts WHERE email = ? OR phone = ? OR whatsapp = ?", [email, phone, whatsapp], (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                });
            });

            if (row) {
                const duplicateField = {};
                if (row.email === email) duplicateField.email = email;
                if (row.phone === phone) duplicateField.phone = phone;
                if (row.whatsapp === whatsapp) duplicateField.whatsapp = whatsapp;
                duplicates.push({ ...contact, duplicateField });
            } else {
                nonDuplicates.push(contact);
            }
        }

        if (duplicates.length > 0) {
            return res.status(409).json({ duplicates, nonDuplicates });
        } else {
            // No duplicates, proceed with bulk insert
            const stmt = db.prepare(`INSERT INTO contacts (
                name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

            db.serialize(() => {
                db.run("BEGIN TRANSACTION");
                for (const contact of nonDuplicates) {
                    const { name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite, is_active } = contact;
                    stmt.run(name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite ? 1 : 0, is_active ? 1 : 0);
                }
                db.run("COMMIT");
            });

            stmt.finalize();
            res.status(201).json({ message: `${nonDuplicates.length} contacts imported successfully.` });
        }
    });

    router.post('/bulk-import/skip', (req, res) => {
        const contacts = req.body;
        if (!Array.isArray(contacts)) {
            return res.status(400).json({ "error": "Request body must be an array of contacts." });
        }

        const stmt = db.prepare(`INSERT INTO contacts (
            name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            for (const contact of contacts) {
                const { name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite, is_active } = contact;
                stmt.run(name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite ? 1 : 0, is_active ? 1 : 0);
            }
            db.run("COMMIT");
        });

        stmt.finalize();
        res.status(201).json({ message: `${contacts.length} contacts imported successfully.` });
    });

    router.post('/bulk-import/add', (req, res) => {
        const contacts = req.body;
        if (!Array.isArray(contacts)) {
            return res.status(400).json({ "error": "Request body must be an array of contacts." });
        }

        const stmt = db.prepare(`INSERT INTO contacts (
            name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            for (const contact of contacts) {
                const { name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite, is_active } = contact;
                stmt.run(name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite ? 1 : 0, is_active ? 1 : 0);
            }
            db.run("COMMIT");
        });

        stmt.finalize();
        res.status(201).json({ message: `${contacts.length} contacts imported successfully.` });
    });

    return router;
};