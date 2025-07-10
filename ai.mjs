import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fetch from 'node-fetch' // Only if you're on Node <18; otherwise, remove this
dotenv.config()

const app = express()

// 👇 Setup CORS BEFORE anything else
app.use(cors({
  origin: 'https://www.timelypro.online',
  methods: ['POST']
}))

app.use(express.json())

app.post('/ask', async (req, res) => {
  const { prompt, system } = req.body

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
    })

    const data = await openaiRes.json()
    res.json(data)

  } catch (error) {
    console.error('❌ OpenAI fetch failed:', error)
    res.status(500).json({ error: 'Failed to contact OpenAI' })
  }
})

app.listen(3000, () => console.log('🔥 AI server is lit on port 3000'))
