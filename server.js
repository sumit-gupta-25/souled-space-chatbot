import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = "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";

function isCrisis(text) {
  const words = ["suicide", "kill myself", "die"];
  return words.some(w => text.toLowerCase().includes(w));
}

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (isCrisis(message)) {
    return res.json({
      reply:
        "I'm really sorry you're feeling this way. Please reach out to someone you trust or a helpline.",
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
        model: "mistralai/mistral-7b-instruct:free",

        messages: [
          {
            role: "system",
            content: `
You are a warm, supportive best friend.
You listen and respond with empathy.
Keep responses short and human-like.
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

    console.log("FULL RESPONSE:", JSON.stringify(data, null, 2));

    const aiReply = data?.choices?.[0]?.message?.content;

    if (!aiReply) {
      return res.json({
        reply: "AI is not responding properly",
      });
    }

    res.json({
      reply: aiReply,
    });

  } catch (err) {
    console.error("ERROR:", err);

    res.json({
      reply: "Backend error occurred",
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));