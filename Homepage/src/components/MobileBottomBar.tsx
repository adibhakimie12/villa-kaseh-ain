import { MessageCircle } from 'lucide-react';
import { whatsappUrl } from '../data/site';

interface MobileBottomBarProps {
  onNavigate: (path: string) => void;
  pathname: string;
}

export function MobileBottomBar({ onNavigate, pathname }: MobileBottomBarProps) {
  if (pathname === '/') {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-2 gap-2 rounded-[1.75rem] border border-stone-200 bg-white/95 p-2 shadow-[0_-8px_30px_rgba(15,23,42,0.10)] backdrop-blur">
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
