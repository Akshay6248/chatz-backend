const express = require("express");
const router = express.Router();
const axios = require("axios");

const HF_API_KEY = process.env.HFAPIKEY; // Make sure this is set in .env and Render dashboard

router.post("/ask", async (req, res) => {
  const prompt = req.body.prompt || req.body.message;

  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/microsoft/phi-2", // <-- Use a supported model
      {
        inputs: prompt, // not { text: prompt }
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
        },
      }
    );

    const reply = response.data.generated_text || "🤖 Sorry, I didn’t get that.";
    res.json({ reply });
  } catch (error) {
    console.error("AI Error:", error.response?.data || error.message);
    res.status(500).json({ error: "AI call failed", details: error.response?.data || error.message });
  }
});

module.exports = router;
