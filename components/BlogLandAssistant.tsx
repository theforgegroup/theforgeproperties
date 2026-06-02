import React, { useState, useEffect, useRef } from 'react';
import { useProperties } from '../context/PropertyContext';
import { Bot, X, Sparkles, Send, Phone, Mail, User, Shield, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

export const BlogLandAssistant: React.FC = () => {
  const { settings, addLead } = useProperties();
  
  // Controls configurations loaded from global context
  const aiPopupEnabled = settings.ai_popup_enabled !== false;
  const aiFloatingEnabled = settings.ai_floating_button_enabled !== false;
  const popupHeadline = settings.ai_popup_headline || 'Have Questions About Land or Property Investment?';
  const popupBody = settings.ai_popup_body || 'Our AI Land Enquiry Assistant can help answer questions about land titles, documentation, land verification, property investment, and buying real estate in Nigeria.';
  const popupCta = settings.ai_popup_cta || 'Ask The Forge AI';

  // Component UI States
  const [showPopup, setShowPopup] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showConsultForm, setShowConsultForm] = useState(false);
  const [userQuestionCount, setUserQuestionCount] = useState(0);
  const [showLeadPrompt, setShowLeadPrompt] = useState(false);
  
  // Lead form states
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadMsg, setLeadMsg] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadErr, setLeadErr] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Trigger popup after 5-10 seconds of initial load
  useEffect(() => {
    if (!aiPopupEnabled) return;
    
    // Check if popup was already shown in the current session
    const hasBeenShown = sessionStorage.getItem('forge_ai_popup_shown') === 'true';
    if (hasBeenShown) return;

    const timer = setTimeout(() => {
      setShowPopup(true);
      sessionStorage.setItem('forge_ai_popup_shown', 'true');
    }, 6000); // Trigger after 6 seconds

    return () => clearTimeout(timer);
  }, [aiPopupEnabled]);

  // Autoscroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, showLeadPrompt]);

  const handleOpenChat = () => {
    setShowPopup(false);
    setIsOpen(true);
    
    // Initialize welcome message if empty
    if (messages.length === 0) {
      setMessages([
        {
          role: 'model',
          text: "Hello! Welcome to **The Forge Properties Land Enquiry Assistant**. Specializing in Nigerian real estate acquisition, I am here to provide premium guidance on land titles, survey deeds, Governor's Consent, C of O, Excision, Gazette, and documentation. \n\nHow can I guide your real estate journey today?"
        }
      ]);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    if (!textToSend) {
      setInputText('');
    }

    // Add user message
    const updatedMessages = [...messages, { role: 'user' as const, text }];
    setMessages(updatedMessages);
    setIsTyping(true);

    let reply = "";
    let serverSuccess = false;

    // 1. Try backend POST first
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: updatedMessages.slice(0, -1) // pass previous turns
        })
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.response) {
            reply = data.response;
            serverSuccess = true;
          }
        }
      }
    } catch (backendErr) {
      console.warn("Backend chat failed, trying client fallback:", backendErr);
    }

    // 2. Client-side Fallback using @google/genai directly
    if (!serverSuccess) {
      try {
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

        const historyTurns = updatedMessages.slice(0, -1).map(turn => ({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.text }]
        }));

        historyTurns.push({
          role: 'user',
          parts: [{ text }]
        });

        const sanitizedContents = [];
        for (const turn of historyTurns) {
          if (sanitizedContents.length === 0) {
            if (turn.role === 'user') sanitizedContents.push(turn);
          } else {
            const lastTurn = sanitizedContents[sanitizedContents.length - 1];
            if (lastTurn.role !== turn.role) {
              sanitizedContents.push(turn);
            } else {
              lastTurn.parts.push(...turn.parts);
            }
          }
        }

        if (sanitizedContents.length === 0) {
          sanitizedContents.push({
            role: 'user',
            parts: [{ text }]
          });
        }

        const systemInstruction = `You are "The Forge AI Land Enquiry Assistant" — an elite real estate documentation, land titles, and property investment expert for "The Forge Properties" in Nigeria.
        
        Your goal is to provide sophisticated, authoritative, and helpful answers concerning land titles and registrations (C of O, Governor's Consent, Gazette, Excision, Deed of Assignment).
        
        Tone Guidelines:
        - Sophisticated, highly professional, warm, yet elite.
        - Respond using clear list. Markdown points look excellent.
        - Keep answers elegantly brief (typically under 110 words).`;

        const responseObj = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: sanitizedContents,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });

        reply = responseObj.text || "";
      } catch (clientErr) {
        console.error("Client fallback chat failed:", clientErr);
      }
    }

    if (reply) {
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
      
      // Trigger lead capture occasionally (every 2 user questions)
      const nextCount = userQuestionCount + 1;
      setUserQuestionCount(nextCount);
      if (nextCount > 0 && nextCount % 2 === 0) {
        setShowLeadPrompt(true);
      }
    } else {
      setMessages(prev => [...prev, { role: 'model', text: "Connection error. Our concierge brokers are live at +234 810 613 3572 to provide direct advice immediately." }]);
    }
    
    setIsTyping(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || (!leadEmail && !leadPhone)) {
      setLeadErr('Please fill out your Name and at least one contact channel (Email or Phone).');
      return;
    }

    setLeadSubmitting(true);
    setLeadErr('');

    let submittedSuccessfully = false;

    // 1. Try backend POST first
    try {
      const response = await fetch('/api/ai/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadName,
          email: leadEmail,
          phone: leadPhone,
          message: leadMsg || 'Requested professional land document verification / custom callback from Blog Assistant'
        })
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.success) {
            submittedSuccessfully = true;
          }
        }
      }
    } catch (backendErr) {
      console.warn("Backend lead submission failed, trying direct client insert:", backendErr);
    }

    // 2. Fallback to direct client-side DB insert
    if (!submittedSuccessfully) {
      try {
        const fallbackLead = {
          id: Math.random().toString(36).substring(2, 11) + '-' + Math.random().toString(36).substring(2, 11),
          name: leadName,
          email: leadEmail || '',
          phone: leadPhone || '',
          message: leadMsg || 'Requested professional land document verification / custom callback from Blog Assistant',
          date: new Date().toISOString(),
          status: 'New' as const,
          type: 'General Inquiry' as const
        };
        await addLead(fallbackLead);
        submittedSuccessfully = true;
      } catch (clientErr) {
        console.error("Direct client-side lead insert failed:", clientErr);
      }
    }

    if (submittedSuccessfully) {
      setLeadSubmitted(true);
      setTimeout(() => {
        setShowConsultForm(false);
        setLeadSubmitted(false);
        setLeadName('');
        setLeadPhone('');
        setLeadEmail('');
        setLeadMsg('');
      }, 4000);
    } else {
      setLeadErr('Submission failed. Please contact our main office directly or try via WhatsApp.');
    }
    setLeadSubmitting(false);
  };

  const suggestions = [
    "Explain Certificate of Occupancy (C of O)",
    "What is Governor's Consent?",
    "How do I verify a land title in Lagos?",
    "Excision vs Gazette in plain terms"
  ];

  // Helper to format simple markdown bolding **text** to HTML cleanly to enable visual luxury feel
  const formatMessage = (txt: string) => {
    if (!txt) return '';
    return txt
      .split('\n')
      .map(line => {
        let formattedLine = line;
        // Bold replacement **text**
        const boldRegex = /\*\*(.*?)\*\*/g;
        formattedLine = formattedLine.replace(boldRegex, '<strong class="text-forge-gold font-bold">$1</strong>');
        return formattedLine;
      })
      .join('<br />');
  };

  return (
    <div className="fixed bottom-0 right-0 z-50 pointer-events-none p-4 md:p-6 w-full max-w-lg md:max-w-xl flex flex-col items-end">
      
      {/* 1. Trigger Popup Window */}
      <AnimatePresence>
        {showPopup && aiPopupEnabled && !isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20 }}
            className="pointer-events-auto bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-2xl border border-forge-gold/30 flex flex-col gap-5 max-w-sm mb-4"
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-forge-gold/10 rounded-2xl border border-forge-gold/20 flex items-center justify-center text-forge-gold animate-bounce">
                <Bot size={24} />
              </div>
              <button 
                title="Dismiss"
                onClick={() => setShowPopup(false)} 
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-serif text-lg md:text-xl font-bold leading-tight text-forge-gold">
                {popupHeadline}
              </h4>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                {popupBody}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={handleOpenChat}
                className="flex-1 bg-forge-gold text-forge-navy font-bold uppercase tracking-widest text-[10px] md:text-xs py-3 px-4 hover:bg-white hover:text-forge-navy transition-all duration-300 rounded-xl"
              >
                {popupCta}
              </button>
              <button 
                onClick={() => setShowPopup(false)}
                className="flex-1 bg-slate-800 text-slate-300 font-bold uppercase tracking-widest text-[10px] md:text-xs py-3 px-4 hover:bg-slate-700 hover:text-white transition-all rounded-xl"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Floating AI Assistant Launch Button */}
      {aiFloatingEnabled && !isOpen && (
        <button
          onClick={handleOpenChat}
          className="pointer-events-auto flex items-center gap-2 md:gap-3 bg-forge-navy text-white hover:bg-slate-900 transition-all shadow-2xl hover:shadow-forge-gold/25 p-4 md:py-4 md:px-6 rounded-full border border-forge-gold/40 relative group group/btn focus:outline-none"
        >
          <span className="absolute -inset-1 rounded-full bg-forge-gold/10 animate-ping opacity-70 group-hover:opacity-0 transition-opacity"></span>
          <div className="text-forge-gold shrink-0">
            <Bot size={22} className="group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <span className="font-bold text-xs uppercase tracking-widest hidden md:inline">
            Ask Forge AI
          </span>
          <span className="font-bold text-[10px] uppercase tracking-widest inline md:hidden">
            AI Help
          </span>
          <Sparkles size={12} className="text-forge-gold hidden md:inline group-hover:scale-125 transition-transform" />
        </button>
      )}

      {/* 3. Main Chat Window Assistant Experience */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25 }}
            className="pointer-events-auto bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col h-[550px] max-h-[85vh] w-full relative overflow-hidden"
          >
            {/* Chat Header */}
            <div className="bg-forge-navy text-white p-5 flex justify-between items-center border-b border-forge-gold/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-forge-gold/10 rounded-xl border border-forge-gold/20 text-forge-gold">
                  <Bot size={20} />
                </div>
                <div>
                  <h4 className="font-serif text-sm md:text-base font-bold tracking-wide">
                    The Forge AI
                  </h4>
                  <p className="text-[9px] uppercase tracking-widest text-forge-gold font-bold">
                    Land Enquiry Assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowConsultForm(!showConsultForm)}
                  className="bg-forge-gold/10 hover:bg-forge-gold text-forge-gold hover:text-forge-navy transition-all px-3 py-1.5 rounded-lg border border-forge-gold/30 text-[9px] uppercase tracking-wider font-bold"
                >
                  Request Consultation
                </button>
                <button
                  title="Close chat"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Consultation Form Overlay */}
            <AnimatePresence>
              {showConsultForm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="absolute inset-[64px_0_0_0] bg-slate-900/95 backdrop-blur-sm z-20 p-6 flex flex-col text-white overflow-y-auto"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-serif text-base text-forge-gold font-bold flex items-center gap-2">
                      <Shield size={18} /> Direct Enquiry Consultation
                    </h5>
                    <button 
                      onClick={() => setShowConsultForm(false)} 
                      className="text-slate-400 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {leadSubmitted ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
                      <CheckCircle size={48} className="text-forge-gold animate-pulse" />
                      <h6 className="font-bold uppercase tracking-widest text-xs">Request Submitted!</h6>
                      <p className="text-xs text-slate-300 max-w-sm">
                        Thank you. Your land verification / consult request has been filed. A senior Forge realtor will review and follow up with you.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleLeadSubmit} className="space-y-4 flex-1">
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Submit your contact info to book a physical land tour, verification search, or direct expert callback.
                      </p>

                      {leadErr && (
                        <p className="text-red-400 text-[10px] font-bold uppercase tracking-wide bg-red-950/40 p-2 rounded-lg border border-red-500/20">
                          {leadErr}
                        </p>
                      )}

                      <div className="space-y-3">
                        <div className="relative">
                          <User size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="text"
                            required
                            placeholder="Full Name"
                            value={leadName}
                            onChange={(e) => setLeadName(e.target.value)}
                            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-xs focus:ring-1 focus:ring-forge-gold focus:outline-none"
                          />
                        </div>

                        <div className="relative">
                          <Phone size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="tel"
                            placeholder="Phone Number (WhatsApp Preferred)"
                            value={leadPhone}
                            onChange={(e) => setLeadPhone(e.target.value)}
                            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-xs focus:ring-1 focus:ring-forge-gold focus:outline-none"
                          />
                        </div>

                        <div className="relative">
                          <Mail size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="email"
                            placeholder="Email Address"
                            value={leadEmail}
                            onChange={(e) => setLeadEmail(e.target.value)}
                            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-xs focus:ring-1 focus:ring-forge-gold focus:outline-none"
                          />
                        </div>

                        <div>
                          <textarea
                            placeholder="Briefly explain your land inquiry / document verification request..."
                            rows={3}
                            value={leadMsg}
                            onChange={(e) => setLeadMsg(e.target.value)}
                            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-xs focus:ring-1 focus:ring-forge-gold focus:outline-none resize-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={leadSubmitting}
                        className="w-full bg-forge-gold text-forge-navy font-bold uppercase tracking-widest text-xs py-4 rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {leadSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit Request'}
                      </button>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Message Box Container */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 bg-slate-50">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-3xl p-4 text-xs leading-relaxed font-medium md:text-sm shadow-sm ${
                    m.role === 'user'
                      ? 'bg-forge-navy text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                  }`}>
                    {m.role === 'model' ? (
                      <div 
                        className="prose-chat prose-sm text-slate-700 max-w-none"
                        dangerouslySetInnerHTML={{ __html: formatMessage(m.text) }}
                      />
                    ) : (
                      m.text
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 rounded-3xl p-4 rounded-tl-none shadow-sm flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-forge-gold" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Assistant is reviewing details...</span>
                  </div>
                </div>
              )}

              {/* Suggestions Chips (render when user has zero or only приветствие message and is not loading) */}
              {!isTyping && messages.length <= 2 && (
                <div className="pt-2 space-y-2">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">Suggested Land Topics:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(s)}
                        className="bg-white hover:bg-forge-gold hover:text-forge-navy transition-all px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200/60 shadow-sm text-left"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Natural Lead capture card triggered occasionally */}
              {!isTyping && showLeadPrompt && (
                <div className="bg-gradient-to-br from-slate-900 to-forge-navy text-white rounded-3xl p-5 border border-forge-gold/30 space-y-4 shadow-lg animate-fade-in relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 bg-forge-gold/5 rounded-full filter blur-xl"></div>
                  <div className="flex gap-3 items-start relative z-10">
                    <div className="p-2 bg-forge-gold/10 rounded-2xl text-forge-gold shrink-0 mt-0.5">
                      <Sparkles size={16} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-forge-gold">Premium Support</p>
                      <p className="text-xs md:text-sm font-semibold leading-relaxed text-slate-100">
                        Would you like a member of The Forge Properties team to help you further?
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 relative z-10">
                    <button
                      type="button"
                      onClick={() => {
                        setShowConsultForm(true);
                        setLeadMsg("Requested direct callback from a professional property specialist after chatting with Forge AI on the Blog.");
                        setShowLeadPrompt(false);
                      }}
                      className="w-full bg-forge-gold hover:bg-white text-forge-navy font-bold uppercase tracking-widest text-[9px] md:text-[10px] py-3.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      📞 Request a Call
                    </button>
                    
                    <a
                      href={`https://wa.me/2348106133572?text=${encodeURIComponent("Hello The Forge Properties, I am enquiring from your blog regarding Nigerian land titles/property investments.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        setShowLeadPrompt(false);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest text-[9px] md:text-[10px] py-3.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm text-center"
                    >
                      💬 Chat on WhatsApp
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setShowLeadPrompt(false);
                      }}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase tracking-widest text-[9px] md:text-[10px] py-3 px-4 rounded-xl transition-all duration-300 cursor-pointer"
                    >
                      Continue Asking AI
                    </button>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Footer Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-4 bg-white border-t border-slate-100 flex gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about Nigeria land titles, C of O, Gazette..."
                className="flex-grow bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs md:text-sm focus:border-forge-gold focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="bg-forge-navy hover:bg-forge-gold text-white hover:text-forge-navy transition-all p-3 rounded-xl flex items-center justify-center disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
