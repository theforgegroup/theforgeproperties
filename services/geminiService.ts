import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

/**
 * The Forge AI Concierge Service
 * Proxies calls to the secure backend `/api/ai/concierge` to perform chat generations.
 * Falls back to client-side direct generation if backend proxy is unreachable (e.g. static hosting on Vercel).
 */
export const getChatResponse = async (userMessage: string, history: ChatMessage[] = []): Promise<string> => {
  // 1. Try Backend API first
  try {
    const response = await fetch('/api/ai/concierge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        history: history
      })
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.response) {
          return data.response;
        }
      }
    }
  } catch (backendError) {
    console.warn("Backend concierge proxy failed, falling back to client-side AI:", backendError);
  }

  // 2. Client-side Fallback
  try {
    // Read key from all possible client-side places
    const apiKey = (
      (typeof process !== 'undefined' && process?.env?.GEMINI_API_KEY) ||
      (typeof process !== 'undefined' && process?.env?.API_KEY) ||
      import.meta.env.VITE_GEMINI_API_KEY ||
      import.meta.env.VITE_API_KEY ||
      ""
    ).trim();

    if (!apiKey || apiKey === "undefined") {
      throw new Error("No Gemini API key available on client side.");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format local history for Gemini
    const sanitizedContents = history.map(turn => ({
      role: turn.role === 'user' ? 'user' : 'model',
      parts: [{ text: turn.text }]
    }));

    sanitizedContents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    // Ensure we satisfy Gemini's strictly alternating roles starting with user
    const finalContents = [];
    for (const turn of sanitizedContents) {
      if (finalContents.length === 0) {
        if (turn.role === 'user') finalContents.push(turn);
      } else {
        const lastTurn = finalContents[finalContents.length - 1];
        if (lastTurn.role !== turn.role) {
          finalContents.push(turn);
        } else {
          lastTurn.parts.push(...turn.parts);
        }
      }
    }

    if (finalContents.length === 0) {
      finalContents.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });
    }

    const systemInstruction = `You are 'The Forge AI', the elite digital concierge for 'The Forge Properties' Nigeria.
    Your goal is to provide sophisticated, helpful, and exclusive service. Assist clients with searching for luxury real estate, land acquisitions, and premium homes.
    Tone: Sophisticated, highly professional, elite, and exclusive.
    Keep answers elegant, warm, and concise (under 75 words).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: finalContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "I'm here to support your real estate questions. Could you please rephrase?";
  } catch (error) {
    console.error("The Forge client-side AI Error in Concierge:", error);
    return "Our concierge brokers are live at +234 810 613 3572 to provide direct advice immediately.";
  }
};