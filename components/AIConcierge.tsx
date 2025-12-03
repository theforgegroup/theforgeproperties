import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot } from 'lucide-react';
import { getChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { useProperties } from '../context/PropertyContext';

export const AIConcierge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Welcome to The Forge. I am your personal AI assistant. How may I assist you in finding your exceptional residence today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get real-time properties from context
  const { properties } = useProperties();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Pass the current property list to the AI
      const responseText = await getChatResponse(userMsg.text, properties);
      const aiMsg: ChatMessage = { role: 'model', text: responseText };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "I apologize, but I am unable to connect to the server at this moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center font-serif font-bold tracking-widest ${
          isOpen 
            ? 'bg-forge-dark text-forge-gold w-14 h-14 rounded-full rotate-90' 
            : 'bg-forge-navy text-forge-gold px-6 py-4 rounded-full border border-forge-gold/30 shadow-forge-navy/50 gap-3'
        }`}
        aria-label="Open The Forge AI"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <>
            <Sparkles size={20} className="animate-pulse" />
            <span className="whitespace-nowrap text-xs md:text-sm">THE FORGE AI</span>
          </>
        )}
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-24 right-6 w-[90vw] md:w-96 bg-slate-900 rounded-2xl shadow-2xl border border-forge-navy/50 z-50 flex flex-col transition-all duration-300 transform origin-bottom-right overflow-hidden ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
        style={{ height: '550px', maxHeight: '75vh' }}
      >
        {/* Header */}
        <div className="bg-forge-dark p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-forge-gold/10 p-2 rounded-lg">
              <Bot size={20} className="text-forge-gold" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-white tracking-wider text-sm">THE FORGE AI</h3>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900 to-slate-950">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] p-4 text-sm leading-relaxed rounded-2xl shadow-lg backdrop-blur-sm ${
                  msg.role === 'user' 
                    ? 'bg-forge-gold text-forge-navy font-medium rounded-br-none' 
                    : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800/80 border border-slate-700/50 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1">
                <span className="w-1.5 h-1.5 bg-forge-gold rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-forge-gold rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-forge-gold rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 bg-forge-dark border-t border-slate-800">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about properties..."
              className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-full px-5 py-3 text-sm focus:outline-none focus:border-forge-gold focus:ring-1 focus:ring-forge-gold transition-all placeholder-slate-500"
            />
            <button 
              type="submit" 
              disabled={isLoading || !inputText.trim()}
              className="bg-forge-gold text-forge-navy p-3 rounded-full hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-forge-gold/20"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
