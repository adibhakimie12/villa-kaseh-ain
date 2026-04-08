import { MessageCircle } from 'lucide-react';
import { whatsappUrl } from '../data/site';

interface MobileBottomBarProps {
  onNavigate: (path: string) => void;
  pathname: string;
}

export function MobileBottomBar({ onNavigate, pathname }: MobileBottomBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(env(safe-area-inset-bottom),0.5rem)] md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-2 gap-2 rounded-t-[1.5rem] border border-b-0 border-stone-200 bg-white/96 p-2 shadow-[0_-10px_24px_rgba(15,23,42,0.10)] backdrop-blur">
        <button
          type="button"
          onClick={() => onNavigate('/booking')}
          className="rounded-full bg-primary px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
        >
          Book Now
        </button>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/25 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-primary"
        >
          <MessageCircle size={14} />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
