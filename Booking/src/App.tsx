import { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  Bed, 
  Maximize, 
  Waves, 
  Wifi, 
  Star, 
  ArrowRight, 
  CheckCircle2, 
  Wine, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

interface Suite {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  amenities: {
    icon: any;
    label: string;
  }[];
  isPopular?: boolean;
}

// --- Mock Data ---

const SUITES: Suite[] = [
  {
    id: 'garden-pavillion',
    name: 'The Garden Pavillion',
    description: 'A sanctuary of privacy featuring a private infinity plunge pool and outdoor rain shower nestled within lush greenery.',
    price: 450,
    rating: 5,
    isPopular: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqm7HXGhN4lSxN1uYe_VY4L1lHSO0DrCd4G1kuZtQhOrXqwRD1UQJ4ZcEYIXPIoSjcfD8IXj_vzZL47JPz0UCuhc5ks1ddHWGNV4443sICrYGE9LDMJM6PqYOJleTGUgGZyKJeWcF9nv5Hla5FwkSXu1CfpySd_rsNuK_ENJmO42qUT-h0A5xUPNMs-KsbPdxiJf-OY7JKkNv7DGKqfhvm-YyPtTF489SOWGAEd5MTFfNq3-2xfp6254hE6w_gyjE-0jdnp00ks9M',
    amenities: [
      { icon: Bed, label: 'King Bed' },
      { icon: Maximize, label: '120 m²' },
      { icon: Waves, label: 'Private Pool' },
      { icon: Wifi, label: 'High-Speed' },
    ]
  },
  {
    id: 'azure-suite',
    name: 'The Azure Suite',
    description: 'Breathtaking panoramic views of the coastline with an expansive terrace for sunset contemplation.',
    price: 320,
    rating: 4,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnocqvSp-6NdPz3Dq9C0wFRRwcPBjL6xLQuaPrsD67dmh9hA2TdoS7qbciXQ43teXedIc5FSB4tDbHwNnOGP5WGfFOOyxV5GZGKf6nh5LW5QMyC2pMRnMWBUQbuDHZmlpNb_QE8kfwgtNgA3V015w9TcP4GxaizXAo2OSleZ4XM8AiCFJgyl5iByPJhpR_FFdqUzyndnC1ragFA3I37UX8nGE4j2yIEnHsbk2Alx1izeO9FXGp39bwKMx2szSQ2hQzjysJewp3jHg',
    amenities: [
      { icon: Bed, label: 'Queen Twin' },
      { icon: Maximize, label: '85 m²' },
      { icon: Waves, label: 'Sea Terrace' },
      { icon: Sparkles, label: 'Marble Tub' },
    ]
  }
];

// --- Components ---

const Header = () => (
  <header className="fixed top-0 w-full z-50 bg-surface/20 backdrop-blur-lg">
    <nav className="flex justify-between items-center w-full px-6 md:px-12 py-6 max-w-[1440px] mx-auto">
      <div className="flex items-center gap-2 group cursor-pointer">
        <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-1 transition-transform" />
        <span className="text-on-surface-variant text-sm font-medium uppercase tracking-widest hover:text-primary transition-colors">Home</span>
      </div>
      
      <h1 className="text-2xl font-headline italic text-primary absolute left-1/2 -translate-x-1/2">
        Villa Kaseh Ain
      </h1>

      <div className="hidden md:flex items-center gap-8">
        <a href="#" className="text-primary font-semibold border-b-2 border-primary pb-1 font-headline tracking-tight">Suites</a>
        <a href="#" className="text-on-surface-variant opacity-80 hover:opacity-100 hover:text-primary transition-all duration-500 font-headline tracking-tight">Experience</a>
        <a href="#" className="text-on-surface-variant opacity-80 hover:opacity-100 hover:text-primary transition-all duration-500 font-headline tracking-tight">Gallery</a>
      </div>

      <button className="bg-primary text-on-primary px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-primary-container transition-all active:scale-95 duration-300">
        Book Now
      </button>
    </nav>
  </header>
);

const Footer = () => (
  <footer className="bg-surface-container-high w-full py-16 px-6 md:px-12">
    <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-widest text-primary">© 2024 Villa Kaseh Ain. The Cinematic Still.</p>
        <div className="flex gap-6">
          <a href="#" className="text-sm uppercase tracking-widest text-on-surface-variant hover:underline decoration-1 underline-offset-4">Privacy Policy</a>
          <a href="#" className="text-sm uppercase tracking-widest text-on-surface-variant hover:underline decoration-1 underline-offset-4">Terms of Service</a>
        </div>
      </div>
      <div className="flex md:justify-end gap-8">
        <a href="#" className="text-sm uppercase tracking-widest text-on-surface-variant hover:underline decoration-1 underline-offset-4">Sustainability</a>
        <a href="#" className="text-sm uppercase tracking-widest text-on-surface-variant hover:underline decoration-1 underline-offset-4">Contact</a>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [checkIn, setCheckIn] = useState('Oct 24, 2024');
  const [checkOut, setCheckOut] = useState('Oct 28, 2024');
  const [guests, setGuests] = useState('2 Adults, 0 Children');
  const [selectedSuiteId, setSelectedSuiteId] = useState<string | null>(SUITES[0].id);

  const selectedSuite = useMemo(() => 
    SUITES.find(s => s.id === selectedSuiteId) || null
  , [selectedSuiteId]);

  const nights = 4;
  const serviceChargeRate = 0.1;
  const tourismTax = 40;

  const costs = useMemo(() => {
    if (!selectedSuite) return null;
    const base = selectedSuite.price * nights;
    const service = base * serviceChargeRate;
    return {
      base,
      service,
      tax: tourismTax,
      total: base + service + tourismTax
    };
  }, [selectedSuite, nights]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow pt-32 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto w-full">
        {/* Hero Context */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-headline text-on-background mb-4 tracking-tight">Reserve Your Sanctuary</h2>
          <p className="text-on-surface-variant max-w-2xl leading-relaxed">
            Experience the cinematic stillness of our private suites. Choose your preferred dates to begin your journey into refined luxury.
          </p>
        </motion.div>

        {/* Booking Form Section */}
        <section className="mb-16">
          <div className="bg-surface-container-lowest p-8 md:p-10 rounded-xl shadow-[0_40px_60px_-15px_rgba(11,30,33,0.06)] border border-outline-variant/10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant/70">Check-in</label>
                <div className="flex items-center border-b border-outline-variant/30 py-2 group focus-within:border-primary transition-colors">
                  <Calendar className="w-5 h-5 text-primary/60 mr-3" />
                  <input 
                    className="bg-transparent border-none p-0 focus:ring-0 w-full placeholder:text-outline-variant text-on-surface font-medium" 
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant/70">Check-out</label>
                <div className="flex items-center border-b border-outline-variant/30 py-2 group focus-within:border-primary transition-colors">
                  <Calendar className="w-5 h-5 text-primary/60 mr-3" />
                  <input 
                    className="bg-transparent border-none p-0 focus:ring-0 w-full placeholder:text-outline-variant text-on-surface font-medium" 
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant/70">Guests</label>
                <div className="flex items-center border-b border-outline-variant/30 py-2 group focus-within:border-primary transition-colors">
                  <Users className="w-5 h-5 text-primary/60 mr-3" />
                  <div className="relative w-full">
                    <select 
                      className="bg-transparent border-none p-0 focus:ring-0 w-full text-on-surface font-medium appearance-none cursor-pointer"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                    >
                      <option>2 Adults, 0 Children</option>
                      <option>2 Adults, 1 Child</option>
                      <option>4 Adults, 0 Children</option>
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60 pointer-events-none" />
                  </div>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]">
                Check Availability
              </button>
            </div>
          </div>
        </section>

        {/* Main Content: Results & Summary */}
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Availability Results */}
          <div className="flex-1 space-y-12">
            <div className="flex justify-between items-baseline border-b border-outline-variant/10 pb-4">
              <h3 className="font-headline text-2xl">Available Suites ({SUITES.length})</h3>
              <span className="text-sm text-on-surface-variant italic">Showing best matches for Oct 24 - 28</span>
            </div>

            {SUITES.map((suite, index) => (
              <motion.article 
                key={suite.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`group bg-surface-container-low rounded-xl overflow-hidden hover:shadow-xl transition-all duration-700 border-2 ${selectedSuiteId === suite.id ? 'border-primary' : 'border-transparent'}`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="h-64 md:h-full relative overflow-hidden">
                    <img 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                      src={suite.image} 
                      alt={suite.name}
                      referrerPolicy="no-referrer"
                    />
                    {suite.isPopular && (
                      <div className="absolute top-4 left-4 bg-primary/90 text-on-primary text-[10px] uppercase tracking-widest py-1 px-3 rounded-full backdrop-blur-sm">
                        Most Popular
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-headline text-2xl text-primary">{suite.name}</h4>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < suite.rating ? 'fill-tertiary text-tertiary' : 'text-outline-variant'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">{suite.description}</p>
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        {suite.amenities.map((amenity, i) => (
                          <div key={i} className="flex items-center gap-2 text-on-surface-variant/80">
                            <amenity.icon className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-wider">{amenity.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-end justify-between pt-6 border-t border-outline-variant/10">
                      <div>
                        <span className="text-xs text-on-surface-variant block uppercase tracking-tighter">Per Night</span>
                        <span className="text-3xl font-headline font-bold text-primary">${suite.price}</span>
                      </div>
                      <button 
                        onClick={() => setSelectedSuiteId(suite.id)}
                        className={`px-8 py-3 transition-all rounded-lg font-bold uppercase tracking-widest text-xs ${
                          selectedSuiteId === suite.id 
                          ? 'bg-primary text-on-primary' 
                          : 'bg-surface-container-highest text-primary hover:bg-primary hover:text-on-primary'
                        }`}
                      >
                        {selectedSuiteId === suite.id ? 'Selected' : 'Select Suite'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Booking Summary Sidebar */}
          <aside className="w-full lg:w-96 sticky top-32">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface-container rounded-xl p-8 border border-outline-variant/20"
            >
              <h3 className="font-headline text-xl mb-6 pb-4 border-b border-outline-variant/20">Your Stay</h3>
              
              <div className="space-y-6 mb-8">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold">Check-in</p>
                    <p className="font-medium text-on-surface">{checkIn}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-outline-variant" />
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold">Check-out</p>
                    <p className="font-medium text-on-surface">{checkOut}</p>
                  </div>
                </div>

                <div className="flex justify-between py-4 border-y border-outline-variant/10">
                  <span className="text-on-surface-variant">Duration</span>
                  <span className="font-semibold text-primary">{nights} Nights</span>
                </div>

                <AnimatePresence mode="wait">
                  {selectedSuite && costs && (
                    <motion.div 
                      key={selectedSuite.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant italic">{selectedSuite.name} x {nights} nights</span>
                        <span className="text-on-surface">${costs.base.toLocaleString()}.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant italic">Service Charge (10%)</span>
                        <span className="text-on-surface">${costs.service.toLocaleString()}.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant italic">Tourism Tax</span>
                        <span className="text-on-surface">${costs.tax.toLocaleString()}.00</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="bg-surface-container-highest p-4 rounded-lg mb-8">
                <div className="flex justify-between items-center">
                  <span className="font-headline text-lg">Total Est.</span>
                  <span className="font-headline text-2xl text-primary font-bold">
                    ${costs?.total.toLocaleString() || '0'}.00
                  </span>
                </div>
              </div>

              <button className="w-full bg-primary text-on-primary py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group active:scale-[0.98]">
                Confirm Selection
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-[10px] text-center mt-6 text-on-surface-variant/60 uppercase tracking-widest">
                No credit card required to hold rooms
              </p>
            </motion.div>

            {/* Secondary Info */}
            <div className="mt-6 p-6 border border-outline-variant/10 rounded-xl bg-surface/50">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Why book with us?</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Best Rate Guaranteed
                </li>
                <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <Wine className="w-4 h-4 text-primary" />
                  Welcome Drinks Included
                </li>
                <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <Sparkles className="w-4 h-4 text-primary" />
                  15% Off Spa Services
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
