import { GoogleGenAI } from "@google/genai";
import { Property } from "../types";

/**
 * The Forge AI Concierge Service
 * Manages real-time interactions with the Gemini Pro model.
 */
export const getChatResponse = async (userMessage: string, inventory: Property[]): Promise<string> => {
  // Ensure the key exists and is not just a placeholder
  const apiKey = (process.env.API_KEY || "").trim();

  if (!apiKey || apiKey === "undefined") {
    console.error("The Forge AI: API_KEY is missing from the environment.");
    return "I am currently undergoing scheduled maintenance. Please contact our office directly at theforgeproperties@gmail.com for immediate assistance.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Prepare slim property context for RAG
    const context = inventory.slice(0, 8).map(p => ({
      name: p.title,
      loc: p.location,
      price: `₦${p.price.toLocaleString()}`,
      type: p.type
    }));

    const systemInstruction = `You are 'The Forge AI', the elite digital concierge for 'The Forge Properties' Nigeria. 
    Tone: Sophisticated, helpful, and exclusive.
    Context: ${JSON.stringify(context)}. 
    
    Response Rules:
    - If a matching property exists in context, highlight it.
    - If no match, refer them to theforgeproperties@gmail.com.
    - Keep responses under 60 words.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: userMessage }] }],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "I'm here to help. Could you please rephrase your request?";

  } catch (error: any) {
    console.error("The Forge AI Error:", error);
    return "Our concierge service is currently at capacity. Please reach out to our senior brokers at +234 810 613 3572 for immediate personalized service.";
  }
};