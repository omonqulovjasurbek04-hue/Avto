import React from 'react';
import { Globe, Share2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#081425] border-t border-[#424754]/30 w-full py-8 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-10 max-w-7xl mx-auto gap-6">
        {/* Brand & Protocol Tag */}
        <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
          <div className="font-display text-3xl font-extrabold text-[#adc6ff] tracking-tighter">
            AVTO
          </div>
          <p className="text-xs font-mono text-[#8c909f] tracking-wider">
            © 2024 AVTO YHQ. DRIVER_ED_PROTOCOL_v1.0
          </p>
        </div>

        {/* Footer Navigation Links */}
        <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold tracking-wider text-[#8c909f]">
          <a href="#privacy" className="hover:text-[#4cd7f6] transition-colors">
            Privacy
          </a>
          <a href="#terms" className="hover:text-[#4cd7f6] transition-colors">
            Terms
          </a>
          <a href="#support" className="hover:text-[#4cd7f6] transition-colors">
            Support
          </a>
          <a href="#status" className="hover:text-[#4cd7f6] transition-colors">
            System Status
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            className="w-9 h-9 rounded-full border border-[#8c909f]/30 flex items-center justify-center text-[#8c909f] hover:text-[#4cd7f6] hover:border-[#4cd7f6] transition-all"
            title="Tilni o'zgartirish (Language)"
          >
            <Globe className="w-4 h-4" />
          </button>
          <button 
            className="w-9 h-9 rounded-full border border-[#8c909f]/30 flex items-center justify-center text-[#8c909f] hover:text-[#4cd7f6] hover:border-[#4cd7f6] transition-all"
            title="Ulashish (Share)"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'AVTO YHQ - Haydovchilik Mahorati',
                  url: window.location.href,
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Nusxalandi! Do'stlaringizga ulashing.");
              }
            }}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
