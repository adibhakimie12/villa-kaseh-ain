import { MessageCircle } from 'lucide-react';
import { whatsappUrl } from '../data/site';

interface MobileBottomBarProps {
  onNavigate: (path: string) => void;
}

export function MobileBottomBar({ onNavigate }: MobileBottomBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white/95 p-3 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onNavigate('/booking')}
          className="rounded-full bg-primary px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white"
        >
          Book Now
        </button>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/25 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-primary"
        >
          <MessageCircle size={14} />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
