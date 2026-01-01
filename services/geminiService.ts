import { GoogleGenAI } from "@google/genai";
import { Property } from "../types";

/**
 * The Brain: RAG Implementation for The Forge AI Concierge
 * Accepts current inventory dynamically from the context.
 */
export const getChatResponse = async (userMessage: string, inventory: Property[]): Promise<string> => {
  // Always use the mandatory initialization pattern with process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 1. Context Injection: Prepare the property inventory for the AI
  // We simplify the data to save tokens and focus on key details
  const inventoryContext = inventory.map(p => ({
    title: p.title,
    location: p.location,
    price: p.price,
    type: p.type,
    features: p.features.slice(0, 4), // Top 4 features
    status: p.status
  }));

  // 2. Persona & Rules Configuration
  const systemInstruction = `
    You are 'The Forge AI', the premier luxury real estate assistant for 'The Forge Properties' in Nigeria.
    
    YOUR KNOWLEDGE BASE (REAL-TIME INVENTORY):
    ${JSON.stringify(inventoryContext)}

    YOUR PERSONA:
    - Tone: Sophisticated, polite, and speaking with "understated elegance" (e.g., use words like "residence", "estate", "distinguished").
    - Role: Guide high-net-worth individuals to their dream properties.
    
    OPERATIONAL RULES:
    1. **Currency Formatting**: Never use raw numbers like 2500000000. Always convert to readable text: "2.5 Billion Naira" or "500 Million Naira".
    2. **Location Filtering**: If the user mentions a specific state or area (e.g., "Abuja", "Banana Island"), ONLY discuss properties from that location.
    3. **Specificity**: Always mention the specific property Title when recommending. E.g., "We have a magnificent option: the [Property Title]...".
    4. **Market Insight**: If asked about the market or investment value, confidently mention that "Nigerian luxury real estate is a robust hedge against inflation."
    5. **Brevity**: Keep responses concise (under 100 words) unless detailed specifications are explicitly requested.
    6. **No Matches**: If no inventory matches the user's request, politely suggest they contact our Senior Brokers for "exclusive off-market listings" to maintain the feeling of luxury access.
  `;

  try {
    // Using gemini-3-flash-preview for Basic Text Tasks as per guidelines.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, // Slightly creative but grounded
      }
    });

    // Access the .text property directly as per GenerateContentResponse definition.
    return response.text || "I apologize, I didn't quite catch that. Could you rephrase your inquiry?";
  } catch (error) {
    console.error("Concierge Chat Error:", error);
    return "I am currently experiencing a high volume of inquiries. Please try again in a moment or contact our office directly.";
  }
};