const express = require("express");
const axios = require("axios");
const router = express.Router();

const HF_API_KEY = process.env.HFAPIKEY;

router.post("/ask", async (req, res) => {
  try {
    const prompt = req.body.prompt || req.body.message;

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct",
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ reply: response.data?.[0]?.generated_text || "No reply." });
  } catch (err) {
    console.error("AI Error:", err.message);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

module.exports = router;
