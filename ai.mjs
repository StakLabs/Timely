import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors({
  origin: ['https://www.timelypro.online', 'http://127.0.0.1:5500'],
  methods: ['POST']
}));
app.use(express.json());

app.post('/ask', async (req, res) => {
  const { prompt, system, type } = req.body;

  console.log("📨 Incoming request:", { type, prompt });

  if (type === "image") {
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024"
      });

      const image_url = response.data[0].url;
      return res.json({ image_url });
    } catch (err) {
      console.error("🧨 Image gen failed:", err);
      return res.status(500).json({ error: "Image generation failed." });
    }
  } else {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: system || "You are a helpful assistant." },
          { role: "user", content: prompt }
        ]
      });

      const reply = response.choices?.[0]?.message?.content;
      return res.json({ reply });
    } catch (err) {
      console.error("❌ Chat completion failed:", err);
      return res.status(500).json({ error: "Chat generation failed." });
    }
  }
});

app.listen(3000, () => console.log('🔥 Lumen AI is vibing on port 3000'));
