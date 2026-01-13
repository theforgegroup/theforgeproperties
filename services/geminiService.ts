import { GoogleGenAI } from "@google/genai";
import { Property } from "../types";

/**
 * The Brain: RAG Implementation for The Forge AI Concierge
 */
export const getChatResponse = async (userMessage: string, inventory: Property[]): Promise<string> => {
  try {
    // 1. Initialize the Google GenAI client
    // Guidelines: Always use new GoogleGenAI({ apiKey: process.env.API_KEY })
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 2. Prepare limited inventory context to optimize token usage and accuracy
    const inventoryContext = inventory.slice(0, 15).map(p => ({
      title: p.title,
      location: p.location,
      price: `₦${p.price.toLocaleString()}`,
      type: p.type,
      status: p.status,
      features: p.features ? p.features.slice(0, 3) : []
    }));

    // 3. Define the System Instruction
    const systemInstruction = `
      You are 'The Forge AI', the sophisticated virtual concierge for 'The Forge Properties' (a division of The Forge Group, Nigeria).
      
      CURRENT INVENTORY DATA:
      ${JSON.stringify(inventoryContext)}

      YOUR PERSONA:
      - Tone: Professional, elegant, and highly helpful.
      - Objective: Assist clients in identifying luxury properties from our portfolio.
      
      RULES:
      1. ONLY recommend properties listed in the provided 'CURRENT INVENTORY DATA'.
      2. If a user asks for a specific location (e.g. Abuja, Ikoyi) or property type, filter based on the data.
      3. Format prices in readable text (e.g. "Two Billion Naira" instead of "2,000,000,000").
      4. If no exact match exists, explain that our "Exclusive Off-Market Portfolio" likely contains a match and invite them to contact our Senior Brokers.
      5. Keep responses concise (under 80 words) and refined.
    `;

    // 4. Generate Content
    // Guidelines: Use 'gemini-3-flash-preview' for basic text tasks.
    // We pass userMessage as a simple string for maximum robustness.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      }
    });

    // 5. Extract and Return Response
    // Guidelines: Access .text property directly.
    if (!response || !response.text) {
      throw new Error("Empty response from AI");
    }

    return response.text;
  } catch (error) {
    console.error("The Forge AI Concierge Error:", error);
    // Graceful fallback for the UI
    return "I am currently experiencing a high volume of inquiries. Please try again in a moment or contact our office directly for immediate assistance with our exclusive portfolio.";
  }
};