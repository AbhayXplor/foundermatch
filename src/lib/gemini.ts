import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
if (!apiKey) {
    console.warn("Missing GEMINI_API_KEY");
}
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});

export async function analyzeCompatibility(user1: any, user2: any) {
    const prompt = `
    Analyze the compatibility between these two potential co-founders:

    User 1:
    Role: ${user1.role}
    Skills: ${user1.skills.join(", ")}
    Commitment: ${user1.commitment}
    Equity Expectations: ${user1.equity}
    Bio: ${user1.bio}

    User 2:
    Role: ${user2.role}
    Skills: ${user2.skills.join(", ")}
    Commitment: ${user2.commitment}
    Equity Expectations: ${user2.equity}
    Bio: ${user2.bio}

    Provide a JSON response with:
    1. "score": A compatibility score from 0 to 100.
    2. "summary": A brief summary (3-4 bullet points) of strengths and potential concerns.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Clean up markdown code blocks if present
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error analyzing compatibility:", error);
        return { score: 0, summary: ["Error analyzing compatibility."] }
    }
}

export async function generateIcebreaker(user1: any, user2: any) {
    const prompt = `
    Generate a short, friendly, and professional icebreaker message from User 2 to User 1.
    
    User 1 (Recipient):
    Role: ${user1.role}
    Bio: ${user1.bio}
    Skills: ${user1.skills.join(", ")}

    User 2 (Sender):
    Role: ${user2.role}
    Bio: ${user2.bio}
    Skills: ${user2.skills.join(", ")}

    The message should mention a shared interest or complementary skill. Keep it under 2 sentences.
    Just return the message text, no quotes.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Error generating icebreaker:", error);
        return "Hi! I think we'd be a great team. Let's chat!";
    }
}
