import { useMemo, useState } from 'react';
import { CalendarDays, Users, CheckCircle2 } from 'lucide-react';
import { roomTypes, whatsappUrl } from '../data/site';

function dayDiff(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function BookingPage() {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestCount, setGuestCount] = useState(6);
  const [selectedRate, setSelectedRate] = useState(roomTypes[0]);

  const nights = dayDiff(checkIn, checkOut);
  const maxIncludedGuests = 25;
  const extraGuestRatePerPersonPerNight = 50;
  const extraGuests = Math.max(guestCount - maxIncludedGuests, 0);

  const summary = useMemo(() => {
    const subtotal = nights * selectedRate.price;
    const service = subtotal * 0.1;
    const extraGuestCharge = extraGuests * extraGuestRatePerPersonPerNight * nights;
    const tax = nights > 0 ? 40 : 0;
    return {
      subtotal,
      service,
      extraGuestCharge,
      tax,
      total: subtotal + service + extraGuestCharge + tax,
    };
  }, [extraGuests, nights, selectedRate.price]);

  return (
    <main className="bg-[#eef2f5] px-4 pb-20 pt-28 md:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.5fr_1fr]">
        <section className="lux-surface rounded-[2rem] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Booking Engine</p>
          <h1 className="mt-3 font-headline text-3xl md:text-5xl">Reserve Your Stay</h1>
          <p className="mt-4 max-w-2xl text-sm text-on-surface-variant md:text-base">
            Pilih tarikh, rate pilihan, dan jumlah tetamu. Anggaran kos akan dikira automatik.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <label className="lux-inset rounded-2xl p-4">
              <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Check-In</span>
              <div className="mt-2 flex items-center gap-2">
                <CalendarDays size={16} className="text-primary" />
                <input type="date" className="w-full bg-transparent text-sm outline-none" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </div>
            </label>
            <label className="lux-inset rounded-2xl p-4">
              <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Check-Out</span>
              <div className="mt-2 flex items-center gap-2">
                <CalendarDays size={16} className="text-primary" />
                <input type="date" className="w-full bg-transparent text-sm outline-none" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
              </div>
            </label>
            <label className="lux-inset rounded-2xl p-4">
              <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Guests</span>
              <div className="mt-2 flex items-center gap-2">
                <Users size={16} className="text-primary" />
                <select
                  className="w-full bg-transparent text-sm outline-none"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                >
                  <option value={4}>4 Guests</option>
                  <option value={6}>6 Guests</option>
                  <option value={8}>8 Guests</option>
                  <option value={10}>10 Guests</option>
                  <option value={15}>15 Guests</option>
                  <option value={20}>20 Guests</option>
                  <option value={25}>25 Guests (Max Included)</option>
                  <option value={30}>30 Guests (Extra Charge)</option>
                </select>
              </div>
            </label>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {roomTypes.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => setSelectedRate(room)}
                className={`rounded-2xl border p-5 text-left transition ${
                  selectedRate.id === room.id ? 'border-primary bg-primary/5' : 'lux-surface-soft border-transparent'
                }`}
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">{room.period}</p>
                <p className="mt-2 font-headline text-xl">{room.label}</p>
                <p className="mt-2 text-lg font-semibold text-primary">RM {room.price.toLocaleString()}</p>
              </button>
            ))}
          </div>
        </section>

        <aside className="lux-surface-soft h-fit rounded-[2rem] p-6 md:p-8 lg:sticky lg:top-28">
          <h2 className="font-headline text-2xl">Booking Summary</h2>
          <div className="mt-6 space-y-3 text-sm text-on-surface-variant">
            <p>{`Nights: ${nights}`}</p>
            <p>{`Guests: ${guestCount}`}</p>
            <p>{`Rate: ${selectedRate.label}`}</p>
          </div>

          <div className="lux-inset mt-6 space-y-2 rounded-2xl p-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{`RM ${summary.subtotal.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Service (10%)</span>
              <span>{`RM ${summary.service.toLocaleString()}`}</span>
            </div>
            {summary.extraGuestCharge > 0 && (
              <div className="flex justify-between">
                <span>{`Extra Guest Charge (${extraGuests} pax)`}</span>
                <span>{`RM ${summary.extraGuestCharge.toLocaleString()}`}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tourism Tax</span>
              <span>{`RM ${summary.tax.toLocaleString()}`}</span>
            </div>
            <div className="mt-3 border-t border-stone-200 pt-3 text-base font-semibold text-on-surface">
              <div className="flex justify-between">
                <span>Total Estimate</span>
                <span>{`RM ${summary.total.toLocaleString()}`}</span>
              </div>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white"
          >
            Continue via WhatsApp
          </a>

          <ul className="mt-6 space-y-2 text-sm text-on-surface-variant">
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Fast response from host</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Flexible inquiry for events</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Family-friendly setup</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> 30 guests available with extra charge</li>
          </ul>
        </aside>
      </div>
    </main>
  );
}
