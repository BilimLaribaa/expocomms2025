const express = require('express');
const router = express.Router();
const { contactSchema } = require('./validation');

module.exports = (db) => {

    router.get('/', (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 10;
            const offset = (page - 1) * pageSize;

            db.get("SELECT COUNT(*) as count FROM contacts", (err, row) => {
                if (err) {
                    throw new Error(err.message);
                }
                const totalContacts = row.count;
                db.all("SELECT * FROM contacts ORDER BY id DESC LIMIT ? OFFSET ?", [pageSize, offset], (err, rows) => {
                    if (err) {
                        throw new Error(err.message);
                    }
                    return res.json({ "success": true, "data": rows, "total": totalContacts });
                });
            });
        } catch (error) {
            console.error(error);
            return res.json({ "success": false, "error": error.message });
        }
    });


    router.post('/', (req, res) => {
        try { 

            const { error } = contactSchema.validate(req.body);
            if (error) {
                throw new Error(error.message);
            }
            
            
            let { name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite, is_active } = req.body;
            full_name = full_name.trim()
            
            db.all("SELECT * FROM contacts WHERE email = ? OR phone = ? OR whatsapp = ?", [email, phone, whatsapp], (err, rows) => {
                if (err) {
                    throw new Error(err.message);
                }
                if (rows && rows.length > 0) {
                    const duplicates = rows.map(row => {
                        let duplicateField = {};
                        duplicateField.email = email;
                        duplicateField.phone = phone;
                        duplicateField.whatsapp = whatsapp;
                        return { ...row, duplicateField };
                    });
                    return res.json({sucess:false, message: "Duplicate contacts found.", duplicates });
                }

                const stmt = db.prepare(`INSERT INTO contacts (
                name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
                stmt.run(name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite ? 1 : 0, is_active ? 1 : 0, function (err) {
                    if (err) {
                        throw new Error(err.message);
                    }
                    res.status(201).json({ id: this.lastID, ...req.body });
                });
                stmt.finalize();
            });
        }
        catch (error) {
            console.error(error);
            return res.json({ "sucess": false, "error": error.message });
        }
    });


    router.put('/:id', (req, res) => {
        try {
            const { error } = contactSchema.validate(req.body);
            if (error) {
                throw new Error(error.details[0].message);
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
                        throw new Error(err.message);
                    }
                    if (this.changes === 0) {
                        throw new Error('Contact not found');
                    } else {
                        res.status(200).json({ id: id, ...req.body });
                    }
                }
            );
        } catch (error) {
            console.error(error);
            return res.json({ "sucess": false, "error": error.message });
        }
    });


    router.delete('/:id', (req, res) => {
        try {
          
            const id = parseInt(req.params.id);
            db.run("DELETE FROM contacts WHERE id = ?", id, function (err) {
                if (err) {
                    throw new Error(err.message);
                }
                if (this.changes === 0) {
                    throw new Error('Contact not found');
                } else {
                    res.status(204).send();
                }
            });
        } catch (error) {
            console.error(error);
            return res.json({ "sucess": false, "error": error.message });
        }
    });

    router.post('/bulk-import', async (req, res) => {
        try {
            const contacts = req.body;

            if (!Array.isArray(contacts)) {
                throw new Error("Request body must be an array of contacts.");
            }

            const duplicates = [];
            const nonDuplicates = [];

            for (const contact of contacts) {
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

            if (nonDuplicates.length > 0) {
                // Bulk insert non-duplicate contacts
                const stmt = db.prepare(`INSERT INTO contacts (
                name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)

                db.serialize(() => {
                    db.run("BEGIN TRANSACTION");
                    for (const contact of nonDuplicates) {
                        const { name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite, is_active } = contact;
                        stmt.run(name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite ? 1 : 0, is_active ? 1 : 0);
                    }
                    db.run("COMMIT");
                });

                stmt.finalize();
            }

            if (duplicates.length > 0) {
                return res.status(409).json({ duplicates, nonDuplicates });
            } else {
                res.status(201).json({ message: `${nonDuplicates.length} contacts imported successfully.` });
            }
        } catch (error) {
            console.error(error);
            return res.json({ "sucess": false, "error": error.message });
        }
    });

    router.post('/bulk-import/skip', (req, res) => {
        try {
        
            const contacts = req.body;
            if (!Array.isArray(contacts)) {
                throw new Error("Request body must be an array of contacts.");
            }

            const stmt = db.prepare(`INSERT INTO contacts (
            name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)

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
        } catch (error) {
            console.error(error);
            return res.json({ "sucess": false, "error": error.message });
        }
    });

    router.post('/bulk-import/add', (req, res) => {
        try {
            const contacts = req.body;
            if (!Array.isArray(contacts)) {
                throw new Error("Request body must be an array of contacts.");
            }

            const stmt = db.prepare(`INSERT INTO contacts (
            name_title, full_name, phone, whatsapp, email, alternate_email, address, city, state, postal_code, country, contact_type, organization_name, job_title, department, website, linkedin, facebook, instagram, relationship, notes, is_favorite, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)

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
        } catch (error) {
            console.error(error);
            return res.json({ "sucess": false, "error": error.message });
        }
    });

    return router;
};