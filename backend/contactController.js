const express = require('express');
const router = express.Router();
const { contactSchema } = require('./validation');

module.exports = (db) => {
    
    router.get('/', (req, res) => {
        db.all("SELECT * FROM contacts", [], (err, rows) => {
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

    router.post('/bulk-import', (req, res) => {
        const contacts = req.body;
        if (!Array.isArray(contacts)) {
            return res.status(400).json({ "error": "Request body must be an array of contacts." });
        }

        const stmt = db.prepare(`INSERT INTO contacts (
            name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            contacts.forEach(contact => {
                const { error } = contactSchema.validate(contact);
                if (error) {
                    db.run("ROLLBACK");
                    return res.status(400).json({ "error": error.details[0].message });
                }
                const { name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite, is_active } = contact;
                stmt.run(name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite ? 1 : 0, is_active ? 1 : 0);
            });
            db.run("COMMIT", (err) => {
                if (err) {
                    db.run("ROLLBACK");
                    res.status(500).json({ "error": err.message });
                } else {
                    res.status(201).json({ message: `${contacts.length} contacts imported successfully.` });
                }
            });
        });

        stmt.finalize();
    });

    return router;
};