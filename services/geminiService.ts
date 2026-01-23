import { GoogleGenAI } from "@google/genai";
import { Property } from "../types";

/**
 * The Brain: RAG Implementation for The Forge AI Concierge.
 * Refined for deployment environment compatibility.
 */
export const getChatResponse = async (userMessage: string, inventory: Property[]): Promise<string> => {
  const apiKey = (process.env.API_KEY || "").trim();

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Prepare slim context
    const context = inventory.slice(0, 10).map(p => ({
      name: p.title,
      loc: p.location,
      price: `₦${p.price.toLocaleString()}`,
      type: p.type
    }));

    const systemInstruction = `You are 'The Forge AI', a luxury real estate concierge for 'The Forge Properties' (Nigeria). 
    Your tone is sophisticated, professional, and elite.
    Available Portfolio Context: ${JSON.stringify(context)}. 
    
    Guidelines:
    1. If the user asks for properties, match their criteria with the portfolio.
    2. If no matching property is found, invite them to contact our 'Senior Brokers' at theforgeproperties@gmail.com.
    3. Be extremely helpful but remain concise (under 50 words).
    4. Focus on luxury and excellence.`;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: userMessage }] }],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      }
    });

    const textOutput = result.text;
    
    if (textOutput && textOutput.trim().length > 0) {
      return textOutput.trim();
    }

    throw new Error("EMPTY_RESPONSE");

  } catch (error: any) {
    console.error("The Forge AI Deployment Error:", error);
    
    // Return branded fallback message
    return "I am currently experiencing a high volume of inquiries. Please try again in a moment or contact our office directly for immediate assistance with our exclusive portfolio.\n\nWhatsApp/Call: +234 810 613 3572\nEmail: theforgeproperties@gmail.com";
  }
};