import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fetch from 'node-fetch' // only if Node <18

dotenv.config()

const app = express()

const allowedOrigins = [
  'https://www.timelypro.online',
  'http://127.0.0.1:5500'
];

app.use(cors({
  origin: function (origin, callback) {
    console.log("🌍 Request Origin:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("❌ Not allowed by CORS"));
    }
  },
  methods: ['POST'],
  credentials: true
}));

app.use(express.json());

app.post('/ask', async (req, res) => {
  const { prompt, system } = req.body;
  console.log("🔑 OpenAI Key:", process.env.OPENAI_API_KEY?.slice(0, 5) + '...');
  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await openaiRes.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Failed to contact OpenAI:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => console.log("🔥 Server running on port 3000"));
