import { GoogleGenAI } from "@google/genai";
import { Property } from "../types";

/**
 * The Brain: RAG Implementation for The Forge AI Concierge.
 * Hardened for environment-specific constraints.
 */
export const getChatResponse = async (userMessage: string, inventory: Property[]): Promise<string> => {
  try {
    // Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
    // Assume process.env.API_KEY is pre-configured and valid.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    // Prepare ultra-slim context to minimize potential parsing/token errors
    const context = inventory.slice(0, 5).map(p => ({
      name: p.title,
      loc: p.location,
      price: `₦${p.price.toLocaleString()}`
    }));

    const systemInstruction = `You are 'The Forge AI', a luxury real estate concierge for 'The Forge Properties' (Nigeria). 
    Your tone is sophisticated and elite.
    Available Portfolio: ${JSON.stringify(context)}. 
    If you cannot find a match, invite them to contact our 'Senior Brokers' at theforgeproperties@gmail.com.
    Keep answers under 40 words.`;

    // Request generation using ai.models.generateContent
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.6,
        topP: 0.9,
      }
    });

    // Access the .text property directly as per SDK guidelines
    const textOutput = result.text;
    if (textOutput) {
      return textOutput.trim();
    }

    console.warn("The Forge AI: Received empty text output from model.");
    throw new Error("EMPTY_AI_RESPONSE");

  } catch (error: any) {
    // Deep log for debugging (only visible in dev console)
    console.error("The Forge AI Troubleshoot Log:", error);
    
    // Exact brand-standard fallback message
    return "I am currently experiencing a high volume of inquiries. Please try again in a moment or contact our office directly for immediate assistance with our exclusive portfolio.\n\nContact: Whatsapp/call +234 810 613 3572 | Email: theforgeproperties@gmail.com";
  }
};