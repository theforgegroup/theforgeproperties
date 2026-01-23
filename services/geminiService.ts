import { GoogleGenAI } from "@google/genai";
import { Property } from "../types";

/**
 * The Brain: RAG Implementation for The Forge AI Concierge.
 * Hardened for environment-specific constraints.
 */
export const getChatResponse = async (userMessage: string, inventory: Property[]): Promise<string> => {
  // Access key safely to avoid throwing before try-catch
  const apiKey = (process.env.API_KEY || "").trim();

  if (!apiKey) {
    console.error("The Forge AI: API Key is missing from process.env. If you are seeing this on GitHub Pages, ensure your environment secrets are correctly injected into the bundle.");
  }

  try {
    // Always use new GoogleGenAI instance for each request as per security guidelines
    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Prepare slim context to minimize token usage and stay within context limits
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

    // Execute generation with recommended settings
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userMessage, // Using simple string format for max compatibility
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      }
    });

    // Access the .text property directly
    const textOutput = result.text;
    
    if (textOutput && textOutput.trim().length > 0) {
      return textOutput.trim();
    }

    throw new Error("EMPTY_OR_INVALID_SDK_RESPONSE");

  } catch (error: any) {
    // Internal debugging log - useful for troubleshooting production failures
    console.error("The Forge AI Production Error Log:", {
      message: error.message,
      status: error.status,
      cause: error.cause,
      stack: error.stack
    });
    
    // Exact brand-standard fallback message
    return "I am currently experiencing a high volume of inquiries regarding our exclusive residences. Please contact our main office directly for immediate assistance or to receive a curated PDF of our current off-market portfolio.\n\nWhatsApp/Call: +234 810 613 3572\nEmail: theforgeproperties@gmail.com";
  }
};