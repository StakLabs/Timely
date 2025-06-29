
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const mysql = require('mysql2');
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const port = 3306;
const databaseName = 'sql12786360';
// MySQL connection
const db = mysql.createConnection({
    host: 'sql12.freesqldatabase.com',
    port: port, // default MySQL port
    user: 'sql12786360',
    password: 'bYC3cnLz68', // update if needed
    database: databaseName
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});
// Routes
app.get('/', (req, res) => {
    res.send('API is working');
});

// Get one student
app.get('/items/:email', (req, res) => {
    db.query('SELECT * FROM items WHERE email = ?', [req.params.email], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/items', (req, res) => {
    const { id, username, email, password, itemName, itemDescription, itemDate, itemStart, itemEnd } = req.body;
    db.query('INSERT INTO items (id, username, email, password, itemName, itemDescription, itemDate, itemStart, itemEnd) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, username, email, password, itemName, itemDescription, itemDate, itemStart, itemEnd], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Item created successfully', id: id });
    });
});

app.delete('/items/:id', (req, res) => {
    db.query('DELETE FROM items WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Item deleted' });
    });
});
app.put('/users/:id', (req, res) => {
    const { xp, email } = req.body;
    db.query('UPDATE users SET xp = ? WHERE email = ?', [xp, id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'xp updated', amount: xp, email: email });
    });
});

app.get('/users/:email', (req, res) => {
    db.query('SELECT xp FROM users WHERE email = ?', [req.params.email], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length > 0) {
            res.json({ xp: results[0].xp });
        } else {
            res.json({ xp: 0 }); // or handle user not found differently
        }
    });
});

// Start server
app.listen(3000, () => {
    //console.log(`Server is running on http://localhost:${port}`);
    console.log(`Server is running on http://localhost:3000`);
});
//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
