import { GoogleGenAI } from "@google/genai";
import { Property } from "../types";

/**
 * The Brain: RAG Implementation for The Forge AI Concierge.
 * This service manages the connection to the Gemini API with enhanced error resilience.
 */
export const getChatResponse = async (userMessage: string, inventory: Property[]): Promise<string> => {
  try {
    // 1. Initialize API Client
    // We rely on the platform-injected process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 2. Prepare Context (Limited to 6 items to stay well within token safety margins)
    const inventorySummary = inventory.slice(0, 6).map(p => ({
      title: p.title,
      location: p.location,
      price: `₦${p.price.toLocaleString()}`,
      type: p.type
    }));

    // 3. System Instruction - Persona and Rules
    const systemInstruction = `You are 'The Forge AI', the sophisticated virtual concierge for 'The Forge Properties' (Nigeria).
    
    CURRENT LISTINGS:
    ${JSON.stringify(inventorySummary)}

    PERSONA:
    - Tone: Elegant, professional, and helpful.
    - Assist clients in finding residences from the listings above.
    - Format prices as Naira text (e.g. "One Billion Naira").
    - If a specific match isn't found, invite them to speak with our Senior Brokers for exclusive off-market options.
    - Keep responses concise (under 60 words).`;

    // 4. API Call
    // Using gemini-flash-latest for production stability and array-based contents for robustness.
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      }
    });

    // 5. Extract and Clean Output
    if (response && response.text) {
      return response.text.trim();
    }

    throw new Error("Invalid or empty response from the AI Concierge service.");
  } catch (error) {
    console.error("The Forge AI Concierge Troubleshooting Log:", error);
    
    // Fallback message with contact details as strictly requested by the user.
    return "I am currently experiencing a high volume of inquiries. Please try again in a moment or contact our office directly for immediate assistance with our exclusive portfolio.\n\nContact: Whatsapp/call +234 810 613 3572 | Email: theforgeproperties@gmail.com";
  }
};