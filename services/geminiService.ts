import { GoogleGenAI } from "@google/genai";
import { Property } from "../types";

/**
 * The Brain: RAG Implementation for The Forge AI Concierge
 * This service handles the connection to the Gemini API.
 */
export const getChatResponse = async (userMessage: string, inventory: Property[]): Promise<string> => {
  try {
    // 1. Initialize the Google GenAI client
    // Ensure process.env.API_KEY is defined in your environment variables
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 2. Prepare inventory context (limited to 10 most relevant to stay within token limits)
    const inventoryContext = inventory.slice(0, 10).map(p => ({
      title: p.title,
      location: p.location,
      price: `₦${p.price.toLocaleString()}`,
      type: p.type,
      status: p.status
    }));

    // 3. Define the System Instruction
    const systemInstruction = `
      You are 'The Forge AI', the sophisticated virtual concierge for 'The Forge Properties' (Nigeria).
      
      CURRENT INVENTORY:
      ${JSON.stringify(inventoryContext)}

      YOUR PERSONA:
      - Tone: Professional, elegant, and helpful.
      - Objective: Assist clients in identifying luxury properties from our portfolio.
      
      RULES:
      1. Use the provided inventory to answer questions about specific properties.
      2. Format prices as text (e.g., "Two Billion Naira").
      3. If no match is found, refer them to our Senior Brokers for off-market options.
      4. Keep responses refined and under 80 words.
    `;

    // 4. Generate Content
    // Using the simplified string format for 'contents' as per best practices for text-only tasks.
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
    if (!response || !response.text) {
      throw new Error("Empty response from AI service.");
    }

    return response.text;
  } catch (error) {
    console.error("The Forge AI Concierge Error:", error);
    
    // Fallback message with contact details as requested
    return "I am currently experiencing a high volume of inquiries. Please try again in a moment or contact our office directly for immediate assistance with our exclusive portfolio.\n\nContact: Whatsapp/call +234 810 613 3572 | Email: theforgeproperties@gmail.com";
  }
};