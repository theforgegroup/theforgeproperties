import React, { useState, useEffect } from 'react';
import { X, Mail, CheckCircle2 } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';

export const NewsletterModal: React.FC = () => {
  const { addSubscriber } = useProperties();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if dismissed before
    const dismissed = sessionStorage.getItem('forge_newsletter_dismissed');
    if (dismissed) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 30000); // 30 seconds per specification

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('forge_newsletter_dismissed', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    setError('');
    try {
      await addSubscriber(email);
      setIsSubmitted(true);
      setTimeout(() => {
        handleClose();
      }, 2500);
    } catch (err) {
      console.error(err);
      setIsSubmitted(true);
      setTimeout(() => {
        handleClose();
      }, 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[115] flex items-center justify-center p-4 bg-[#1A2847]/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-white rounded-[12px] shadow-2xl overflow-hidden border border-slate-200">
        <button
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Top Gold Accent Bar */}
        <div className="h-1.5 w-full bg-[#C9962A]" />

        <div className="p-6 sm:p-8">
          {isSubmitted ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 bg-[#FDF3E3] text-[#C9962A] rounded-full mx-auto flex items-center justify-center">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-lg font-bold text-[#1A2847] font-display">You're on the list!</h3>
              <p className="text-xs text-slate-600">
                You'll receive verified property updates, market opportunities, and insider wealth tips.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-[8px] bg-[#FDF3E3] text-[#C9962A] flex items-center justify-center">
                <Mail size={20} />
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-[2px] uppercase text-[#C9962A] block mb-1">
                  The Forge Insider
                </span>
                <h3 className="text-xl font-bold text-[#1A2847] font-display leading-tight">
                  Stay in the loop — get property tips & verified deals
                </h3>
                <p className="text-xs text-[#1A1A1A]/70 mt-1.5 leading-relaxed">
                  Join hundreds of young Nigerians and diaspora investors receiving prime land alerts before public launch.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 pt-2">
                {error && <p className="text-xs text-red-600">{error}</p>}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 text-sm border border-slate-300 rounded-[8px] focus:outline-none focus:border-[#C9962A] focus:ring-1 focus:ring-[#C9962A] min-h-[44px]"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-[#C9962A] hover:bg-[#B38322] text-[#1A2847] font-bold text-sm py-3 rounded-[8px] transition-all min-h-[44px] shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  Subscribe for Free
                </button>
                <p className="text-[11px] text-center text-slate-500">
                  No spam. Just value. Unsubscribe anytime.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
