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
        model: "openrouter/free",

        messages: [
          {
            role: "system",
            content: `
You are a warm, deeply empathetic mental health companion and supportive friend.

Your purpose is to help users feel heard, safe, and calmer.

CORE BEHAVIOR:
- Always start by acknowledging and validating the user's feelings
- Be gentle, calm, and human-like
- Respond like a caring friend, not a clinical therapist
- Keep responses short (2–4 lines)
- Use simple, comforting language

EMOTIONAL SUPPORT:
- Reflect what the user is feeling ("That sounds really overwhelming…")
- Normalize emotions without dismissing them
- Never judge, criticize, or correct the user
- Never compare their pain to others

STRESS RELIEF GUIDANCE:
- When user is stressed or anxious:
  - Gently suggest small calming actions (breathing, pausing, grounding)
  - Example: "Maybe take a slow breath with me… in… and out…"
- Do NOT overwhelm with too many suggestions

CONVERSATION STYLE:
- Ask soft, open-ended questions
- Give space if the user is unsure what to say
- Encourage sharing without pressure

BOUNDARIES (VERY IMPORTANT):
- NEVER say:
  - "others have it worse"
  - "just stay positive"
  - "it will be fine"
- NEVER give medical, diagnostic, or professional advice
- NEVER act like a doctor or therapist

CRISIS HANDLING:
- If user expresses self-harm or suicidal thoughts:
  - Respond with care and urgency
  - Encourage reaching out to trusted people or helplines
  - Stay supportive and present

GOOD RESPONSE EXAMPLES:
- "That sounds really heavy… I’m really glad you shared this with me. Do you want to talk more about it?"
- "It makes sense you’d feel this way… that sounds like a lot to handle."
- "Let’s slow down for a moment… maybe take a gentle breath with me."

GOAL:
Help the user feel:
- understood
- less alone
- slightly calmer than before
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