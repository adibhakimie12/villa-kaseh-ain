import { X } from 'lucide-react';
import { whatsappUrl } from '../data/site';

interface FirstVisitPopupProps {
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export function FirstVisitPopup({ onClose, onNavigate }: FirstVisitPopupProps) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-3 md:p-8"
      onClick={onClose}
    >
      <div
        className="relative max-h-[88svh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-[#d6c4a2]/30 bg-[#f7f2e9] shadow-2xl md:max-h-[92svh]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close popup"
          className="sticky right-3 top-3 z-20 ml-auto mr-3 mt-3 flex rounded-full border border-[#d4c0a1] bg-[#fffaf2] p-2.5 text-[#5a4b3a] shadow-md transition hover:bg-white md:absolute md:right-4 md:top-4 md:m-0"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr]">
          <div className="border-b border-[#d9cdb6] px-5 pb-4 pt-2 md:p-10 lg:border-b-0 lg:border-r">
            <p className="text-center text-[10px] uppercase tracking-[0.35em] text-[#9a7a46] md:text-xs">Villa Kaseh Ain</p>
            <h2 className="mt-2 text-center font-headline text-[1.1rem] leading-snug text-[#2d2a25] md:mt-4 md:text-4xl">
              Welcome To Our Private Coastal Retreat
            </h2>
            <p className="mx-auto mt-1 max-w-md text-center text-xs text-[#59544b] md:mt-2 md:text-base">
              A warm beginning for meaningful staycations with your loved ones.
            </p>

            <div className="mt-4 overflow-hidden rounded-2xl border border-[#d9cdb6]">
              <img
                src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1400&q=80"
                alt="Villa Kaseh Ain welcome visual"
                className="h-44 w-full object-cover md:h-[360px]"
              />
            </div>
          </div>

          <div className="p-5 pt-4 md:p-10">
            <p className="font-headline text-[1.05rem] text-[#2d2a25] md:text-2xl">Dear Beloved Customer,</p>
            <p className="mt-3 text-sm leading-relaxed text-[#3f392f] md:mt-4 md:text-base">
              Welcome to Villa Kaseh Ain, your premium escape for peaceful holidays, family reunions, and private moments by the sea.
            </p>
            <p className="mt-3 hidden text-sm leading-relaxed text-[#3f392f] md:mt-4 md:block md:text-base">
              Every corner of this villa is curated to feel luxurious yet warm, so your stay feels both exclusive and deeply comfortable.
            </p>
            <p className="mt-3 hidden text-sm leading-relaxed text-[#3f392f] md:mt-4 md:block md:text-base">
              For a smooth booking experience, we recommend checking your preferred dates early and contacting us directly for custom requests.
            </p>
            <p className="mt-3 text-sm font-semibold text-[#2d2a25] md:mt-5 md:text-base">
              Thank you for your trust. We look forward to hosting you soon.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 md:mt-7 md:grid-cols-1 lg:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  onNavigate('/booking');
                  onClose();
                }}
                className="rounded-full bg-primary px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white"
              >
                Check Dates
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-full border border-primary/25 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-primary"
              >
                WhatsApp Us
              </a>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full text-center text-xs font-medium text-[#6a6256] underline underline-offset-4 md:mt-5 md:w-auto md:text-sm"
            >
              Continue browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
