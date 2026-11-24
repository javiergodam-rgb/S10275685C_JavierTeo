
const express = require('express');
const sql = require('mssql');
const app = express();

app.get('/', (req, res) => {
    res.send('Welcome to the Book Category API');
});

app.get('/categories', (req, res) => {
    res.json([
        { id: 1, name: 'Fiction' },
        { id: 2, name: 'Non-Fiction' },
        { id: 3, name: 'Biography' }
    ]);
});

app.get('/about', (req, res) => {
    res.send('Hi, I am a student from Ngee Ann Polytechnic. I am learning backend development using Node.js and Express.');
});

app.get('/db-test', async (req, res) => {
    try {
        const pool = await sql.connect({
            server: 'localhost',
            port: 1433,
            database: 'NPBookstore',
            user: 'npbookstore_user',
            password: 'Meowmeowmeow123',
            options: { trustServerCertificate: true },
        });

        const result = await pool.request()
            .query('SELECT COUNT(*) AS Total FROM Author');

        await pool.close();

        res.json({
            connected: true,
            authors: result.recordset[0].Total
        });
    } catch (err) {
        res.status(500).json({
            connected: false,
            error: err.message
        });
    }
});
app.listen(3000, () => {
    console.log('Listening on port 3000');
});
