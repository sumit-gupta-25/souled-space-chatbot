import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = "YOUR_KEY";

function isCrisis(text) {
  const words = ["suicide", "kill myself", "die"];
  return words.some(w => text.toLowerCase().includes(w));
}

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (isCrisis(message)) {
    return res.json({
      reply:
        "I'm really sorry you're feeling this way 🤍 Please talk to someone you trust or a helpline.",
    });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: `
You are a kind, supportive mental health companion.
Be empathetic, calm, and human-like.
Keep responses short and helpful.
            `,
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const data = await response.json();

    res.json({
      reply: data.choices[0].message.content,
    });
  } catch (err) {
    res.json({
      reply: "I'm here with you 🤍",
    });
  }
});

app.listen(3000, () => console.log("Server running"));