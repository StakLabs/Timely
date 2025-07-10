import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; // Needed only if on Node <18

dotenv.config();

const app = express();

// 🧠 Custom CORS middleware that always returns correct origin
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://www.timelypro.online',
    'http://127.0.0.1:5500'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// ⚠️ Handle preflight OPTIONS requests
app.options('/ask', (req, res) => {
  res.sendStatus(204);
});

app.use(express.json());

app.post('/ask', async (req, res) => {
  const { prompt, system } = req.body;
  console.log('🌍 Request Origin:', req.headers.origin);
  console.log('🔑 OpenAI Key:', process.env.OPENAI_API_KEY?.slice(0, 10) + '...');

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
  } catch (error) {
    console.error('❌ OpenAI fetch failed:', error);
    res.status(500).json({ error: 'Failed to contact OpenAI' });
  }
});

app.listen(3000, () => console.log('🔥 AI server is lit on port 3000'));
