import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import bodyParser from 'body-parser';

const app = express();
const port = process.env.PORT || 3000;
const databaseName = 'sql12786360';

app.use(cors());
app.use(bodyParser.json());

const pool = mysql.createPool({
    host: 'sql12.freesqldatabase.com',
    port: 3306,
    user: 'sql12786360',
    password: 'bYC3cnLz68',
    database: databaseName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.get('/', (req, res) => {
    res.send('API is working');
});

app.get('/items', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM items');
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/items/:email', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM items WHERE email = ?', [req.params.email]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/items', async (req, res) => {
    const { id, username, email, password, itemName, itemDescription, itemDate, itemStart, itemEnd } = req.body;
    try {
        await pool.query(
            'INSERT INTO items (id, username, email, password, itemName, itemDescription, itemDate, itemStart, itemEnd) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, username, email, password, itemName, itemDescription, itemDate, itemStart, itemEnd]
        );
        res.json({ message: 'Item created successfully', id });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete('/items/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM items WHERE id = ?', [req.params.id]);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.put('/users/:email', async (req, res) => {
    const { xp } = req.body;
    try {
        await pool.query('UPDATE users SET xp = ? WHERE email = ?', [xp, req.params.email]);
        res.json({ message: 'XP updated', amount: xp, email: req.params.email });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/users/:email', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT xp FROM users WHERE email = ?', [req.params.email]);
        if (results.length > 0) {
            res.json({ xp: results[0].xp });
        } else {
            res.json({ xp: 0 });
        }
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

const TIMELY_PING_URL = 'https://timely-2.onrender.com/ping';
setInterval(() => { fetch(TIMELY_PING_URL).catch(() => {}); }, 10 * 60 * 1000);

app.get('/ping', (req, res) => res.status(200).send('pong'));

app.listen(port, () => {
    console.log(`🚀 Server is live on port ${port}`);
});
