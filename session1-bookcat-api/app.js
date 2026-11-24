require('dotenv').config();

const express = require('express');
const sql = require('mssql');
const app = express();

app.use(express.json());

// Database configuration
const dbConfig = {
    server: process.env.DB_SERVER,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        trustServerCertificate: true
    }
};

// Home route
app.get('/', (req, res) => {
    res.send('Welcome to the Book Category API');
});

// Categories route
app.get('/categories', (req, res) => {
    res.json([
        { id: 1, name: 'Fiction' },
        { id: 2, name: 'Non-Fiction' },
        { id: 3, name: 'Biography' }
    ]);
});

// About route
app.get('/about', (req, res) => {
    res.send('I am a student at Ngee Ann Polytechnic. I am learning Backend Development.');
});

// GET all authors
app.get('/authors', async (req, res) => {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const result = await connection.request()
            .query('SELECT AuthorID, Name FROM Author');

        res.status(200).json(result.recordset);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });

    } finally {
        if (connection) await connection.close();
    }
});

// GET one author
app.get('/authors/:id', async (req, res) => {
    const authorId = Number(req.params.id);

    if (!Number.isInteger(authorId) || authorId <= 0) {
        return res.status(400).json({
            error: 'Invalid author id'
        });
    }

    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const request = connection.request();
        request.input('id', sql.Int, authorId);

        const result = await request.query(
            'SELECT AuthorID, Name FROM Author WHERE AuthorID = @id'
        );

        if (result.recordset.length === 0) {
            return res.status(404).json({
                error: 'Not found'
            });
        }

        res.status(200).json(result.recordset[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });

    } finally {
        if (connection) await connection.close();
    }
});

// POST a new author
app.post('/authors', async (req, res) => {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const request = connection.request();

        request.input('id', req.body.id);
        request.input('name', req.body.name);

        const result = await request.query(
            'INSERT INTO Author (AuthorID, Name) OUTPUT INSERTED.* VALUES (@id, @name)'
        );

        res.status(201).json(result.recordset[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });

    } finally {
        if (connection) await connection.close();
    }
});

// PUT - Update an author
app.put('/authors/:id', async (req, res) => {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const request = connection.request();

        request.input('id', sql.Int, Number(req.params.id));
        request.input('name', req.body.name);

        const result = await request.query(
            'UPDATE Author SET Name = @name OUTPUT INSERTED.* WHERE AuthorID = @id'
        );

        if (result.recordset.length === 0) {
            return res.status(404).json({
                error: 'Not found'
            });
        }

        res.status(200).json(result.recordset[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });

    } finally {
        if (connection) await connection.close();
    }
});

// DELETE an author
app.delete('/authors/:id', async (req, res) => {
    const authorId = Number(req.params.id);

    if (!Number.isInteger(authorId) || authorId <= 0) {
        return res.status(400).json({
            error: 'Invalid author id'
        });
    }

    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const request = connection.request();
        request.input('id', sql.Int, authorId);

        const result = await request.query(
            'DELETE FROM Author WHERE AuthorID = @id'
        );

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                error: 'Not found'
            });
        }

        res.status(204).send();

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });

    } finally {
        if (connection) await connection.close();
    }
});

// Start server
app.listen(3000, () => {
    console.log('Listening on port 3000');
});