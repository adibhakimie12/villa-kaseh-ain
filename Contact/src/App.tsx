/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  ArrowLeft, 
  MapPin, 
  Smartphone, 
  Globe, 
  Instagram, 
  MessageCircle, 
  Calendar,
  Clock
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function App() {
  return (
    <div className="min-h-screen selection:bg-primary/20 selection:text-primary">
      {/* TopNavBar */}
      <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/20 fixed top-0 z-50 w-full">
        <nav className="flex justify-between items-center w-full px-6 md:px-12 py-5 max-w-screen-2xl mx-auto">
          <a 
            className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-500 flex items-center gap-2 group" 
            href="#"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium">Back to Home</span>
          </a>
          
          <div className="font-serif text-xl md:text-2xl tracking-tight text-primary absolute left-1/2 -translate-x-1/2">
            Villa Kaseh Ain
          </div>
          
          <button className="bg-primary text-on-primary px-5 py-2 md:px-7 md:py-3 rounded-lg text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold hover:bg-primary/90 transition-all active:scale-95 duration-300">
            Book Now
          </button>
        </nav>
      </header>

      <main className="pt-32 lg:pt-48">
        {/* Contact Hero */}
        <section className="max-w-screen-2xl mx-auto px-6 md:px-12 mb-32 lg:mb-56">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            <motion.div 
              className="lg:col-span-5 space-y-10"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <div className="space-y-6">
                <motion.span 
                  variants={fadeIn}
                  className="text-xs uppercase tracking-[0.3em] text-primary font-bold block"
                >
                  CONTACT US
                </motion.span>
                <motion.h1 
                  variants={fadeIn}
                  className="text-5xl lg:text-7xl font-serif text-on-surface leading-[1.1] tracking-tight"
                >
                  Plan Your Private Escape
                </motion.h1>
                <motion.p 
                  variants={fadeIn}
                  className="text-lg text-on-surface-variant leading-relaxed max-w-lg"
                >
                  Experience the serene embrace of our beachfront sanctuary. Designed for families seeking peace and luxury, Villa Kaseh Ain offers an unparalleled coastal retreat where every detail is curated for your comfort.
                </motion.p>
              </div>
            </motion.div>

            <motion.div 
              className="lg:col-span-7 relative group"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="aspect-[16/10] lg:aspect-[1.4/1] overflow-hidden rounded-3xl shadow-2xl shadow-primary/5 ring-1 ring-outline-variant/10">
                <img 
                  alt="Luxury villa pool at sunset" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJFn5AX0BAt2-tAs7OvhFP-tu9IsYG2yZ_opf2R98VpJHPbduMfV7d1yx6BJKsxYgVS30wCaJRK95gHyPdqgbIDgoDR-Ehk7d0WEGRqYLbrf8Vjg5wVvOqSf45s1e2Mgg-5N6C8rWx6kyKo1VYV6ScvTLpZMS5l39QqejTFzzsT1Zks0WpHEuQPj98Z7j3nLWsFtnA-76OytwmYmTtsYlykCay7PjTy9EnnGtn0KfO2ZvrOb72Ck-S9ISHA-URKd08sWnQbY4G3gA"
                  referrerPolicy="no-referrer"
                />
              </div>
              <motion.div 
                className="absolute -bottom-8 -left-8 bg-surface-container-lowest p-10 rounded-2xl shadow-2xl shadow-primary/10 hidden xl:block max-w-xs border border-outline-variant/10"
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <p className="font-serif italic text-primary text-2xl leading-snug">
                  "A sanctuary for the soul and the senses."
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Contact Details */}
        <section className="bg-surface-container-lowest py-32 lg:py-48 border-y border-outline-variant/20">
          <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-40">
              <motion.div 
                className="space-y-16"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <div className="space-y-12">
                  <motion.h2 variants={fadeIn} className="text-4xl font-serif text-on-surface tracking-tight">
                    Get in Touch
                  </motion.h2>
                  <div className="space-y-10">
                    <motion.div variants={fadeIn} className="flex items-start gap-6">
                      <div className="bg-primary/5 p-3 rounded-full text-primary">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">Location</p>
                        <p className="text-on-surface text-lg">Lot 1234, Beachfront Avenue, <br/>Pantai Remis, Perak, Malaysia</p>
                      </div>
                    </motion.div>
                    
                    <motion.div variants={fadeIn} className="flex items-start gap-6">
                      <div className="bg-primary/5 p-3 rounded-full text-primary">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">WhatsApp / Phone</p>
                        <p className="text-on-surface text-lg">+60 12-345 6789</p>
                      </div>
                    </motion.div>

                    <motion.div variants={fadeIn} className="flex items-center gap-8 pt-6">
                      <a className="text-primary hover:scale-110 transition-transform flex items-center gap-2 group" href="#">
                        <Globe className="w-6 h-6" />
                        <span className="text-xs uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">Facebook</span>
                      </a>
                      <a className="text-primary hover:scale-110 transition-transform flex items-center gap-2 group" href="#">
                        <Instagram className="w-6 h-6" />
                        <span className="text-xs uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">Instagram</span>
                      </a>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-surface-container p-10 lg:p-20 rounded-[2.5rem] shadow-sm border border-outline-variant/10 flex flex-col justify-center"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h3 className="text-3xl font-serif mb-8 tracking-tight">Booking Inquiries</h3>
                <p className="text-on-surface-variant leading-relaxed text-lg mb-12">
                  We value your interest in Villa Kaseh Ain. Our dedicated team is here to assist with every detail of your reservation.
                </p>
                <div className="flex flex-col gap-6">
                  <div className="px-8 py-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-primary/60" />
                      <span className="text-sm font-semibold text-on-surface-variant">Average Response Time</span>
                    </div>
                    <span className="text-sm font-bold text-primary tracking-wide">Under 2 hours</span>
                  </div>
                  <div className="px-8 py-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-primary/60" />
                      <span className="text-sm font-semibold text-on-surface-variant">Check-in Window</span>
                    </div>
                    <span className="text-sm font-bold text-on-surface tracking-wide">03:00 PM — 08:00 PM</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="max-w-screen-2xl mx-auto px-6 md:px-12 -mt-16 mb-32 lg:mb-56">
          <motion.div 
            className="relative w-full aspect-[21/9] rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/10 group ring-1 ring-outline-variant/10"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <img 
              alt="Map location view" 
              className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbacshdq8EN_Lc0u09xZDlSPE9agLyfGA7Xc-5exuvpMKDfGoTDg1J_WlWH6c0CSmWZMaN2zEU7C1Jvz-CTv-j3Yf3_w6PUaNOhPkiQ8dphNK5dNRUPyEeo0UGwmgmJCteGQn-B6c7MXBlgpmayqGSSKZC91hWWt_Y_uowI4WNIhuLrqEqU6ATOWZOLpcxfF0kgd2SQxd-FWUTj_zDcp0fue0d-lAL0JuC94TxfysO1r6gHAPSQVvkFPyhKmKImqzHE4K6e4mdVUw"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-700 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <button className="bg-surface-container-lowest px-10 py-5 rounded-full shadow-2xl flex items-center gap-4 hover:bg-primary hover:text-on-primary transition-all duration-500 group/btn border border-outline-variant/10">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 group-hover/btn:bg-on-primary"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary group-hover/btn:bg-on-primary"></span>
                </span>
                <span className="text-xs font-bold tracking-[0.2em] uppercase">Open in Maps</span>
              </button>
            </div>
          </motion.div>
        </section>

        {/* Final CTA */}
        <section className="max-w-screen-md mx-auto px-6 text-center mb-32 lg:mb-56">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeIn} className="text-5xl lg:text-7xl font-serif text-on-surface mb-10 tracking-tight">
              Secure your stay at <br/>Villa Kaseh Ain.
            </motion.h2>
            <motion.p variants={fadeIn} className="text-on-surface-variant text-lg lg:text-xl mb-16 max-w-xl mx-auto leading-relaxed">
              Reach out to us today to lock in your preferred dates and begin your journey to tranquil coastal living.
            </motion.p>
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <button className="w-full sm:w-auto bg-primary text-on-primary px-12 py-5 rounded-2xl text-xs uppercase tracking-[0.2em] font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                <MessageCircle className="w-5 h-5 fill-current" />
                WhatsApp Us
              </button>
              <button className="w-full sm:w-auto border-2 border-outline-variant/30 px-12 py-5 rounded-2xl text-xs uppercase tracking-[0.2em] font-bold hover:bg-surface-container hover:border-primary/20 transition-all text-on-surface">
                Check Availability
              </button>
            </motion.div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-outline-variant/20 py-20">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-6 md:px-12 max-w-screen-2xl mx-auto space-y-12 md:space-y-0">
          <div className="font-serif text-2xl text-primary tracking-tight">
            Villa Kaseh Ain
          </div>
          <div className="flex gap-12 text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-on-surface-variant">
            <a className="hover:text-primary transition-colors" href="#">Privacy</a>
            <a className="hover:text-primary transition-colors" href="#">Terms</a>
            <a className="text-primary border-b-2 border-primary/20 pb-1" href="#">Contact</a>
          </div>
          <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-on-surface-variant/60 font-medium">
            © 2024 Villa Kaseh Ain. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
