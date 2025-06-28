const express = require("express");
const router = express.Router();
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/ask", async (req, res) => {
  try {
    const prompt = req.body.prompt || req.body.message;

    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    res.json({ reply: chatCompletion.choices[0].message.content.trim() });
  } catch (err) {
    console.error("AI Error:", err.message);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

module.exports = router;
