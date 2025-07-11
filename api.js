import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise'; // use the promise-based version
import bodyParser from 'body-parser';

const app = express();
const port = process.env.PORT || 3000;
const databaseName = 'sql12786360';

app.use(cors());
app.use(bodyParser.json());

// 🌐 MySQL connection
const db = await mysql.createConnection({
    host: 'sql12.freesqldatabase.com',
    port: 3306,
    user: 'sql12786360',
    password: 'bYC3cnLz68',
    database: databaseName
});

console.log('✅ Connected to MySQL database');

// 🌍 Base Route
app.get('/', (req, res) => {
    res.send('API is working');
});

// 📦 Get all items
app.get('/items', async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM items');
        res.json(results);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 📦 Get items by email
app.get('/items/:email', async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM items WHERE email = ?', [req.params.email]);
        res.json(results);
    } catch (err) {
        res.status(500).json(err);
    }
});

// ➕ Add an item
app.post('/items', async (req, res) => {
    const { id, username, email, password, itemName, itemDescription, itemDate, itemStart, itemEnd } = req.body;

    try {
        await db.query(
            'INSERT INTO items (id, username, email, password, itemName, itemDescription, itemDate, itemStart, itemEnd) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, username, email, password, itemName, itemDescription, itemDate, itemStart, itemEnd]
        );
        res.json({ message: 'Item created successfully', id });
    } catch (err) {
        res.status(500).json(err);
    }
});

// ❌ Delete an item
app.delete('/items/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM items WHERE id = ?', [req.params.id]);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json(err);
    }
});

// ✏️ Update XP by email
app.put('/users/:email', async (req, res) => {
    const { xp } = req.body;

    try {
        await db.query('UPDATE users SET xp = ? WHERE email = ?', [xp, req.params.email]);
        res.json({ message: 'XP updated', amount: xp, email: req.params.email });
    } catch (err) {
        res.status(500).json(err);
    }
});

// 📊 Get XP for a user
app.get('/users/:email', async (req, res) => {
    try {
        const [results] = await db.query('SELECT xp FROM users WHERE email = ?', [req.params.email]);

        if (results.length > 0) {
            res.json({ xp: results[0].xp });
        } else {
            res.json({ xp: 0 }); // fallback
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// 🚀 Start server
app.listen(port, () => {
    console.log(`🚀 Server is live on port ${port}`);
});
