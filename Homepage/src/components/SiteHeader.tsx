import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { siteConfig, whatsappUrl } from '../data/site';

interface SiteHeaderProps {
  pathname: string;
  onNavigate: (path: string) => void;
}

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Booking', path: '/booking' },
  { label: 'Contact', path: '/contact' },
];

export function SiteHeader({ pathname, onNavigate }: SiteHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const handleNavigate = (path: string) => {
    onNavigate(path);
    setIsOpen(false);
  };

  const showFullHeader = !isHome || isScrolled;
  const headerClassName = showFullHeader
    ? 'border-b border-[#4c9085]/16 bg-[#f5efe6]/90 shadow-[0_14px_36px_rgba(53,85,80,0.10)] backdrop-blur-xl'
    : 'border-b-0 bg-gradient-to-b from-black/45 via-black/12 to-transparent';
  const navTextClassName = showFullHeader ? 'text-[#456962]/80' : 'text-white/0';
  const activeNavTextClassName = showFullHeader ? 'text-[#22312d]' : 'text-white/0';
  const whatsappClassName = showFullHeader
    ? 'border border-[#4c9085] bg-[#4c9085] text-[#0f1d1a] hover:bg-[#5aa196]'
    : 'pointer-events-none bg-white/0 text-transparent';
  const mobileButtonClassName = showFullHeader
    ? 'border-[#4c9085]/40 bg-white/60 text-[#35534d]'
    : 'border-white/25 bg-black/10 text-white';

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${headerClassName}`}>
      <nav className="mx-auto flex h-[4.5rem] w-full max-w-[92rem] items-center justify-between px-4 md:h-[5.25rem] md:px-10">
        <button
          className={`flex w-full items-center transition-all duration-500 ${
            showFullHeader ? 'max-w-[180px] md:max-w-[250px]' : 'max-w-[180px] md:max-w-[280px]'
          }`}
          onClick={() => handleNavigate('/')}
          type="button"
        >
          <img
            src="/villa-kaseh-ain-logo-transparent.png"
            alt={`${siteConfig.name} logo`}
            className={`h-auto w-full object-contain transition-all duration-500 ${
              showFullHeader
                ? 'opacity-100'
                : 'opacity-100 [filter:drop-shadow(0_2px_10px_rgba(0,0,0,0.32))]'
            }`}
          />
        </button>

        <div
          className={`hidden items-center gap-8 transition-all duration-500 md:flex ${
            showFullHeader ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
          }`}
        >
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              type="button"
              className={`text-[11px] uppercase tracking-[0.28em] transition ${
                pathname === item.path
                  ? activeNavTextClassName
                  : `${navTextClassName} ${showFullHeader ? 'hover:text-[#22312d]' : ''}`
              }`}
            >
              {item.label}
            </button>
          ))}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className={`rounded-full px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] transition ${whatsappClassName}`}
          >
            WhatsApp
          </a>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`rounded-full border p-2 transition-all duration-500 md:hidden ${mobileButtonClassName}`}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {isOpen && (
        <div
          className={`border-t px-4 pb-5 pt-4 md:hidden ${
            showFullHeader
              ? 'border-stone-300/80 bg-[#f5eedf]/96'
              : 'border-white/15 bg-black/70 backdrop-blur-xl'
          }`}
        >
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                type="button"
                className={`rounded-xl border px-3 py-3 text-left text-xs uppercase tracking-[0.2em] ${
                  showFullHeader
                    ? 'border-[#4c9085]/25 text-[#35534d]'
                    : 'border-white/10 text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className={`rounded-xl px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] ${
                showFullHeader ? 'bg-[#4c9085] text-[#0f1d1a]' : 'bg-white text-primary'
              }`}
            >
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

