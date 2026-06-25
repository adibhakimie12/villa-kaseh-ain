import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Users, CheckCircle2, CreditCard, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteContent } from '../context/SiteContentContext';
import { createBookingViaApi, uploadReceiptViaApi } from '../lib/apiClient';
import { eachNightInStay, monthMatrix, toIsoDate } from '../lib/date';
import {
  buildCustomerPaymentWhatsappMessage,
  dayDiff,
  getExtraGuestCharge,
  getAllowedPaymentOptions,
  getBookingBalance,
  getAutomaticRateForStay,
  getPaymentDueNow,
  getRoomRateSubtotal,
  getAvailabilityStateForDate,
  getPublicRoomRates,
  getPublicGuestOptions,
  isRateSelectionValid,
  selectBookingCalendarDate,
} from '../lib/booking';
import {
  formatLongDateByLanguage,
  getLanguageLocale,
  getRoomRatePriceCaptionByLanguage,
  translateSiteContent,
} from '../lib/i18n';
import type { BookingOrder, PaymentOptionSelected } from '../lib/siteContent';

export function BookingPage() {
  const { content, updateContent } = useSiteContent();
  const { language, t } = useLanguage();
  const displayContent = translateSiteContent(content, language);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestCount, setGuestCount] = useState(20);
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submittedOrder, setSubmittedOrder] = useState<BookingOrder | null>(null);
  const [paymentOptionSelected, setPaymentOptionSelected] = useState<PaymentOptionSelected>('Deposit');
  const [calendarOffset, setCalendarOffset] = useState(0);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const blockedDates = content.bookingSettings.blockedDates;
  const activeSubmittedOrder = useMemo(
    () => (submittedOrder ? content.bookingOrders.find((order) => order.id === submittedOrder.id) ?? submittedOrder : null),
    [content.bookingOrders, submittedOrder],
  );

  const nights = dayDiff(checkIn, checkOut);
  const guestOptions = useMemo(() => getPublicGuestOptions(), []);
  const publicRoomRates = useMemo(() => getPublicRoomRates(displayContent.roomTypes), [displayContent.roomTypes]);
  const selectedRate = useMemo(
    () => getAutomaticRateForStay(displayContent.roomTypes, checkIn, checkOut, content.bookingSettings.publicHolidayDates),
    [checkIn, checkOut, content.bookingSettings.publicHolidayDates, displayContent.roomTypes],
  );
  const maxIncludedGuests = 25;
  const extraGuestRatePerPersonPerNight = 50;
  const extraGuests = Math.max(guestCount - maxIncludedGuests, 0);

  const overlappingBlockedDates = useMemo(() => {
    return eachNightInStay(checkIn, checkOut).filter((date) => {
      const availability = getAvailabilityStateForDate(date, content.bookingOrders, blockedDates);
      return availability.state !== 'available';
    });
  }, [blockedDates, checkIn, checkOut, content.bookingOrders]);

  const isSelectionAvailable = Boolean(checkIn && checkOut && overlappingBlockedDates.length === 0);
  const isRateValid = isRateSelectionValid(selectedRate, nights);
  const canSubmitBooking = isSelectionAvailable && nights > 0 && guestName.trim() && phone.trim() && email.trim() && isRateValid;

  const summary = useMemo(() => {
    const subtotal = getRoomRateSubtotal(selectedRate, nights);
    const service = subtotal * 0.1;
    const extraGuestCharge = getExtraGuestCharge(guestCount, nights, extraGuestRatePerPersonPerNight, maxIncludedGuests);
    const tax = nights > 0 ? 40 : 0;
    return {
      subtotal,
      service,
      extraGuestCharge,
      tax,
      total: subtotal + service + extraGuestCharge + tax,
    };
  }, [guestCount, nights, selectedRate]);

  const allowedPaymentOptions = useMemo(() => getAllowedPaymentOptions(content.paymentRules), [content.paymentRules]);
  const bookingBalance = useMemo(() => getBookingBalance(summary.total, content.paymentRules), [content.paymentRules, summary.total]);

  useEffect(() => {
    if (!allowedPaymentOptions.includes(paymentOptionSelected)) {
      setPaymentOptionSelected(allowedPaymentOptions[0]);
    }
  }, [allowedPaymentOptions, paymentOptionSelected]);

  const whatsappUrl = useMemo(() => {
    const message = [
      t('booking.whatsappMessageIntro'),
      checkIn ? `Check-in: ${checkIn}` : null,
      checkOut ? `Check-out: ${checkOut}` : null,
      `${t('booking.guests')}: ${guestCount}`,
      `Rate: ${selectedRate.label}`,
      nights > 0 ? `${t('booking.totalEstimate')}: RM ${summary.total.toLocaleString()}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    return `https://wa.me/${content.siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }, [checkIn, checkOut, content.siteConfig.whatsappNumber, guestCount, nights, selectedRate.label, summary.total, t]);

  const handleCreateBooking = async () => {
    if (!canSubmitBooking) return;
    setBookingError('');
    setIsSubmittingBooking(true);

    try {
      const response = await createBookingViaApi({
        guestName: guestName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        checkIn,
        checkOut,
        pax: guestCount,
        rateId: selectedRate.id,
        totalAmount: summary.total,
        paymentOptionSelected,
        notes: notes.trim(),
      });
      const order = response.booking;
      updateContent((current) => ({
        ...current,
        bookingOrders: [order, ...current.bookingOrders.filter((item) => item.id !== order.id)],
      }));
      setSubmittedOrder(order);
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Tak dapat cipta booking. Sila cuba lagi atau WhatsApp admin.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleReceiptUpload = (file: File | undefined) => {
    if (!file || !activeSubmittedOrder) return;
    if (file.size > 5 * 1024 * 1024) {
      window.alert(t('booking.receiptTooLarge'));
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      setBookingError('');
      try {
        const response = await uploadReceiptViaApi({
          bookingId: activeSubmittedOrder.id,
          receiptImage: String(reader.result || ''),
        });
        const nextOrder = response.booking;
        setSubmittedOrder(nextOrder);
        updateContent((current) => ({
          ...current,
          bookingOrders: current.bookingOrders.map((order) => (order.id === nextOrder.id ? nextOrder : order)),
        }));
      } catch (error) {
        setBookingError(error instanceof Error ? error.message : 'Tak dapat upload receipt. Sila cuba lagi.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(content.manualPayment.accountNumber);
      setCopiedAccount(true);
      window.setTimeout(() => setCopiedAccount(false), 1800);
    } catch {
      window.alert(t('booking.copyFailed'));
    }
  };

  const amountDueNow = activeSubmittedOrder
    ? getPaymentDueNow(activeSubmittedOrder.totalAmount, activeSubmittedOrder.depositAmount, activeSubmittedOrder.paymentOptionSelected)
    : 0;
  const receiptIsPdf = Boolean(activeSubmittedOrder?.receiptImage?.startsWith('data:application/pdf'));
  const receiptBadge = activeSubmittedOrder?.paymentRejectedReason
    ? {
        tone: 'border-[#e4b1aa] bg-[#fff1ef] text-[#9b3f35]',
              title: t('booking.reuploadReceipt'),
        description: activeSubmittedOrder.paymentRejectedReason,
      }
    : activeSubmittedOrder?.paymentStatus === 'Deposit Paid' || activeSubmittedOrder?.paymentStatus === 'Paid Full'
      ? {
          tone: 'border-[#9ec8b7] bg-[#eef8f4] text-[#2d6e61]',
          title: t('booking.confirmed'),
          description: t('booking.confirmedCopy'),
        }
      : activeSubmittedOrder?.receiptImage
        ? {
            tone: 'border-[#ead38f] bg-[#fff7d7] text-[#7a6016]',
            title: t('booking.receiptSubmitted'),
            description: t('booking.receiptSubmittedCopy'),
          }
        : null;

  const today = toIsoDate(new Date());
  const calendarAnchors = useMemo(() => {
    const baseDate = new Date();
    return [
      new Date(baseDate.getFullYear(), baseDate.getMonth() + calendarOffset, 1),
      new Date(baseDate.getFullYear(), baseDate.getMonth() + calendarOffset + 1, 1),
    ];
  }, [calendarOffset]);

  const handleCalendarDateClick = (isoDate: string, isAvailable: boolean, isCurrentMonth: boolean) => {
    if (!isAvailable || !isCurrentMonth || isoDate < today) return;
    const nextSelection = selectBookingCalendarDate({ checkIn, checkOut, selectedDate: isoDate });
    setCheckIn(nextSelection.checkIn);
    setCheckOut(nextSelection.checkOut);
  };

  return (
    <main className="bg-[#eef2f5] px-4 pb-20 pt-28 md:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.5fr_1fr]">
        <section className="lux-surface rounded-[2rem] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">{t('booking.kicker')}</p>
          <h1 className="mt-3 font-headline text-3xl md:text-5xl">{t('booking.title')}</h1>
          <p className="mt-4 max-w-2xl text-sm text-on-surface-variant md:text-base">
            {t('booking.copy')}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <label className="lux-inset rounded-2xl p-4">
              <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">{t('booking.checkIn')}</span>
              <div className="mt-2 flex items-center gap-2">
                <CalendarDays size={16} className="text-primary" />
                <input type="date" min={today} className="w-full bg-transparent text-sm outline-none" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </div>
            </label>
            <label className="lux-inset rounded-2xl p-4">
              <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">{t('booking.checkOut')}</span>
              <div className="mt-2 flex items-center gap-2">
                <CalendarDays size={16} className="text-primary" />
                <input type="date" min={checkIn || today} className="w-full bg-transparent text-sm outline-none" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
              </div>
            </label>
            <label className="lux-inset rounded-2xl p-4">
              <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">{t('booking.guests')}</span>
              <div className="mt-2 flex items-center gap-2">
                <Users size={16} className="text-primary" />
                <select
                  className="w-full bg-transparent text-sm outline-none"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                >
                  {guestOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === 30
                        ? t('booking.guestsExtraOption', { count: option })
                        : t('booking.guestsOption', { count: option })}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {publicRoomRates.map((room) => (
              <div
                key={room.id}
                className={`rounded-2xl border p-5 text-left ${
                  selectedRate.id === room.id ? 'border-primary bg-primary/5' : 'lux-surface-soft border-transparent'
                }`}
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">{room.period}</p>
                <p className="mt-2 font-headline text-xl">{room.label}</p>
                <p className="mt-2 text-lg font-semibold text-primary">RM {room.price.toLocaleString()}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">{getRoomRatePriceCaptionByLanguage(room, language)}</p>
                {room.note ? <p className="mt-3 text-sm text-on-surface-variant">{room.note}</p> : null}
              </div>
            ))}
          </div>

          {nights > 0 && content.bookingSettings.publicHolidayDates.some((date) => eachNightInStay(checkIn, checkOut).includes(date)) ? (
            <div className="mt-4 rounded-[1.5rem] border border-[#ead38f] bg-[#fff7d7] p-4 text-sm text-[#7a6016]">
              {t('booking.publicHoliday')}
            </div>
          ) : null}

          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            <div className="xl:col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-stone-200/80 bg-white/45 px-4 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">{t('booking.browseDates')}</p>
                <p className="mt-1 text-sm text-on-surface-variant">{t('booking.browseDatesCopy')}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCalendarOffset((current) => Math.max(current - 1, 0))}
                  disabled={calendarOffset === 0}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] ${
                    calendarOffset === 0
                      ? 'cursor-not-allowed bg-stone-200 text-stone-500'
                      : 'border border-stone-300 text-on-surface'
                  }`}
                >
                  <ChevronLeft size={14} />
                  {t('booking.previous')}
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarOffset((current) => current + 1)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white"
                >
                  {t('booking.next')}
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            {calendarAnchors.map((anchor) => {
              const days = monthMatrix(anchor);
              return (
                <div key={`${anchor.getFullYear()}-${anchor.getMonth()}`} className="lux-surface-soft rounded-[1.75rem] p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">{t('booking.availability')}</p>
                    <p className="font-headline text-2xl">
                      {anchor.toLocaleString(getLanguageLocale(language), { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">
                    {Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(getLanguageLocale(language), { weekday: 'short' }).format(new Date(2026, 1, index + 1))).map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-7 gap-2">
                    {days.map((date) => {
                      const isoDate = toIsoDate(date);
                      const isCurrentMonth = date.getMonth() === anchor.getMonth();
                      const availability = getAvailabilityStateForDate(isoDate, content.bookingOrders, blockedDates);
                      const isPast = isoDate < today;
                      const isSelected = isoDate === checkIn || isoDate === checkOut;
                      const isUnavailable = availability.state !== 'available';
                      return (
                        <button
                          type="button"
                          key={isoDate}
                          onClick={() => handleCalendarDateClick(isoDate, availability.state === 'available', isCurrentMonth)}
                          disabled={!isCurrentMonth || availability.state !== 'available' || isPast}
                          className={`flex aspect-square items-center justify-center rounded-2xl text-sm ${
                            !isCurrentMonth
                              ? 'bg-transparent text-stone-300'
                              : isSelected
                                  ? 'bg-primary font-semibold text-white'
                                  : isUnavailable
                                    ? 'bg-[#f8dede] font-semibold text-[#a14646]'
                                  : 'lux-inset text-on-surface'
                          } ${isPast ? 'opacity-45' : ''} ${isCurrentMonth && availability.state === 'available' && !isPast ? 'cursor-pointer transition hover:ring-2 hover:ring-primary/30' : 'cursor-not-allowed'}`}
                        >
                          {date.getDate()}
                        </button>
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
                {t('booking.selected')}
              </span>
              <span className="inline-flex items-center gap-2 text-on-surface-variant">
                <span className="h-3 w-3 rounded-full bg-[#f8dede]" />
                {t('booking.unavailable')}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {content.bookingOrders.length || blockedDates.length ? (
                [...new Set([
                  ...content.bookingOrders.flatMap((order) => eachNightInStay(order.checkIn, order.checkOut)),
                  ...blockedDates,
                ])]
                  .sort()
                  .slice(0, 12)
                  .map((date) => (
                  <span key={date} className="rounded-full bg-[#f5d8d8] px-4 py-2 text-sm text-[#8f3b3b]">
                    {formatLongDateByLanguage(date, language)}
                  </span>
                  ))
              ) : (
                <p className="text-sm text-on-surface-variant">{t('booking.noUnavailableDates')}</p>
              )}
            </div>
          </div>

          {overlappingBlockedDates.length > 0 ? (
            <div className="mt-6 rounded-[1.5rem] border border-[#e6b6b6] bg-[#fff2f2] p-5 text-sm text-[#8f3b3b]">
              {t('booking.overlap')}
              {' '}
              {overlappingBlockedDates.map((date) => formatLongDateByLanguage(date, language)).join(', ')}
            </div>
          ) : null}
        </section>

        <aside className="lux-surface-soft h-fit rounded-[2rem] p-6 md:p-8 lg:sticky lg:top-28">
          <h2 className="font-headline text-2xl">{t('booking.summary')}</h2>
          <div className="mt-6 space-y-3 text-sm text-on-surface-variant">
            <p>{t('booking.nights', { count: nights })}</p>
            <p>{t('booking.summaryGuests', { count: guestCount })}</p>
            <p>{t('booking.rate', { rate: selectedRate.label })}</p>
            <p>{t('booking.status', { status: isSelectionAvailable && isRateValid ? t('booking.statusAvailable') : t('booking.statusReview') })}</p>
          </div>

          <div className="lux-inset mt-6 space-y-2 rounded-2xl p-4 text-sm">
            <div className="flex justify-between">
              <span>{t('booking.subtotal')}</span>
              <span>{`RM ${summary.subtotal.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('booking.service')}</span>
              <span>{`RM ${summary.service.toLocaleString()}`}</span>
            </div>
            {summary.extraGuestCharge > 0 && (
              <div className="flex justify-between">
                <span>{t('booking.extraGuestCharge', { count: extraGuests })}</span>
                <span>{`RM ${summary.extraGuestCharge.toLocaleString()}`}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>{t('booking.tourismTax')}</span>
              <span>{`RM ${summary.tax.toLocaleString()}`}</span>
            </div>
            <div className="mt-3 border-t border-stone-200 pt-3 text-base font-semibold text-on-surface">
              <div className="flex justify-between">
                <span>{t('booking.totalEstimate')}</span>
                <span>{`RM ${summary.total.toLocaleString()}`}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-[#d9c9b4] bg-[#fff8ef] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">{t('booking.paymentOption')}</p>
            <div className="mt-4 grid gap-3">
              {allowedPaymentOptions.map((option) => {
                const amount = getPaymentDueNow(summary.total, bookingBalance.depositAmount, option);
                return (
                  <label key={option} className="flex min-h-11 items-center justify-between gap-3 rounded-2xl border border-stone-200/80 px-4 py-3 text-sm">
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment-option"
                        checked={paymentOptionSelected === option}
                        onChange={() => setPaymentOptionSelected(option)}
                      />
                      {option === 'Deposit'
                        ? t('booking.payDeposit', { amount: bookingBalance.depositAmount.toLocaleString() })
                        : t('booking.payFull')}
                    </span>
                    <span className="font-semibold text-primary">RM {amount.toLocaleString()}</span>
                  </label>
                );
              })}
            </div>
            <div className="mt-4 rounded-2xl border border-[#d9c9b4] bg-white/55 px-4 py-3 text-sm text-on-surface-variant">
              <span className="font-medium text-on-surface">
                {'\u23f3'} {t('booking.holdExpires', { hours: content.paymentRules.autoCancelAfterHours })}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">{t('booking.guestName')}</span>
              <input
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
                className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none"
                placeholder={t('booking.guestNamePlaceholder')}
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">{t('booking.phoneNumber')}</span>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none"
                placeholder="60123456789"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">{t('booking.email')}</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none"
                placeholder="nama@email.com"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">{t('booking.notes')}</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="lux-inset mt-2 min-h-24 w-full rounded-2xl px-4 py-4 text-sm outline-none"
                placeholder={t('booking.notesPlaceholder')}
              />
            </label>
          </div>

          {activeSubmittedOrder ? (
            <div className="mt-6 rounded-[1.75rem] border border-[#d9c9b4] bg-[#fff8ef] p-5">
              <div className="flex items-center gap-2 text-primary">
                <CreditCard size={16} />
                <p className="text-xs font-bold uppercase tracking-[0.2em]">{t('booking.securePayment')}</p>
              </div>
              <h3 className="mt-3 font-headline text-2xl">{activeSubmittedOrder.id}</h3>
              <p className="mt-2 text-sm text-on-surface-variant">
                {t('booking.paymentCopy')}
              </p>
              <div className="mt-4 grid gap-2 text-sm text-on-surface-variant">
                {[
                  t('booking.confirmation15'),
                  t('booking.datesReserved'),
                  t('booking.officialReceipt'),
                  t('booking.dailySupport'),
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 text-[#5f9788]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-stone-200/80 bg-white/45 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">{t('booking.officialAccount')}</p>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">{t('booking.bankName')}</p>
                    <p className="mt-1 font-semibold">{displayContent.manualPayment.bankName}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">{t('booking.accountHolder')}</p>
                    <p className="mt-1 text-on-surface-variant">{displayContent.manualPayment.accountHolderName}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">{t('booking.accountNumber')}</p>
                    <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-lg font-bold text-primary">{displayContent.manualPayment.accountNumber}</p>
                      <button
                        type="button"
                        onClick={handleCopyAccountNumber}
                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface"
                      >
                        {copiedAccount ? t('booking.copied') : t('booking.copyNumber')}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">{displayContent.manualPayment.instructions}</p>
                <div className="mt-4 rounded-2xl border border-stone-200/80 bg-white/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">{t('booking.quickPayQr')}</p>
                  {displayContent.manualPayment.qrImage ? (
                    <img src={displayContent.manualPayment.qrImage} alt="Owner payment QR" className="mt-3 aspect-square w-full rounded-2xl object-cover" />
                  ) : (
                    <p className="mt-3 text-xs text-on-surface-variant">{t('booking.qrPending')}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-stone-200/80 bg-white/45 p-4 text-sm">
                <div className="flex justify-between">
                  <span>{t('booking.paymentOption')}</span>
                  <span>{activeSubmittedOrder.paymentOptionSelected}</span>
                </div>
                <div className="mt-2 flex justify-between">
                  <span>{t('booking.amountDueNow')}</span>
                  <span>{`RM ${amountDueNow.toLocaleString()}`}</span>
                </div>
                <div className="mt-2 flex justify-between">
                  <span>{t('booking.remainingBalance')}</span>
                  <span>{`RM ${activeSubmittedOrder.remainingBalance.toLocaleString()}`}</span>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
                  {t('booking.balanceCopy')}
                </p>
              </div>
              <label className="mt-4 block">
                <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">{t('booking.uploadReceipt')}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,application/pdf"
                  onChange={(event) => handleReceiptUpload(event.target.files?.[0])}
                  className="lux-inset mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none"
                />
                <p className="mt-2 text-xs text-on-surface-variant">{t('booking.acceptedFiles')}</p>
                <p className="text-xs text-on-surface-variant">{t('booking.maxSize')}</p>
              </label>
              {receiptBadge ? (
                <div className={`mt-4 rounded-2xl border p-4 ${receiptBadge.tone}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]">{receiptBadge.title}</p>
                  <p className="mt-2 text-sm">{receiptBadge.description}</p>
                </div>
              ) : null}
              {activeSubmittedOrder.receiptImage ? (
                <div className="mt-4 rounded-2xl border border-[#9ec8b7] bg-[#eef8f4] p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{t('booking.uploadedReceipt')}</p>
                  {receiptIsPdf ? (
                    <a
                      href={activeSubmittedOrder.receiptImage}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex min-h-11 items-center rounded-full border border-[#9ec8b7] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary"
                    >
                      {t('booking.openPdf')}
                    </a>
                  ) : (
                    <img src={activeSubmittedOrder.receiptImage} alt={t('booking.receiptAlt')} className="mt-3 max-h-56 w-full rounded-xl object-contain" />
                  )}
                </div>
              ) : null}
              <a
                href={`https://wa.me/${content.automationSettings.adminAlerts.ownerWhatsappNumber || content.siteConfig.whatsappNumber}?text=${encodeURIComponent(
                  buildCustomerPaymentWhatsappMessage(activeSubmittedOrder, content.manualPayment),
                )}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#22312d] px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-[0_18px_45px_rgba(34,49,45,0.18)] md:shadow-none lg:shadow-none max-md:fixed max-md:bottom-4 max-md:left-4 max-md:right-4 max-md:z-30"
              >
                {t('booking.whatsappConfirmation')}
              </a>
              <p className="mt-4 text-center text-xs text-on-surface-variant max-md:mb-20">{t('booking.privacyCopy')}</p>
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleCreateBooking}
            disabled={!canSubmitBooking || isSubmittingBooking}
            className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] ${
              canSubmitBooking && !isSubmittingBooking ? 'bg-primary text-white' : 'cursor-not-allowed bg-stone-300 text-stone-500'
            }`}
          >
            {isSubmittingBooking
              ? 'Creating Booking...'
              : checkIn && checkOut
              ? (isSelectionAvailable && isRateValid ? t('booking.createPending') : t('booking.selectedUnavailable'))
              : t('booking.selectDates')}
          </button>
          {bookingError ? <p className="mt-4 text-sm text-[#b34343]">{bookingError}</p> : null}

          <a
            href={isSelectionAvailable ? whatsappUrl : undefined}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!isSelectionAvailable}
            className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] ${
              isSelectionAvailable ? 'border-primary text-primary' : 'cursor-not-allowed border-stone-300 text-stone-500'
            }`}
          >
            <MessageCircle size={14} />
            {t('booking.whatsappFallback')}
          </a>

          <ul className="mt-6 space-y-2 text-sm text-on-surface-variant">
            {[...displayContent.stayInformation.capacityNotes, ...displayContent.stayInformation.timingNotes, ...displayContent.stayInformation.bookingPolicyNotes].map((note) => (
              <li key={note} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> {note}</li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  );
}
