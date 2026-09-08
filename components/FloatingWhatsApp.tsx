import React from 'react';
import { MessageCircle } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const whatsappNumber = "2348106133572";
  const defaultMessage = encodeURIComponent("Hello The Forge Properties, I would like to learn more about your verified, titled land offerings and flexible payment plans.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${defaultMessage}`;

  return (
    <aside aria-label="WhatsApp quick chat" className="fixed bottom-6 right-6 z-50 flex items-center group">
      <span className="hidden md:inline-flex items-center mr-3 px-3.5 py-1.5 rounded-full bg-[#0057FF] text-white text-xs font-semibold shadow-lg border border-[#C8FF00]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Chat with us on WhatsApp
      </span>
      <a
        id="floating-whatsapp-btn"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with The Forge Properties on WhatsApp"
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 active:scale-95 animate-whatsapp-pulse cursor-pointer"
      >
        <MessageCircle className="w-8 h-8 fill-current stroke-none" />
      </a>
    </aside>
  );
};
