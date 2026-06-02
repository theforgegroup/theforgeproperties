import { ChatMessage } from "../types";

/**
 * The Forge AI Concierge Service
 * Proxies calls to the secure backend `/api/ai/concierge` to perform chat generations.
 */
export const getChatResponse = async (userMessage: string, history: ChatMessage[] = []): Promise<string> => {
  try {
    const response = await fetch('/api/ai/concierge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        history: history
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response || "Our concierge brokers are live at +234 810 613 3572 to provide direct advice immediately.";

  } catch (error) {
    console.error("The Forge AI Error:", error);
    return "Our concierge brokers are live at +234 810 613 3572 to provide direct advice immediately.";
  }
};