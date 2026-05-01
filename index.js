import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/analyze', async (req, res) => {
  try {
    const { image } = req.body;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.2-11b-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Answer in max 5 words only" },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${image}`
                }
              }
            ]
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      result: response.data.choices[0].message.content
    });

  } catch (err) {
    console.error("Groq API Error:", err.response?.data || err.message);
    res.status(500).json({ 
      error: err.message, 
      details: err.response?.data || "No additional details" 
    });
  }
});

app.listen(3000, () => {
    console.log("Server listening on port 3000");
});
