import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  ChevronRight
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { SEO } from '../components/SEO';

export const Contact: React.FC = () => {
  const { settings, submitEnquiry } = useProperties();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState('Buying Land');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const displayPhone = settings?.contact_phone || '+234 810 613 3572';
  const displayEmail = settings?.contact_email || 'theforgeproperties@gmail.com';
  const displayAddress = settings?.contact_address || 'The Forge Properties HQ, Lekki Phase 1, Lagos State, Nigeria';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await submitEnquiry({
        name,
        phone,
        email,
        interest,
        message,
        property_id: undefined,
        plot_size: undefined
      });
      setIsSuccess(true);
    } catch {
      setError('Something went wrong sending your message. Please try WhatsApp directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const directWhatsAppUrl = `https://wa.me/2348106133572?text=${encodeURIComponent(
    `Hello The Forge Properties, I am reaching out from your Contact page. My name is ${name || 'an interested investor'}.`
  )}`;

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] pt-20">
      <SEO
        title="Contact Us | The Forge Properties"
        description="Have a question about verified land, need title verification advice, or want to know where to start? We're here."
      />

      {/* HERO SECTION */}
      <section className="bg-[#0057FF] text-white py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden border-b-2 border-[#C8FF00]/30">
        {settings?.contact_hero_image && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img 
              src={settings.contact_hero_image} 
              alt="Contact The Forge Properties" 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[#0057FF]/85" />
          </div>
        )}

        <div 
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#C8FF00]/15 blur-3xl pointer-events-none z-0" 
          aria-hidden="true" 
        />

        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-100 mb-6">
            <Link to="/" className="hover:text-[#C8FF00] transition-colors">
              Home
            </Link>
            <ChevronRight size={14} className="text-[#C8FF00]" />
            <span className="text-[#C8FF00]">Contact</span>
          </nav>

          <span className="text-xs font-bold uppercase tracking-[2px] text-[#C8FF00] block mb-2">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display mb-4">
            Let's Talk Land
          </h1>
          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Have a question about a property, need title verification advice, or just want to know where to start? We're here.
          </p>
        </div>
      </section>

      {/* TWO COLUMNS: LEFT CONTACT DETAILS, RIGHT CONTACT FORM */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[#F5F5F5]">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            
            {/* LEFT COLUMN: Contact Details (5 cols) */}
            <div className="lg:col-span-5 bg-[#0057FF] text-white rounded-[16px] p-8 sm:p-10 border border-[#C8FF00]/30 shadow-xl flex flex-col justify-between">
              <div className="space-y-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[2px] text-[#C8FF00] block mb-2">
                    Direct Reach
                  </span>
                  <h2 className="text-2xl font-bold text-white font-display">
                    The Forge Properties HQ
                  </h2>
                  <p className="text-xs text-blue-100 mt-1">
                    Prompt responses for local and diaspora inquiries.
                  </p>
                </div>

                <div className="space-y-6 text-sm">
                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-[8px] bg-[#0047d4] border border-[#C8FF00]/30 flex items-center justify-center text-[#C8FF00] shrink-0">
                      <Phone size={18} />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 block mb-0.5">
                        Phone & WhatsApp
                      </span>
                      <a href={`tel:${displayPhone.replace(/[^0-9+]/g, '')}`} className="text-white hover:text-[#C8FF00] font-semibold text-base transition-colors">
                        {displayPhone}
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-[8px] bg-[#0047d4] border border-[#C8FF00]/30 flex items-center justify-center text-[#C8FF00] shrink-0">
                      <Mail size={18} />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 block mb-0.5">
                        Official Email
                      </span>
                      <a href={`mailto:${displayEmail}`} className="text-white hover:text-[#C8FF00] font-semibold transition-colors break-all">
                        {displayEmail}
                      </a>
                      {settings?.contact_email_2 && (
                        <a href={`mailto:${settings.contact_email_2}`} className="text-blue-200 hover:text-[#C8FF00] text-xs block mt-0.5 transition-colors break-all">
                          {settings.contact_email_2}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Office */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-[8px] bg-[#0047d4] border border-[#C8FF00]/30 flex items-center justify-center text-[#C8FF00] shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 block mb-0.5">
                        Office Location
                      </span>
                      <p className="text-white font-medium">
                        {displayAddress}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Socials */}
                <div className="pt-4 border-t border-white/15">
                  <span className="text-xs font-bold uppercase tracking-[1.5px] text-[#C8FF00] block mb-3">
                    Follow Our Journey
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href="https://www.instagram.com/theforgeproperties_"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-[6px] bg-[#0047d4] border border-white/15 text-xs text-blue-100 hover:text-[#C8FF00] hover:border-[#C8FF00] transition-all font-semibold"
                    >
                      Instagram
                    </a>
                    <a
                      href="https://www.tiktok.com/@theforgeproperties_"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-[6px] bg-[#0047d4] border border-white/15 text-xs text-blue-100 hover:text-[#C8FF00] hover:border-[#C8FF00] transition-all font-semibold"
                    >
                      TikTok
                    </a>
                    <a
                      href="https://www.facebook.com/theforgeproperties_"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-[6px] bg-[#0047d4] border border-white/15 text-xs text-blue-100 hover:text-[#C8FF00] hover:border-[#C8FF00] transition-all font-semibold"
                    >
                      Facebook
                    </a>
                    <a
                      href="https://x.com/theforgeproperties_"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-[6px] bg-[#0047d4] border border-white/15 text-xs text-blue-100 hover:text-[#C8FF00] hover:border-[#C8FF00] transition-all font-semibold"
                    >
                      X
                    </a>
                  </div>
                  <p className="text-[11px] text-blue-200 mt-2">Handle: @theforgeproperties_</p>
                </div>
              </div>

              {/* Big CTA WhatsApp Button */}
              <div className="pt-8">
                <a
                  id="contact-whatsapp-cta"
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#C8FF00] hover:bg-[#b5e600] text-[#0A0A0A] font-extrabold text-base py-4 px-6 rounded-[8px] inline-flex items-center justify-center gap-2 shadow-lg transition-all min-h-[44px]"
                >
                  <MessageCircle size={22} className="text-[#0A0A0A]" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* RIGHT COLUMN: Contact Form (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-[16px] p-8 sm:p-12 border border-[#E0E4FF] shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-[2px] text-[#0057FF] block mb-2">
                  Send A Message
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0057FF] font-display mb-6">
                  How Can We Help You?
                </h2>

                {isSuccess ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-14 h-14 bg-[#F5F5F5] text-[#0057FF] rounded-full mx-auto flex items-center justify-center border border-[#E0E4FF]">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-[#0057FF] font-display">Message Sent!</h3>
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
                        className="bg-[#0057FF] hover:bg-[#0047d4] text-white font-bold text-sm px-6 py-3 rounded-[8px] min-h-[44px] transition-all"
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
                      <label htmlFor="contact-name" className="block text-xs font-bold uppercase tracking-[1px] text-[#0A0A0A] mb-1">
                        Full Name *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Bukola Adebayo"
                        className="w-full px-4 py-3 text-sm border border-[#E0E4FF] rounded-[8px] focus:outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] min-h-[44px]"
                      />
                    </div>

                    {/* Phone & Email Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-phone" className="block text-xs font-bold uppercase tracking-[1px] text-[#0A0A0A] mb-1">
                          Phone / WhatsApp *
                        </label>
                        <input
                          id="contact-phone"
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +234 810 613 3572"
                          className="w-full px-4 py-3 text-sm border border-[#E0E4FF] rounded-[8px] focus:outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] min-h-[44px]"
                        />
                      </div>

                      <div>
                        <label htmlFor="contact-email" className="block text-xs font-bold uppercase tracking-[1px] text-[#0A0A0A] mb-1">
                          Email Address *
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. bukola@gmail.com"
                          className="w-full px-4 py-3 text-sm border border-[#E0E4FF] rounded-[8px] focus:outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] min-h-[44px]"
                        />
                      </div>
                    </div>

                    {/* "What are you interested in?" dropdown */}
                    <div>
                      <label htmlFor="contact-interest" className="block text-xs font-bold uppercase tracking-[1px] text-[#0A0A0A] mb-1">
                        What are you interested in? *
                      </label>
                      <select
                        id="contact-interest"
                        value={interest}
                        onChange={(e) => setInterest(e.target.value)}
                        className="w-full bg-white px-4 py-3 text-sm border border-[#E0E4FF] rounded-[8px] focus:outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] min-h-[44px] text-[#0A0A0A] font-medium"
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
                      <label htmlFor="contact-message" className="block text-xs font-bold uppercase tracking-[1px] text-[#0A0A0A] mb-1">
                        Your Message
                      </label>
                      <textarea
                        id="contact-message"
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us about what you are looking for, preferred budget, or questions..."
                        className="w-full px-4 py-3 text-sm border border-[#E0E4FF] rounded-[8px] focus:outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF]"
                      />
                    </div>

                    {/* Send Message Button in Yellow-Green */}
                    <button
                      id="contact-submit-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#C8FF00] hover:bg-[#b5e600] text-[#0A0A0A] font-extrabold text-base py-4 rounded-[8px] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg min-h-[44px] disabled:opacity-50"
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
