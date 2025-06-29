const express = require("express");
const router = express.Router();
const axios = require("axios");

const HF_API_KEY = process.env.HFAPIKEY;

router.post("/ask", async (req, res) => {
  const prompt = req.body.prompt || req.body.message;

  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
      {
        inputs: {
          text: prompt,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
        },
      }
    );

    const reply = response.data.generated_text || "Sorry, I didn't understand that.";
    res.json({ reply });
  } catch (error) {
    console.error("AI Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

module.exports = router;
