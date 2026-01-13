import { GoogleGenAI } from "@google/genai";
import { Property } from "../types";

/**
 * The Brain: RAG Implementation for The Forge AI Concierge
 * This service handles the connection to the Gemini API.
 */
export const getChatResponse = async (userMessage: string, inventory: Property[]): Promise<string> => {
  try {
    // 1. Initialize the Google GenAI client
    // Always use the standard initialization pattern as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 2. Prepare inventory context (limited to 10 for performance)
    const inventoryContext = inventory.slice(0, 10).map(p => ({
      title: p.title,
      location: p.location,
      price: `₦${p.price.toLocaleString()}`,
      type: p.type,
      status: p.status
    }));

    // 3. Define the System Instruction
    const systemInstruction = `
      You are 'The Forge AI', the virtual concierge for 'The Forge Properties' (Nigeria).
      
      INVENTORY:
      ${JSON.stringify(inventoryContext)}

      PERSONA:
      - Tone: Sophisticated, professional, and elegant.
      - Objective: Assist clients with our luxury real estate portfolio.
      
      RULES:
      1. ONLY recommend properties from the provided INVENTORY.
      2. Format prices as text (e.g., "Two Billion Naira").
      3. If no match is found, refer to our "Senior Brokers" for off-market listings.
      4. Keep responses concise and refined.
    `;

    // 4. Generate Content
    // Using the recommended model and strictly structured contents array for maximum reliability.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      }
    });

    // 5. Extract and Return Response
    // Always access the .text property directly
    if (response && response.text) {
      return response.text;
    }

    throw new Error("Invalid response format from AI service.");
  } catch (error) {
    console.error("The Forge AI Concierge Error:", error);
    
    // Return the fallback message with contact details as requested by the user
    return "I am currently experiencing a high volume of inquiries. Please try again in a moment or contact our office directly for immediate assistance with our exclusive portfolio.\n\nContact: Whatsapp/call +234 810 613 3572 | Email: theforgeproperties@gmail.com";
  }
};