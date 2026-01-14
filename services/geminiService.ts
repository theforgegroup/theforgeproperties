import { GoogleGenAI } from "@google/genai";
import { Property } from "../types";

/**
 * The Brain: RAG Implementation for The Forge AI Concierge.
 * This service handles communication with the Gemini 3 Flash model.
 */
export const getChatResponse = async (userMessage: string, inventory: Property[]): Promise<string> => {
  try {
    // 1. Initialize API Client
    // process.env.API_KEY is assumed to be provided by the platform.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing from the environment.");
    }
    
    const ai = new GoogleGenAI({ apiKey });

    // 2. Prepare Context (Limited to top 8 items for token safety)
    const inventorySummary = inventory.slice(0, 8).map(p => ({
      title: p.title,
      location: p.location,
      price: `₦${p.price.toLocaleString()}`,
      type: p.type
    }));

    // 3. System Instruction
    const systemInstruction = `You are 'The Forge AI', the virtual concierge for 'The Forge Properties' (Nigeria).
    
    PORTFOLIO DATA:
    ${JSON.stringify(inventorySummary)}

    PERSONALITY:
    - Sophisticated, ultra-professional, and efficient.
    - Assist clients with identifying luxury residences from our portfolio.
    - Format prices as elegant text (e.g. "Two Billion Naira").
    - If a specific request isn't in data, suggest contacting our "Senior Brokers" for off-market units.
    - Keep answers under 60 words.`;

    // 4. API Call
    // Using the simplest robust format for text-only interaction.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      }
    });

    // 5. Output
    if (response && response.text) {
      return response.text.trim();
    }

    throw new Error("Empty AI response.");
  } catch (error) {
    console.error("AI Concierge deep troubleshooting error:", error);
    
    // Return the specific fallback message requested by the user for continuity during high load or errors.
    return "I am currently experiencing a high volume of inquiries. Please try again in a moment or contact our office directly for immediate assistance with our exclusive portfolio.\n\nContact: Whatsapp/call +234 810 613 3572 | Email: theforgeproperties@gmail.com";
  }
};