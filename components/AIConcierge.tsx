import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot } from 'lucide-react';
import { getChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

export const AIConcierge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Welcome to The Forge Properties. I am The Forge AI, your elite concierge. We currently feature exclusive listings, including ₦750M villas in Lekki Phase 1 and ₦220M homes in Lekki Palm City. How may I assist your search today? For bespoke inquiries, please reach us at theforgeproperties@gmail.com. +234 810 613 3572' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
      // Pass the current conversation history to the AI
      const responseText = await getChatResponse(userMsg.text, messages);
      const aiMsg: ChatMessage = { role: 'model', text: responseText };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
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
        className={`fixed bottom-6 right-6 z-50 shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center font-bold tracking-widest ${
          isOpen 
            ? 'bg-[#0F172A] text-white w-14 h-14 rounded-full rotate-90' 
            : 'bg-[#0F172A] text-white px-6 py-4 rounded-full border border-[#774DFF]/40 shadow-xl gap-3'
        }`}
        aria-label="Open The Forge AI"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <>
            <Sparkles size={20} className="animate-pulse text-[#774DFF]" />
            <span className="whitespace-nowrap text-xs md:text-sm text-white">THE FORGE AI</span>
          </>
        )}
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-24 right-6 w-[90vw] md:w-96 bg-[#0F172A] rounded-2xl shadow-2xl border border-[#774DFF]/30 z-50 flex flex-col transition-all duration-300 transform origin-bottom-right overflow-hidden ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
        style={{ height: '550px', maxHeight: '75vh' }}
      >
        {/* Header */}
        <div className="bg-[#0F172A] p-5 flex items-center justify-between border-b border-[#774DFF]/30">
          <div className="flex items-center gap-3">
            <div className="bg-[#774DFF]/15 p-2 rounded-lg border border-[#774DFF]/30">
              <Bot size={20} className="text-[#774DFF]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white tracking-wider text-sm">THE FORGE AI</h3>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] p-4 text-sm leading-relaxed rounded-2xl shadow-lg backdrop-blur-sm ${
                  msg.role === 'user' 
                    ? 'bg-[#774DFF] text-white font-medium rounded-br-none' 
                    : 'bg-[#1E293B] text-slate-200 border border-slate-700/50 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#1E293B] border border-slate-700/50 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#774DFF] rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-[#774DFF] rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-[#774DFF] rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 bg-[#0F172A] border-t border-slate-800">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about properties..."
              className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-full px-5 py-3 text-sm focus:outline-none focus:border-[#774DFF] focus:ring-1 focus:ring-[#774DFF] transition-all placeholder-slate-500"
            />
            <button 
              type="submit" 
              disabled={isLoading || !inputText.trim()}
              className="bg-[#774DFF] text-white p-3 rounded-full hover:bg-[#683de6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#774DFF]/20"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};