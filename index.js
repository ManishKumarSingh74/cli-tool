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
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "You are an expert MCQ solver. You must follow these exact steps: First, carefully analyze the image, read the question, and evaluate all options step-by-step inside <thinking>...</thinking> tags to ensure you are correct. Then, output ONLY the final correct option letter (like A, B, C, or D) inside <answer>...</answer> tags. Example: <thinking>...</thinking><answer>B</answer>" },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ],
        temperature: 0.1
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const fullText = response.data.choices[0].message.content;
    const answerMatch = fullText.match(/<answer>([\s\S]*?)<\/answer>/i);
    const finalResult = answerMatch ? answerMatch[1].trim() : fullText.slice(0, 80);

    res.json({
      result: finalResult
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
