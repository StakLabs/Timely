import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch'; // Only needed for Node < 18

const app = express();

// 💥 Hardcode your key here TEMPORARILY
const OPENAI_API_KEY = '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'; // <== PASTE FULL KEY

// 🔐 CORS debug config — allow both prod and localhost
app.use(cors({
  origin: ['https://www.timelypro.online', 'http://127.0.0.1:5500'],
  methods: ['POST'],
}));

app.use(express.json());

app.post('/ask', async (req, res) => {
  const { prompt, system } = req.body;

  console.log("🌍 Request Origin:", req.headers.origin || 'undefined');
  console.log("🔑 Using OpenAI Key:", OPENAI_API_KEY.slice(0, 15) + '...');

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
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

    if (data.error) {
      console.error("🛑 OpenAI Error:", data.error);
    }

    res.json(data);
  } catch (err) {
    console.error('❌ Request to OpenAI failed:', err);
    res.status(500).json({ error: 'Failed to contact OpenAI' });
  }
});

app.listen(3000, () => console.log('🔥 Debug AI server running on port 3000'));
