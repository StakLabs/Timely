import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch'; // Only needed if Node < 18

const app = express();

const allowedOrigins = ['https://www.timelypro.online', 'http://127.0.0.1:5500'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      console.log("🌍 Allowed Origin:", origin);
      return callback(null, true);
    } else {
      console.log("🚫 Blocked Origin:", origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['POST']
}));

app.use(express.json());

app.post('/ask', async (req, res) => {
  const { prompt, system } = req.body;

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is missing on the server' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error('❌ OpenAI call failed:', err);
    res.status(500).json({ error: 'OpenAI request failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 AI server lit on port ${PORT}`));
