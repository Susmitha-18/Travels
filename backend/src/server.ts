import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY as string;

// simple demo limit
const userCount: Record<string, number> = {};

const travelKeywords = [
  "travel", "trip", "flight", "hotel", "tour",
  "destination", "visa", "booking", "airport", "goa"
];

function isTravelRelated(text: string): boolean {
  return travelKeywords.some(word =>
    text.toLowerCase().includes(word)
  );
}

app.post("/chat", async (req: Request, res: Response) => {
  const { userId, message } = req.body as {
    userId: string;
    message: string;
  };

  userCount[userId] = userCount[userId] || 0;

  // if (userCount[userId] >= 5) {
  //   return res.json({ reply: "Demo limit reached ✈️" });
  // }

  // if (!isTravelRelated(message)) {
  //   return res.json({ reply: "Please ask travel-related questions 🌍" });
  // }

  userCount[userId]++;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "You are a helpful travel assistant. Provide concise and friendly travel advice." },
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      }
    );

    const data = await response.json();
    console.log("Groq raw response:", JSON.stringify(data, null, 2));

    // Handle Groq rate limit or error
    if (data && data.error) {
      const errorMsg = typeof data.error === "string" ? data.error : data.error.message || "Unknown error";
      if (errorMsg.includes("Rate limit") || errorMsg.includes("Too many requests")) {
        return res.json({ reply: "AI usage limit reached. Please try again later." });
      }
      return res.json({ reply: `AI error: ${errorMsg}` });
    }

    let reply = "AI did not return a response.";
    if (data && data.choices && data.choices[0] && data.choices[0].message) {
      reply = data.choices[0].message.content;
    }
    return res.json({ reply });
  } catch (error) {
    console.error("Groq API error:", error);
    return res.json({ reply: "AI service temporarily unavailable." });
  }
});

app.listen(5001, () => {
  console.log("✅ Backend running on http://localhost:5001 (Groq AI)");
});
