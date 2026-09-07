import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  CheckCircle2, 
  Send,
  ChevronRight
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { SEO } from '../components/SEO';

export const Contact: React.FC = () => {
  const { addLead } = useProperties();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState('Buying Land');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !phone || !email) {
      setError('Please provide your name, phone number, and email.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addLead({
        id: 'contact-' + Date.now(),
        name,
        email,
        phone,
        message: `Interest: ${interest}. ${message || 'General message from contact page.'}`,
        property_id: 'contact-page',
        property_title: `Inquiry: ${interest}`,
        date: new Date().toISOString(),
        status: 'New',
        type: 'Contact Page Inquiry'
      });
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const directWhatsAppUrl = `https://wa.me/2348106133572?text=${encodeURIComponent(
    `Hello The Forge Properties, I'm reaching out from your website. My name is ${name || 'an interested investor'} and I'm interested in ${interest}.`
  )}`;

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] pt-20">
      <SEO
        title="Contact Us | The Forge Properties"
        description="Have a question about verified land, need title verification advice, or want to know where to start? We're here."
      />

      {/* HERO SECTION */}
      <section className="bg-[#1A2847] text-white py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden border-b-2 border-[#C9962A]/40">
        <div 
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#C9962A]/15 blur-3xl pointer-events-none" 
          aria-hidden="true" 
        />

        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 mb-6">
            <Link to="/" className="hover:text-[#C9962A] transition-colors">
              Home
            </Link>
            <ChevronRight size={14} className="text-[#C9962A]" />
            <span className="text-[#C9962A]">Contact</span>
          </nav>

          <span className="text-xs font-bold uppercase tracking-[2px] text-[#C9962A] block mb-2">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display mb-4">
            Let's Talk Land
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Have a question about a property, need title verification advice, or just want to know where to start? We're here.
          </p>
        </div>
      </section>

      {/* TWO COLUMNS: LEFT CONTACT DETAILS, RIGHT CONTACT FORM */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[#F2F2F0]">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            
            {/* LEFT COLUMN: Contact Details (5 cols) */}
            <div className="lg:col-span-5 bg-[#1A2847] text-white rounded-[16px] p-8 sm:p-10 border border-[#C9962A]/40 shadow-xl flex flex-col justify-between">
              <div className="space-y-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[2px] text-[#C9962A] block mb-2">
                    Direct Reach
                  </span>
                  <h2 className="text-2xl font-bold text-white font-display">
                    The Forge Properties HQ
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Prompt responses for local and diaspora inquiries.
                  </p>
                </div>

                <div className="space-y-6 text-sm">
                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-[8px] bg-[#111B31] border border-[#C9962A]/40 flex items-center justify-center text-[#C9962A] shrink-0">
                      <Phone size={18} />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Phone & WhatsApp
                      </span>
                      <a href="tel:+2348106133572" className="text-white hover:text-[#C9962A] font-semibold text-base transition-colors">
                        +234 810 613 3572
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-[8px] bg-[#111B31] border border-[#C9962A]/40 flex items-center justify-center text-[#C9962A] shrink-0">
                      <Mail size={18} />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Official Email
                      </span>
                      <a href="mailto:theforgeproperties@gmail.com" className="text-white hover:text-[#C9962A] font-semibold transition-colors break-all">
                        theforgeproperties@gmail.com
                      </a>
                    </div>
                  </div>

                  {/* Office */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-[8px] bg-[#111B31] border border-[#C9962A]/40 flex items-center justify-center text-[#C9962A] shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Office Location
                      </span>
                      <p className="text-white font-medium">
                        Sangotedo, Lagos State, Nigeria
                      </p>
                    </div>
                  </div>
                </div>

                {/* Socials */}
                <div className="pt-4 border-t border-white/10">
                  <span className="text-xs font-bold uppercase tracking-[1.5px] text-[#C9962A] block mb-3">
                    Follow Our Journey
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href="https://www.instagram.com/theforgeproperties_"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-[6px] bg-[#111B31] border border-white/15 text-xs text-slate-300 hover:text-[#C9962A] hover:border-[#C9962A] transition-all font-semibold"
                    >
                      Instagram
                    </a>
                    <a
                      href="https://www.tiktok.com/@theforgeproperties_"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-[6px] bg-[#111B31] border border-white/15 text-xs text-slate-300 hover:text-[#C9962A] hover:border-[#C9962A] transition-all font-semibold"
                    >
                      TikTok
                    </a>
                    <a
                      href="https://www.facebook.com/theforgeproperties_"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-[6px] bg-[#111B31] border border-white/15 text-xs text-slate-300 hover:text-[#C9962A] hover:border-[#C9962A] transition-all font-semibold"
                    >
                      Facebook
                    </a>
                    <a
                      href="https://x.com/theforgeproperties_"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-[6px] bg-[#111B31] border border-white/15 text-xs text-slate-300 hover:text-[#C9962A] hover:border-[#C9962A] transition-all font-semibold"
                    >
                      X
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Handle: @theforgeproperties_</p>
                </div>
              </div>

              {/* Big Green "Chat on WhatsApp" Button */}
              <div className="pt-8">
                <a
                  id="contact-whatsapp-cta"
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-base py-4 px-6 rounded-[8px] inline-flex items-center justify-center gap-2 shadow-lg transition-all min-h-[44px]"
                >
                  <MessageCircle size={22} />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* RIGHT COLUMN: Contact Form (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-[16px] p-8 sm:p-12 border border-slate-200 shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-[2px] text-[#C9962A] block mb-2">
                  Send A Message
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A2847] font-display mb-6">
                  How Can We Help You?
                </h2>

                {isSuccess ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-14 h-14 bg-[#FDF3E3] text-[#C9962A] rounded-full mx-auto flex items-center justify-center">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-[#1A2847] font-display">Message Sent!</h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                      Thank you, <strong>{name}</strong>! We've received your request regarding <strong>{interest}</strong>. A property consultant will get back to you shortly.
                    </p>
                    <div className="pt-4 flex justify-center">
                      <button
                        onClick={() => {
                          setIsSuccess(false);
                          setName('');
                          setPhone('');
                          setEmail('');
                          setMessage('');
                        }}
                        className="bg-[#1A2847] text-white font-bold text-sm px-6 py-3 rounded-[8px] min-h-[44px]"
                      >
                        Send Another Message
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="p-3 bg-red-50 text-red-700 text-xs rounded-[8px] border border-red-200">
                        {error}
                      </div>
                    )}

                    {/* Name */}
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-bold uppercase tracking-[1px] text-[#1A2847] mb-1">
                        Full Name *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Bukola Adebayo"
                        className="w-full px-4 py-3 text-sm border border-slate-300 rounded-[8px] focus:outline-none focus:border-[#C9962A] focus:ring-1 focus:ring-[#C9962A] min-h-[44px]"
                      />
                    </div>

                    {/* Phone & Email Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-phone" className="block text-xs font-bold uppercase tracking-[1px] text-[#1A2847] mb-1">
                          Phone / WhatsApp *
                        </label>
                        <input
                          id="contact-phone"
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +234 810 613 3572"
                          className="w-full px-4 py-3 text-sm border border-slate-300 rounded-[8px] focus:outline-none focus:border-[#C9962A] focus:ring-1 focus:ring-[#C9962A] min-h-[44px]"
                        />
                      </div>

                      <div>
                        <label htmlFor="contact-email" className="block text-xs font-bold uppercase tracking-[1px] text-[#1A2847] mb-1">
                          Email Address *
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. bukola@gmail.com"
                          className="w-full px-4 py-3 text-sm border border-slate-300 rounded-[8px] focus:outline-none focus:border-[#C9962A] focus:ring-1 focus:ring-[#C9962A] min-h-[44px]"
                        />
                      </div>
                    </div>

                    {/* "What are you interested in?" dropdown */}
                    <div>
                      <label htmlFor="contact-interest" className="block text-xs font-bold uppercase tracking-[1px] text-[#1A2847] mb-1">
                        What are you interested in? *
                      </label>
                      <select
                        id="contact-interest"
                        value={interest}
                        onChange={(e) => setInterest(e.target.value)}
                        className="w-full bg-white px-4 py-3 text-sm border border-slate-300 rounded-[8px] focus:outline-none focus:border-[#C9962A] focus:ring-1 focus:ring-[#C9962A] min-h-[44px] text-[#1A1A1A] font-medium"
                      >
                        <option value="Buying Land">Buying Land</option>
                        <option value="Co-Buying">Co-Buying with a Friend / Group</option>
                        <option value="Becoming a Realtor">Becoming a Realtor (15% Commission)</option>
                        <option value="The Forge Nation">The Forge Nation Community</option>
                        <option value="General Enquiry">General Enquiry / Title Consultation</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="contact-message" className="block text-xs font-bold uppercase tracking-[1px] text-[#1A2847] mb-1">
                        Your Message
                      </label>
                      <textarea
                        id="contact-message"
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us about what you are looking for, preferred budget, or questions..."
                        className="w-full px-4 py-3 text-sm border border-slate-300 rounded-[8px] focus:outline-none focus:border-[#C9962A] focus:ring-1 focus:ring-[#C9962A]"
                      />
                    </div>

                    {/* Send Message Button in Gold */}
                    <button
                      id="contact-submit-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#C9962A] hover:bg-[#B38322] text-white font-extrabold text-base py-4 rounded-[8px] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg min-h-[44px] disabled:opacity-50"
                    >
                      <Send size={18} />
                      <span>{isSubmitting ? 'Sending Message...' : 'Send Message'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
