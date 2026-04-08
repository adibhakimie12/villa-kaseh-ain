import { useEffect, useState } from 'react';
import { FirstVisitPopup } from './components/FirstVisitPopup';
import { MobileBottomBar } from './components/MobileBottomBar';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { BookingPage } from './pages/BookingPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';

function normalizePath(pathname: string) {
  if (pathname === '/' || pathname === '/booking' || pathname === '/contact') {
    return pathname;
  }
  return '/';
}

export default function App() {
  const [pathname, setPathname] = useState(() => normalizePath(window.location.pathname));
  const [showFirstVisitPopup, setShowFirstVisitPopup] = useState(
    () => normalizePath(window.location.pathname) === '/',
  );

  useEffect(() => {
    const onPopState = () => setPathname(normalizePath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (path: string) => {
    const nextPath = normalizePath(path);
    if (nextPath !== pathname) {
      window.history.pushState({}, '', nextPath);
      setPathname(nextPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const closeFirstVisitPopup = () => {
    setShowFirstVisitPopup(false);
  };

  return (
    <div className="min-h-screen bg-surface pb-0 md:pb-0">
      <SiteHeader pathname={pathname} onNavigate={navigate} />
      {pathname === '/' && <HomePage onNavigate={navigate} />}
      {pathname === '/booking' && <BookingPage />}
      {pathname === '/contact' && <ContactPage />}
      {showFirstVisitPopup && <FirstVisitPopup onClose={closeFirstVisitPopup} onNavigate={navigate} />}
      <SiteFooter />
      <MobileBottomBar pathname={pathname} onNavigate={navigate} />
    </div>
  );
}
