import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Initialize the Google Gen AI client with the requested model api
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ message: "No messages provided" }, { status: 400 });
    }

    const latestMessage = messages[messages.length - 1].content;

    // Use standard genai SDK logic for text generation
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are a professional travel agent assistant for 'Pak Karwan E Bilal Travel & Tours'. Answer questions politely, suggesting travel packages such as Mecca tours, Dubai luxury escapades, and Istanbul trips. Keep your answers brief and helpful. User Question: ${latestMessage}`,
            },
          ],
        },
      ],
    });

    return NextResponse.json({ reply: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ message: "Error communicating with AI" }, { status: 500 });
  }
}
