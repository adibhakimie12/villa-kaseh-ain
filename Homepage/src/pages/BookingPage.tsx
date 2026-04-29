import { useMemo, useState } from 'react';
import { CalendarDays, Users, CheckCircle2 } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';
import { eachNightInStay, formatLongDate, monthMatrix, toIsoDate } from '../lib/date';

function dayDiff(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function BookingPage() {
  const { content } = useSiteContent();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestCount, setGuestCount] = useState(6);
  const [selectedRate, setSelectedRate] = useState(content.roomTypes[0]);

  const blockedDates = content.bookingSettings.blockedDates;
  const blockedDateSet = useMemo(() => new Set(blockedDates), [blockedDates]);

  const nights = dayDiff(checkIn, checkOut);
  const maxIncludedGuests = 25;
  const extraGuestRatePerPersonPerNight = 50;
  const extraGuests = Math.max(guestCount - maxIncludedGuests, 0);

  const overlappingBlockedDates = useMemo(() => {
    return eachNightInStay(checkIn, checkOut).filter((date) => blockedDateSet.has(date));
  }, [blockedDateSet, checkIn, checkOut]);

  const isSelectionAvailable = Boolean(checkIn && checkOut && overlappingBlockedDates.length === 0);

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

  const whatsappUrl = useMemo(() => {
    const message = [
      'Hi Villa Kaseh Ain, saya nak buat booking.',
      checkIn ? `Check-in: ${checkIn}` : null,
      checkOut ? `Check-out: ${checkOut}` : null,
      `Guests: ${guestCount}`,
      `Rate: ${selectedRate.label}`,
      nights > 0 ? `Estimated Total: RM ${summary.total.toLocaleString()}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    return `https://wa.me/${content.siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }, [checkIn, checkOut, content.siteConfig.whatsappNumber, guestCount, nights, selectedRate.label, summary.total]);

  const today = toIsoDate(new Date());
  const calendarAnchors = [new Date(), new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)];

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
                <input type="date" min={today} className="w-full bg-transparent text-sm outline-none" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </div>
            </label>
            <label className="lux-inset rounded-2xl p-4">
              <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Check-Out</span>
              <div className="mt-2 flex items-center gap-2">
                <CalendarDays size={16} className="text-primary" />
                <input type="date" min={checkIn || today} className="w-full bg-transparent text-sm outline-none" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
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
            {content.roomTypes.map((room) => (
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

          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            {calendarAnchors.map((anchor) => {
              const days = monthMatrix(anchor);
              return (
                <div key={`${anchor.getFullYear()}-${anchor.getMonth()}`} className="lux-surface-soft rounded-[1.75rem] p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Availability</p>
                    <p className="font-headline text-2xl">
                      {anchor.toLocaleString('en-MY', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-7 gap-2">
                    {days.map((date) => {
                      const isoDate = toIsoDate(date);
                      const isCurrentMonth = date.getMonth() === anchor.getMonth();
                      const isBlocked = blockedDateSet.has(isoDate);
                      const isPast = isoDate < today;
                      const isSelected = isoDate === checkIn || isoDate === checkOut;
                      return (
                        <div
                          key={isoDate}
                          className={`flex aspect-square items-center justify-center rounded-2xl text-sm ${
                            !isCurrentMonth
                              ? 'bg-transparent text-stone-300'
                              : isBlocked
                                ? 'bg-[#f8dede] font-semibold text-[#a14646]'
                                : isSelected
                                  ? 'bg-primary font-semibold text-white'
                                  : 'lux-inset text-on-surface'
                          } ${isPast ? 'opacity-45' : ''}`}
                        >
                          {date.getDate()}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-[#d9c9b4] bg-[#fff8ef] p-5">
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em]">
              <span className="inline-flex items-center gap-2 text-on-surface-variant">
                <span className="h-3 w-3 rounded-full bg-primary" />
                Selected
              </span>
              <span className="inline-flex items-center gap-2 text-on-surface-variant">
                <span className="h-3 w-3 rounded-full bg-[#f8dede]" />
                Unavailable
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {blockedDates.length ? (
                blockedDates.slice(0, 12).map((date) => (
                  <span key={date} className="rounded-full bg-[#f5d8d8] px-4 py-2 text-sm text-[#8f3b3b]">
                    {formatLongDate(date)}
                  </span>
                ))
              ) : (
                <p className="text-sm text-on-surface-variant">Buat masa ini semua tarikh masih available.</p>
              )}
            </div>
          </div>

          {overlappingBlockedDates.length > 0 ? (
            <div className="mt-6 rounded-[1.5rem] border border-[#e6b6b6] bg-[#fff2f2] p-5 text-sm text-[#8f3b3b]">
              Tarikh yang dipilih bertindih dengan unavailable date:
              {' '}
              {overlappingBlockedDates.map(formatLongDate).join(', ')}
            </div>
          ) : null}
        </section>

        <aside className="lux-surface-soft h-fit rounded-[2rem] p-6 md:p-8 lg:sticky lg:top-28">
          <h2 className="font-headline text-2xl">Booking Summary</h2>
          <div className="mt-6 space-y-3 text-sm text-on-surface-variant">
            <p>{`Nights: ${nights}`}</p>
            <p>{`Guests: ${guestCount}`}</p>
            <p>{`Rate: ${selectedRate.label}`}</p>
            <p>{`Status: ${isSelectionAvailable ? 'Available to proceed' : 'Please review selected dates'}`}</p>
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
            href={isSelectionAvailable ? whatsappUrl : undefined}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!isSelectionAvailable}
            className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] ${
              isSelectionAvailable ? 'bg-primary text-white' : 'cursor-not-allowed bg-stone-300 text-stone-500'
            }`}
          >
            {isSelectionAvailable ? 'Continue via WhatsApp' : 'Selected Dates Unavailable'}
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
