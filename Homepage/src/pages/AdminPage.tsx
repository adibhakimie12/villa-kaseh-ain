import { FormEvent, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Bell,
  CalendarDays,
  CreditCard,
  Eye,
  Lock,
  LogOut,
  Mail,
  MessageCircle,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Settings,
  Trash2,
  X,
} from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';
import { eachDateInRange, formatLongDate, monthMatrix, toIsoDate } from '../lib/date';
import { buildNotificationRequest, sendNotificationRequest } from '../lib/notifications';
import {
  BookingFilter,
  buildBookingEmailBody,
  buildBookingMetrics,
  buildBookingTrend,
  getPaymentActionLabel,
  filterBookings,
  getAvailabilityStateForDate,
  renderBookingTemplate,
  rejectManualPayment,
  updateBookingStatus,
  verifyManualPayment,
} from '../lib/booking';
import type {
  AutomationSettings,
  BookingOrder,
  BookingTypeOption,
  GatewayProvider,
  PaymentStatus,
  BookingStatus,
} from '../lib/siteContent';

const bookingFilters: BookingFilter[] = ['Today', 'Upcoming', 'Paid', 'Pending', 'Cancelled'];
const bookingTypeOptions: BookingTypeOption[] = ['Deposit Only', 'Full Payment Only', 'Deposit + Full Payment Choice'];

function AdminLoginCard() {
  const { canUseSupabase, login, loginWithSupabase, syncError } = useSiteContent();
  const [passcode, setPasscode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ok = login(passcode);
    if (!ok) {
      setError('Passcode tak tepat. Cuba lagi.');
      return;
    }
    setError('');
  };

  const handleSupabaseLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await loginWithSupabase(email, password);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Tak dapat login ke Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-[#eef2f5] px-4 pb-20 pt-28 md:px-8">
      <div className="mx-auto max-w-xl">
        <section className="lux-surface rounded-[2rem] p-6 md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Admin Panel</p>
          <h1 className="mt-3 font-headline text-3xl md:text-5xl">Secure Access</h1>
          <p className="mt-4 text-sm text-on-surface-variant md:text-base">
            Panel ni versi simple untuk urus content, bookings, payment settings, dan calendar villa.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <form className="space-y-4 rounded-[1.75rem] border border-stone-200/80 p-5" onSubmit={handleSubmit}>
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Local Fallback</p>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Passcode</span>
                <div className="lux-inset mt-2 flex items-center gap-3 rounded-2xl px-4 py-4">
                  <Lock size={16} className="text-primary" />
                  <input
                    type="password"
                    value={passcode}
                    onChange={(event) => setPasscode(event.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="Masukkan passcode admin"
                  />
                </div>
              </label>

              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white"
              >
                Unlock Local Admin
              </button>
              <p className="text-xs text-on-surface-variant">
                Default passcode semasa: <span className="font-semibold text-on-surface">villa2026</span>
              </p>
            </form>

            <form className="space-y-4 rounded-[1.75rem] border border-stone-200/80 p-5" onSubmit={handleSupabaseLogin}>
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Admin Login</p>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none"
                  placeholder="admin@email.com"
                  disabled={isLoading}
                />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none"
                  placeholder="Password"
                  disabled={isLoading}
                />
              </label>
              <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex min-h-11 items-center justify-center rounded-full px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] ${
                  !isLoading ? 'bg-[#22312d] text-white' : 'bg-stone-300 text-stone-500'
                }`}
              >
                {isLoading ? 'Signing In...' : 'Login Admin'}
              </button>
              <p className="text-xs text-on-surface-variant">
                {canUseSupabase
                  ? 'Gunakan email dan password admin yang telah didaftarkan.'
                  : 'Login admin belum aktif pada build ini. Isi env Vercel dan redeploy untuk aktifkan sync.'}
              </p>
            </form>
          </div>

          {error || syncError ? <p className="mt-6 text-sm text-[#b34343]">{error || syncError}</p> : null}
        </section>
      </div>
    </main>
  );
}

function StatusChip({ value }: { value: PaymentStatus | BookingStatus | string }) {
  const tone =
    value === 'Paid Full' || value === 'Deposit Paid' || value === 'Confirmed' || value === 'Completed'
      ? 'border-[#9ec8b7] bg-[#eef8f4] text-[#2d6e61]'
      : value === 'Pending' || value === 'Awaiting Payment'
        ? 'border-[#ead38f] bg-[#fff7d7] text-[#7a6016]'
        : value === 'Cancelled' || value === 'Failed' || value === 'Refunded' || value === 'Rejected'
          ? 'border-[#e4b1aa] bg-[#fff1ef] text-[#9b3f35]'
          : 'border-stone-300 bg-white/50 text-on-surface-variant';

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${tone}`}>
      {value}
    </span>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">{children}</span>;
}

export function AdminPage() {
  const {
    canUseSupabase,
    content,
    isAdminAuthenticated,
    logout,
    refreshFromRemote,
    resetContent,
    syncError,
    syncMode,
    syncStatus,
    updateContent,
  } = useSiteContent();
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<BookingFilter>('Upcoming');
  const [selectedBookingId, setSelectedBookingId] = useState(content.bookingOrders[0]?.id ?? '');
  const [calendarAnchor, setCalendarAnchor] = useState(() => new Date());
  const [editingBookingId, setEditingBookingId] = useState('');
  const [adminView, setAdminView] = useState<'dashboard' | 'settings'>('dashboard');

  const today = toIsoDate(new Date());
  const blockedDates = content.bookingSettings.blockedDates;
  const selectedBooking = content.bookingOrders.find((order) => order.id === selectedBookingId) ?? null;
  const filteredBookings = useMemo(
    () => filterBookings(content.bookingOrders, activeFilter, today),
    [activeFilter, content.bookingOrders, today],
  );
  const metrics = useMemo(() => buildBookingMetrics(content.bookingOrders, today), [content.bookingOrders, today]);
  const last30DayBookings = useMemo(
    () => buildBookingTrend(content.bookingOrders, today).reduce((sum, item) => sum + item.count, 0),
    [content.bookingOrders, today],
  );

  const blockedDateLabels = useMemo(
    () => blockedDates.map((date) => ({ date, label: formatLongDate(date) })),
    [blockedDates],
  );

  if (!isAdminAuthenticated) {
    return <AdminLoginCard />;
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshFromRemote();
    } finally {
      setIsRefreshing(false);
    }
  };

  const updateSiteConfigField = (field: keyof typeof content.siteConfig, value: string) => {
    updateContent((current) => ({
      ...current,
      siteConfig: {
        ...current.siteConfig,
        [field]: value,
      },
    }));
  };

  const updateStayRuleField = (field: keyof typeof content.stayRules, value: string) => {
    updateContent((current) => ({
      ...current,
      stayRules: {
        ...current.stayRules,
        [field]: value,
      },
    }));
  };

  const updateRoomPrice = (roomId: string, price: string) => {
    updateContent((current) => ({
      ...current,
      roomTypes: current.roomTypes.map((room) =>
        room.id === roomId
          ? {
              ...room,
              price: Number(price) || 0,
            }
          : room,
      ),
    }));
  };

  const updateBooking = (bookingId: string, updater: (booking: BookingOrder) => BookingOrder) => {
    updateContent((current) => ({
      ...current,
      bookingOrders: current.bookingOrders.map((order) => (order.id === bookingId ? updater(order) : order)),
    }));
  };

  const setPaymentGateway = (gateway: GatewayProvider) => {
    updateContent((current) => ({
      ...current,
      paymentGateway: {
        ...current.paymentGateway,
        activeGateway: gateway,
      },
    }));
  };

  const updatePaymentRule = (field: keyof typeof content.paymentRules, value: number | boolean | BookingTypeOption) => {
    updateContent((current) => ({
      ...current,
      paymentRules: {
        ...current.paymentRules,
        [field]: value,
      },
    }));
  };

  const updateManualPaymentField = (field: keyof typeof content.manualPayment, value: string | boolean) => {
    updateContent((current) => ({
      ...current,
      manualPayment: {
        ...current.manualPayment,
        [field]: value,
      },
    }));
  };

  const handleManualQrUpload = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateManualPaymentField('qrImage', String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const updateAutomation = <Group extends keyof AutomationSettings, Field extends keyof AutomationSettings[Group]>(
    group: Group,
    field: Field,
    value: boolean,
  ) => {
    updateContent((current) => ({
      ...current,
      automationSettings: {
        ...current.automationSettings,
        [group]: {
          ...current.automationSettings[group],
          [field]: value,
        },
      },
    }));
  };

  const addBlockedRange = () => {
    if (!rangeStart || !rangeEnd) return;
    const dates = eachDateInRange(rangeStart, rangeEnd);
    updateContent((current) => ({
      ...current,
      bookingSettings: {
        blockedDates: [...current.bookingSettings.blockedDates, ...dates],
      },
    }));
    setRangeStart('');
    setRangeEnd('');
  };

  const removeBlockedDate = (date: string) => {
    updateContent((current) => ({
      ...current,
      bookingSettings: {
        blockedDates: current.bookingSettings.blockedDates.filter((value) => value !== date),
      },
    }));
  };

  const markManualPayment = (order: BookingOrder) => {
    if (order.paymentStatus === 'Paid Full') return;
    const nextStatus = order.paymentStatus === 'Deposit Paid' || order.paymentOptionSelected === 'Full Amount' ? 'Paid Full' : 'Deposit Paid';
    const nextOrder = verifyManualPayment(order, nextStatus, today);
    updateBooking(order.id, () => nextOrder);
    void sendNotificationRequest(buildNotificationRequest('payment-verified', nextOrder, content));
  };

  const rejectPayment = (order: BookingOrder) => {
    if (!window.confirm(`Reject payment receipt for ${order.id}? Dates will be released.`)) return;
    updateBooking(order.id, (current) => rejectManualPayment(current));
  };

  const cancelBooking = (order: BookingOrder) => {
    if (!window.confirm(`Cancel booking ${order.id}?`)) return;
    updateBooking(order.id, (current) => updateBookingStatus(current, current.paymentStatus, 'Cancelled'));
  };

  const openWhatsApp = (order: BookingOrder) => {
    const text = `Booking ID: ${order.id}\n\n${renderBookingTemplate(content.whatsappTemplates.confirmationMessage, order)}`;
    window.open(`https://wa.me/${order.phone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const openEmail = (order: BookingOrder) => {
    const subject = `Villa Kaseh Ain Booking ${order.id}`;
    const body = buildBookingEmailBody(order, content.manualPayment);
    window.open(`mailto:${order.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const metricCards = [
    { label: 'This Month Revenue', value: `RM ${metrics.thisMonthRevenue.toLocaleString()}` },
    { label: 'Upcoming Bookings', value: metrics.upcomingBookings.toString() },
    { label: 'Pending Payments', value: metrics.pendingPayments.toString() },
    { label: 'Occupancy Rate', value: `${metrics.occupancyRate}%` },
    { label: 'Average Stay Nights', value: metrics.averageStayNights.toString() },
  ];

  return (
    <main className="bg-[#eef2f5] px-4 pb-20 pt-28 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="lux-surface rounded-[2rem] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Admin Panel</p>
              <h1 className="mt-3 font-headline text-3xl md:text-5xl">Website Control Room</h1>
              <p className="mt-4 max-w-2xl text-sm text-on-surface-variant md:text-base">
                Urus content, booking orders, payment rules, calendar availability, dan auto notifications dalam satu dashboard.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-on-surface-variant">
                <span>{`Mode: ${syncMode}`}</span>
                <span>{`Status: ${syncStatus}`}</span>
                {canUseSupabase ? <span>Supabase Ready</span> : <span>Local Only</span>}
              </div>
              {syncError ? <p className="mt-3 text-sm text-[#b34343]">{syncError}</p> : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setAdminView(adminView === 'dashboard' ? 'settings' : 'dashboard')}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-on-surface"
              >
                {adminView === 'dashboard' ? <Settings size={14} /> : <SlidersHorizontal size={14} />}
                {adminView === 'dashboard' ? 'Settings' : 'Dashboard'}
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-on-surface"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                Refresh Sync
              </button>
              <button
                type="button"
                onClick={resetContent}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-on-surface"
              >
                <RotateCcw size={14} />
                Reset Demo Data
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>
        </section>

        <section className={`grid gap-4 md:grid-cols-5 ${adminView === 'dashboard' ? '' : 'hidden'}`}>
          {metricCards.map((card) => (
            <article key={card.label} className="lux-surface-soft rounded-[1.5rem] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">{card.label}</p>
              <p className="mt-3 font-headline text-3xl text-on-surface">{card.value}</p>
            </article>
          ))}
        </section>

        <section className={`lux-surface rounded-[2rem] p-6 md:p-8 ${adminView === 'dashboard' ? '' : 'hidden'}`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Booking Management</p>
              <h2 className="mt-2 font-headline text-3xl">Booking Orders</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {bookingFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`min-h-11 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] ${
                    activeFilter === filter ? 'bg-primary text-white' : 'border border-stone-300 text-on-surface'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr] xl:items-start">
            <div className="overflow-x-auto rounded-[1.5rem] border border-stone-200/80">
              <div className="hidden min-w-[1280px] grid-cols-[0.75fr_1fr_1fr_0.85fr_0.85fr_0.65fr_0.95fr_1.35fr_2fr] gap-4 bg-[#e8ded0] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant lg:grid">
                <span>Booking ID</span>
                <span>Guest Name</span>
                <span>Phone Number</span>
                <span>Check In</span>
                <span>Check Out</span>
                <span>Pax</span>
                <span>Total Amount</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              <div className="divide-y divide-stone-200/80">
                {filteredBookings.map((order) => (
                  <div key={order.id} className="grid gap-3 bg-[#f8f2e9] p-3 lg:min-w-[1280px] lg:grid-cols-[0.75fr_1fr_1fr_0.85fr_0.85fr_0.65fr_0.95fr_1.35fr_2fr] lg:items-center lg:gap-4">
                    <button type="button" onClick={() => setSelectedBookingId(order.id)} className="text-left font-semibold text-primary">
                      {order.id}
                    </button>
                    <div>
                      <p className="font-semibold">{order.guestName}</p>
                      <p className="text-xs text-on-surface-variant lg:hidden">{order.email}</p>
                    </div>
                    <span className="text-sm">{order.phone}</span>
                    <span className="text-sm">{formatLongDate(order.checkIn)}</span>
                    <span className="text-sm">{formatLongDate(order.checkOut)}</span>
                    <span className="text-sm">{order.pax} pax</span>
                    <span className="font-semibold">RM {order.totalAmount.toLocaleString()}</span>
                    <div className="flex flex-wrap gap-2">
                      <StatusChip value={order.paymentStatus} />
                      <StatusChip value={order.bookingStatus} />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button type="button" onClick={() => setSelectedBookingId(order.id)} className="inline-flex min-h-9 items-center gap-1 rounded-full border border-stone-300 px-3 py-1.5 text-[11px] font-semibold">
                        <Eye size={13} /> View
                      </button>
                      <button type="button" onClick={() => openWhatsApp(order)} className="inline-flex min-h-9 items-center gap-1 rounded-full border border-[#9ec8b7] px-3 py-1.5 text-[11px] font-semibold text-primary">
                        <MessageCircle size={13} /> WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => markManualPayment(order)}
                        disabled={order.paymentStatus === 'Paid Full'}
                        className={`inline-flex min-h-9 items-center rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                          order.paymentStatus === 'Paid Full' ? 'cursor-not-allowed bg-stone-300 text-stone-600' : 'bg-primary text-white'
                        }`}
                      >
                        {getPaymentActionLabel(order)}
                      </button>
                      <button type="button" onClick={() => cancelBooking(order)} className="inline-flex min-h-9 items-center rounded-full border border-[#d8aaa3] px-3 py-1.5 text-[11px] font-semibold text-[#9b3f35]">
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
                {!filteredBookings.length ? (
                  <p className="bg-[#f8f2e9] p-5 text-sm text-on-surface-variant">No booking orders for this filter.</p>
                ) : null}
              </div>
            </div>

            <article className="lux-surface-soft rounded-[1.75rem] p-5">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-primary" />
                <h3 className="font-headline text-2xl">Bookings Trend</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                Ringkasan berapa banyak booking baru masuk dalam 30 hari lepas.
              </p>
              <div className="mt-5 rounded-2xl border border-stone-200/80 bg-white/45 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">Last 30 Days</p>
                <p className="mt-2 font-headline text-4xl text-primary">{last30DayBookings}</p>
                <p className="mt-1 text-sm text-on-surface-variant">new booking orders</p>
              </div>
            </article>
          </div>
        </section>

        <section className={`grid gap-8 xl:grid-cols-[1.05fr_0.95fr] ${adminView === 'dashboard' ? '' : 'hidden'}`}>
          <article className="lux-surface rounded-[2rem] p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary">Availability</p>
                <h2 className="mt-2 font-headline text-3xl">Calendar Availability</h2>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setCalendarAnchor(new Date(calendarAnchor.getFullYear(), calendarAnchor.getMonth() - 1, 1))} className="min-h-11 rounded-full border border-stone-300 px-4 text-sm">Prev</button>
                <button type="button" onClick={() => setCalendarAnchor(new Date(calendarAnchor.getFullYear(), calendarAnchor.getMonth() + 1, 1))} className="min-h-11 rounded-full border border-stone-300 px-4 text-sm">Next</button>
              </div>
            </div>
            <p className="mt-3 text-sm text-on-surface-variant">
              Green available, red booked, yellow pending payment, grey manual blocked. Click booked or pending dates to view booking info.
            </p>
            <div className="mt-6 lux-surface-soft rounded-[1.75rem] p-5">
              <p className="font-headline text-2xl">
                {calendarAnchor.toLocaleString('en-MY', { month: 'long', year: 'numeric' })}
              </p>
              <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-7 gap-2">
                {monthMatrix(calendarAnchor).map((date) => {
                  const isoDate = toIsoDate(date);
                  const isCurrentMonth = date.getMonth() === calendarAnchor.getMonth();
                  const availability = getAvailabilityStateForDate(isoDate, content.bookingOrders, blockedDates);
                  const stateClass =
                    availability.state === 'booked'
                      ? 'bg-[#f8dede] text-[#a14646]'
                      : availability.state === 'pending'
                        ? 'bg-[#fff0bd] text-[#8b6b19]'
                        : availability.state === 'blocked'
                          ? 'bg-stone-300 text-stone-600'
                          : 'bg-[#e7f5ef] text-[#2d6e61]';
                  return (
                    <button
                      key={isoDate}
                      type="button"
                      onClick={() => availability.booking && setSelectedBookingId(availability.booking.id)}
                      className={`flex aspect-square min-h-11 items-center justify-center rounded-2xl text-sm font-semibold ${isCurrentMonth ? stateClass : 'bg-transparent text-stone-300'}`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </article>

          <div className="space-y-8">
            <article className="lux-surface rounded-[2rem] p-6 md:p-8">
              <h2 className="font-headline text-2xl">Blocked Dates</h2>
              <p className="mt-3 text-sm text-on-surface-variant">
                Pilih range tarikh yang tak available. Website booking akan terus detect dan sekat pilihan yang overlap.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <FieldLabel>Start Date</FieldLabel>
                  <input type="date" value={rangeStart} onChange={(event) => setRangeStart(event.target.value)} className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none" />
                </label>
                <label className="block">
                  <FieldLabel>End Date</FieldLabel>
                  <input type="date" value={rangeEnd} onChange={(event) => setRangeEnd(event.target.value)} className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none" />
                </label>
                <button type="button" onClick={addBlockedRange} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white md:col-span-2">
                  <Plus size={14} />
                  Add Blocked Range
                </button>
              </div>
            </article>

            <article className="lux-surface-soft rounded-[2rem] p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-headline text-2xl">Unavailable List</h2>
                <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">{blockedDates.length} blocked</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {blockedDateLabels.length ? (
                  blockedDateLabels.map((item) => (
                    <button key={item.date} type="button" onClick={() => removeBlockedDate(item.date)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#d8b3b3] bg-[#fff2f2] px-4 py-2 text-sm text-[#8f3b3b]">
                      {item.label}
                      <Trash2 size={14} />
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-on-surface-variant">Belum ada blocked date lagi.</p>
                )}
              </div>
            </article>
          </div>
        </section>

        <section className={`grid gap-8 xl:grid-cols-3 ${adminView === 'settings' ? '' : 'hidden'}`}>
          <article className="lux-surface rounded-[2rem] p-6 md:p-8">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-primary" />
              <h2 className="font-headline text-2xl">Manual Payment</h2>
            </div>
            <p className="mt-3 text-sm text-on-surface-variant">
              Guna bank account dan QR owner. Customer upload receipt, admin verify dalam Booking Orders.
            </p>
            <label className="mt-6 flex min-h-11 items-center justify-between gap-4 rounded-2xl border border-stone-200/80 px-4">
              <span className="text-sm font-semibold">Enable Manual Transfer</span>
              <input type="checkbox" checked={content.manualPayment.enabled} onChange={(event) => updateManualPaymentField('enabled', event.target.checked)} />
            </label>
            <div className="mt-4 space-y-4">
              <label className="block">
                <FieldLabel>Bank Name</FieldLabel>
                <input value={content.manualPayment.bankName} onChange={(event) => updateManualPaymentField('bankName', event.target.value)} className="lux-inset mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none" placeholder="Maybank" />
              </label>
              <label className="block">
                <FieldLabel>Account Holder Name</FieldLabel>
                <input value={content.manualPayment.accountHolderName} onChange={(event) => updateManualPaymentField('accountHolderName', event.target.value)} className="lux-inset mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none" placeholder="Nama owner" />
              </label>
              <label className="block">
                <FieldLabel>Account Number</FieldLabel>
                <input value={content.manualPayment.accountNumber} onChange={(event) => updateManualPaymentField('accountNumber', event.target.value)} className="lux-inset mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none" placeholder="1234567890" />
              </label>
              <label className="block">
                <FieldLabel>DuitNow / Bank QR Image</FieldLabel>
                <input type="file" accept="image/*" onChange={(event) => handleManualQrUpload(event.target.files?.[0])} className="lux-inset mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none" />
              </label>
              {content.manualPayment.qrImage ? (
                <img src={content.manualPayment.qrImage} alt="Owner payment QR" className="aspect-square w-full rounded-2xl border border-stone-200 object-cover" />
              ) : null}
              <label className="block">
                <FieldLabel>Payment Instructions</FieldLabel>
                <textarea value={content.manualPayment.instructions} onChange={(event) => updateManualPaymentField('instructions', event.target.value)} className="lux-inset mt-2 min-h-28 w-full rounded-2xl px-4 py-3 text-sm outline-none" />
              </label>
            </div>
            <label className="mt-6 block">
              <FieldLabel>Future Gateway Placeholder</FieldLabel>
              <select value={content.paymentGateway.activeGateway} onChange={(event) => setPaymentGateway(event.target.value as GatewayProvider)} className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none">
                <option value="manual">Manual Bank Transfer</option>
                <option value="billplz">Billplz</option>
                <option value="senangPay">senangPay</option>
                <option value="stripe">Stripe</option>
              </select>
            </label>

            <div className="mt-4 space-y-4 rounded-[1.5rem] border border-stone-200/80 p-4 opacity-70">
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Future Gateways</p>
              <div className="rounded-[1.5rem] border border-stone-200/80 p-4">
                <label className="flex min-h-11 items-center justify-between gap-3">
                  <span className="font-semibold">Billplz</span>
                  <input type="checkbox" checked={content.paymentGateway.billplz.enabled} onChange={(event) => updateContent((current) => ({ ...current, paymentGateway: { ...current.paymentGateway, billplz: { ...current.paymentGateway.billplz, enabled: event.target.checked } } }))} />
                </label>
                <input value={content.paymentGateway.billplz.apiKey} onChange={(event) => updateContent((current) => ({ ...current, paymentGateway: { ...current.paymentGateway, billplz: { ...current.paymentGateway.billplz, apiKey: event.target.value } } }))} className="lux-inset mt-3 w-full rounded-2xl px-4 py-3 text-sm outline-none" placeholder="API Key" />
                <input value={content.paymentGateway.billplz.xSignature} onChange={(event) => updateContent((current) => ({ ...current, paymentGateway: { ...current.paymentGateway, billplz: { ...current.paymentGateway.billplz, xSignature: event.target.value } } }))} className="lux-inset mt-3 w-full rounded-2xl px-4 py-3 text-sm outline-none" placeholder="X Signature" />
                <input value={content.paymentGateway.billplz.collectionId} onChange={(event) => updateContent((current) => ({ ...current, paymentGateway: { ...current.paymentGateway, billplz: { ...current.paymentGateway.billplz, collectionId: event.target.value } } }))} className="lux-inset mt-3 w-full rounded-2xl px-4 py-3 text-sm outline-none" placeholder="Collection ID" />
                <select value={content.paymentGateway.billplz.mode} onChange={(event) => updateContent((current) => ({ ...current, paymentGateway: { ...current.paymentGateway, billplz: { ...current.paymentGateway.billplz, mode: event.target.value as 'Sandbox' | 'Live' } } }))} className="lux-inset mt-3 w-full rounded-2xl px-4 py-3 text-sm outline-none">
                  <option>Sandbox</option>
                  <option>Live</option>
                </select>
              </div>

              <div className="rounded-[1.5rem] border border-stone-200/80 p-4">
                <label className="flex min-h-11 items-center justify-between gap-3">
                  <span className="font-semibold">senangPay</span>
                  <input type="checkbox" checked={content.paymentGateway.senangPay.enabled} onChange={(event) => updateContent((current) => ({ ...current, paymentGateway: { ...current.paymentGateway, senangPay: { ...current.paymentGateway.senangPay, enabled: event.target.checked } } }))} />
                </label>
                <input value={content.paymentGateway.senangPay.merchantId} onChange={(event) => updateContent((current) => ({ ...current, paymentGateway: { ...current.paymentGateway, senangPay: { ...current.paymentGateway.senangPay, merchantId: event.target.value } } }))} className="lux-inset mt-3 w-full rounded-2xl px-4 py-3 text-sm outline-none" placeholder="Merchant ID" />
                <input value={content.paymentGateway.senangPay.secretKey} onChange={(event) => updateContent((current) => ({ ...current, paymentGateway: { ...current.paymentGateway, senangPay: { ...current.paymentGateway.senangPay, secretKey: event.target.value } } }))} className="lux-inset mt-3 w-full rounded-2xl px-4 py-3 text-sm outline-none" placeholder="Secret Key" />
              </div>

              <div className="rounded-[1.5rem] border border-stone-200/80 p-4">
                <label className="flex min-h-11 items-center justify-between gap-3">
                  <span className="font-semibold">Stripe</span>
                  <input type="checkbox" checked={content.paymentGateway.stripe.enabled} onChange={(event) => updateContent((current) => ({ ...current, paymentGateway: { ...current.paymentGateway, stripe: { ...current.paymentGateway.stripe, enabled: event.target.checked } } }))} />
                </label>
                <input value={content.paymentGateway.stripe.publishableKey} onChange={(event) => updateContent((current) => ({ ...current, paymentGateway: { ...current.paymentGateway, stripe: { ...current.paymentGateway.stripe, publishableKey: event.target.value } } }))} className="lux-inset mt-3 w-full rounded-2xl px-4 py-3 text-sm outline-none" placeholder="Publishable Key" />
                <input value={content.paymentGateway.stripe.secretKey} onChange={(event) => updateContent((current) => ({ ...current, paymentGateway: { ...current.paymentGateway, stripe: { ...current.paymentGateway.stripe, secretKey: event.target.value } } }))} className="lux-inset mt-3 w-full rounded-2xl px-4 py-3 text-sm outline-none" placeholder="Secret Key" />
              </div>
            </div>
          </article>

          <article className="lux-surface rounded-[2rem] p-6 md:p-8">
            <div className="flex items-center gap-2">
              <Settings size={16} className="text-primary" />
              <h2 className="font-headline text-2xl">Payment Rules</h2>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <FieldLabel>Booking Type</FieldLabel>
                <div className="mt-3 space-y-2">
                  {bookingTypeOptions.map((option) => (
                    <label key={option} className="flex min-h-11 items-center gap-3 rounded-2xl border border-stone-200/80 px-4">
                      <input
                        type="radio"
                        name="admin-booking-type"
                        checked={content.paymentRules.bookingType === option}
                        onChange={() => updatePaymentRule('bookingType', option)}
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <label className="block">
                <FieldLabel>Deposit Amount</FieldLabel>
                <input type="number" value={content.paymentRules.depositAmount} onChange={(event) => updatePaymentRule('depositAmount', Number(event.target.value) || 0)} className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none" />
              </label>
              <label className="block">
                <FieldLabel>Deposit Percentage</FieldLabel>
                <input type="number" value={content.paymentRules.depositPercentage} onChange={(event) => updatePaymentRule('depositPercentage', Number(event.target.value) || 0)} className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none" />
              </label>
              <label className="block">
                <FieldLabel>Auto Cancel Unpaid Booking After (Hours)</FieldLabel>
                <input type="number" value={content.paymentRules.autoCancelAfterHours} onChange={(event) => updatePaymentRule('autoCancelAfterHours', Number(event.target.value) || 0)} className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none" />
              </label>
              <label className="flex min-h-11 items-center justify-between gap-4 rounded-2xl border border-stone-200/80 px-4">
                <span className="text-sm font-semibold">Refundable</span>
                <input type="checkbox" checked={content.paymentRules.refundable} onChange={(event) => updatePaymentRule('refundable', event.target.checked)} />
              </label>
              <button type="button" className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white">
                Test Payment
              </button>
            </div>
          </article>

          <article className="lux-surface rounded-[2rem] p-6 md:p-8">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-primary" />
              <h2 className="font-headline text-2xl">Auto Notifications</h2>
            </div>
            <div className="mt-6 space-y-5">
              <div>
                <FieldLabel>Email Toggles</FieldLabel>
                {[
                  ['bookingConfirmation', 'Booking Confirmation'],
                  ['paymentSuccess', 'Payment Success'],
                  ['reminderBeforeCheckIn', 'Reminder Before Check-in'],
                  ['balancePaymentReminder', 'Balance Payment Reminder'],
                ].map(([field, label]) => (
                  <label key={field} className="mt-2 flex min-h-11 items-center justify-between rounded-2xl border border-stone-200/80 px-4 text-sm">
                    {label}
                    <input type="checkbox" checked={Boolean(content.automationSettings.email[field as keyof AutomationSettings['email']])} onChange={(event) => updateAutomation('email', field as keyof AutomationSettings['email'], event.target.checked)} />
                  </label>
                ))}
              </div>
              <div>
                <FieldLabel>WhatsApp Toggles</FieldLabel>
                {[
                  ['afterBooking', 'Send After Booking'],
                  ['afterPayment', 'Send After Payment'],
                  ['checkInReminder', 'Send Check-in Reminder'],
                ].map(([field, label]) => (
                  <label key={field} className="mt-2 flex min-h-11 items-center justify-between rounded-2xl border border-stone-200/80 px-4 text-sm">
                    {label}
                    <input type="checkbox" checked={Boolean(content.automationSettings.whatsapp[field as keyof AutomationSettings['whatsapp']])} onChange={(event) => updateAutomation('whatsapp', field as keyof AutomationSettings['whatsapp'], event.target.checked)} />
                  </label>
                ))}
              </div>
              <div>
                <FieldLabel>Admin Alerts</FieldLabel>
                <label className="mt-2 block">
                  <span className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">Owner Email</span>
                  <input
                    type="email"
                    value={content.automationSettings.adminAlerts.ownerEmail}
                    onChange={(event) => updateContent((current) => ({
                      ...current,
                      automationSettings: {
                        ...current.automationSettings,
                        adminAlerts: {
                          ...current.automationSettings.adminAlerts,
                          ownerEmail: event.target.value,
                        },
                      },
                    }))}
                    className="lux-inset mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none"
                    placeholder="owner@email.com"
                  />
                </label>
                <label className="mt-3 block">
                  <span className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">Owner WhatsApp Number</span>
                  <input
                    type="tel"
                    value={content.automationSettings.adminAlerts.ownerWhatsappNumber}
                    onChange={(event) => updateContent((current) => ({
                      ...current,
                      automationSettings: {
                        ...current.automationSettings,
                        adminAlerts: {
                          ...current.automationSettings.adminAlerts,
                          ownerWhatsappNumber: event.target.value,
                        },
                      },
                    }))}
                    className="lux-inset mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none"
                    placeholder="60123456789"
                  />
                </label>
                <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">
                  Owner alerts guna contact ini. Email toggles hantar email, WhatsApp toggles hantar WhatsApp. Bila payment gateway live nanti, payment received alert trigger dari gateway/webhook.
                </p>
                {[
                  ['newBooking', 'Notify Owner New Booking'],
                  ['paymentReceived', 'Notify Owner Payment Received'],
                ].map(([field, label]) => (
                  <label key={field} className="mt-2 flex min-h-11 items-center justify-between rounded-2xl border border-stone-200/80 px-4 text-sm">
                    {label}
                    <input type="checkbox" checked={Boolean(content.automationSettings.adminAlerts[field as keyof AutomationSettings['adminAlerts']])} onChange={(event) => updateAutomation('adminAlerts', field as keyof AutomationSettings['adminAlerts'], event.target.checked)} />
                  </label>
                ))}
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <article className={`lux-surface rounded-[2rem] p-6 md:p-8 ${adminView === 'settings' ? '' : 'hidden'}`}>
            <h2 className="font-headline text-2xl">WhatsApp Template Settings</h2>
            <label className="mt-6 block">
              <FieldLabel>Default Confirmation Message</FieldLabel>
              <textarea
                value={content.whatsappTemplates.confirmationMessage}
                onChange={(event) => updateContent((current) => ({ ...current, whatsappTemplates: { confirmationMessage: event.target.value } }))}
                className="lux-inset mt-2 min-h-64 w-full rounded-2xl px-4 py-4 text-sm outline-none"
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white">
                <Save size={14} />
                Save Template
              </button>
              <button type="button" onClick={() => selectedBooking && openWhatsApp(selectedBooking)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-300 px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-on-surface">
                <MessageCircle size={14} />
                Test Send
              </button>
            </div>
          </article>

          <article className={`lux-surface rounded-[2rem] p-6 md:p-8 ${adminView === 'dashboard' ? '' : 'hidden'}`}>
            <div className="flex items-center gap-2">
              <Save size={16} className="text-primary" />
              <h2 className="font-headline text-2xl">Basic Content</h2>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block">
                <FieldLabel>Tagline</FieldLabel>
                <input value={content.siteConfig.tagline} onChange={(event) => updateSiteConfigField('tagline', event.target.value)} className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none" />
              </label>
              <label className="block">
                <FieldLabel>WhatsApp Number</FieldLabel>
                <input value={content.siteConfig.whatsappNumber} onChange={(event) => updateSiteConfigField('whatsappNumber', event.target.value)} className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none" />
              </label>
              <label className="block md:col-span-2">
                <FieldLabel>Full Address</FieldLabel>
                <input value={content.siteConfig.fullAddress} onChange={(event) => updateSiteConfigField('fullAddress', event.target.value)} className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none" />
              </label>
              <label className="block md:col-span-2">
                <FieldLabel>Default WhatsApp Message</FieldLabel>
                <textarea value={content.siteConfig.whatsappMessage} onChange={(event) => updateSiteConfigField('whatsappMessage', event.target.value)} className="lux-inset mt-2 min-h-28 w-full rounded-2xl px-4 py-4 text-sm outline-none" />
              </label>
              <label className="block">
                <FieldLabel>Check-In</FieldLabel>
                <input value={content.stayRules.checkInLabel} onChange={(event) => updateStayRuleField('checkInLabel', event.target.value)} className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none" />
              </label>
              <label className="block">
                <FieldLabel>Check-Out</FieldLabel>
                <input value={content.stayRules.checkOutLabel} onChange={(event) => updateStayRuleField('checkOutLabel', event.target.value)} className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none" />
              </label>
              <label className="block md:col-span-2">
                <FieldLabel>Response Window</FieldLabel>
                <textarea value={content.stayRules.responseWindow} onChange={(event) => updateStayRuleField('responseWindow', event.target.value)} className="lux-inset mt-2 min-h-24 w-full rounded-2xl px-4 py-4 text-sm outline-none" />
              </label>
            </div>
          </article>
        </section>

        <section className={`lux-surface rounded-[2rem] p-6 md:p-8 ${adminView === 'dashboard' ? '' : 'hidden'}`}>
          <h2 className="font-headline text-2xl">Rates</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {content.roomTypes.map((room) => (
              <label key={room.id} className="block">
                <FieldLabel>{room.label}</FieldLabel>
                <input type="number" min={0} value={room.price} onChange={(event) => updateRoomPrice(room.id, event.target.value)} className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none" />
              </label>
            ))}
          </div>
        </section>
      </div>

      {selectedBooking ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#1d2b28]/45 p-3 backdrop-blur-sm md:p-6" role="dialog" aria-modal="true">
          <aside className="lux-surface h-full w-full max-w-xl overflow-y-auto rounded-[2rem] p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary">Booking Detail</p>
                <h2 className="mt-2 font-headline text-3xl">{selectedBooking.id}</h2>
              </div>
              <button type="button" onClick={() => { setSelectedBookingId(''); setEditingBookingId(''); }} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-stone-300">
                <X size={18} />
              </button>
            </div>

            <div className="mt-8 grid gap-5">
              <section className="rounded-[1.5rem] border border-stone-200/80 p-5">
                <h3 className="font-headline text-2xl">Guest Information</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <p><span className="text-on-surface-variant">Name:</span> {selectedBooking.guestName}</p>
                  <p><span className="text-on-surface-variant">Phone:</span> {selectedBooking.phone}</p>
                  <p><span className="text-on-surface-variant">Email:</span> {selectedBooking.email}</p>
                </div>
              </section>
              <section className="rounded-[1.5rem] border border-stone-200/80 p-5">
                <h3 className="font-headline text-2xl">Stay Details</h3>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <p><span className="text-on-surface-variant">Check-in:</span><br />{formatLongDate(selectedBooking.checkIn)}</p>
                  <p><span className="text-on-surface-variant">Check-out:</span><br />{formatLongDate(selectedBooking.checkOut)}</p>
                  <p><span className="text-on-surface-variant">Nights:</span><br />{selectedBooking.nights}</p>
                  <p><span className="text-on-surface-variant">Pax:</span><br />{selectedBooking.pax}</p>
                </div>
              </section>
              <section className="rounded-[1.5rem] border border-stone-200/80 p-5">
                <h3 className="font-headline text-2xl">Payment</h3>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span>Amount</span><span>RM {selectedBooking.totalAmount.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Deposit</span><span>RM {selectedBooking.depositAmount.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Amount Paid</span><span>RM {selectedBooking.amountPaid.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Remaining Balance</span><span>RM {selectedBooking.remainingBalance.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Payment Option Selected</span><span>{selectedBooking.paymentOptionSelected}</span></div>
                  <div className="flex justify-between"><span>Paid Date</span><span>{selectedBooking.paidDate || 'Not paid yet'}</span></div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusChip value={selectedBooking.paymentStatus} />
                  <StatusChip value={selectedBooking.bookingStatus} />
                </div>
                <div className="mt-4 rounded-2xl border border-stone-200/80 bg-white/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Payment Proof</p>
                  {selectedBooking.receiptImage ? (
                    <>
                      <p className="mt-2 text-xs text-on-surface-variant">
                        Uploaded {selectedBooking.receiptUploadedAt ? new Date(selectedBooking.receiptUploadedAt).toLocaleString('en-MY') : 'recently'}
                      </p>
                      <img src={selectedBooking.receiptImage} alt={`Receipt for ${selectedBooking.id}`} className="mt-3 max-h-72 w-full rounded-xl object-contain" />
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-on-surface-variant">No receipt uploaded yet.</p>
                  )}
                  {selectedBooking.paymentRejectedReason ? (
                    <p className="mt-3 text-sm text-[#9b3f35]">{selectedBooking.paymentRejectedReason}</p>
                  ) : null}
                </div>
              </section>
              <section className="rounded-[1.5rem] border border-stone-200/80 p-5">
                <h3 className="font-headline text-2xl">Notes</h3>
                <textarea
                  value={selectedBooking.notes}
                  disabled={editingBookingId !== selectedBooking.id}
                  onChange={(event) => updateBooking(selectedBooking.id, (order) => ({ ...order, notes: event.target.value, updatedAt: new Date().toISOString() }))}
                  className="lux-inset mt-3 min-h-28 w-full rounded-2xl px-4 py-4 text-sm outline-none disabled:opacity-80"
                />
              </section>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => updateBooking(selectedBooking.id, (order) => updateBookingStatus(order, order.paymentStatus, 'Confirmed'))} className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white">
                Confirm Booking
              </button>
              <button type="button" onClick={() => openWhatsApp(selectedBooking)} className="inline-flex min-h-11 items-center rounded-full border border-stone-300 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em]">
                Send Reminder
              </button>
              <button type="button" onClick={() => openEmail(selectedBooking)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em]">
                <Mail size={14} />
                Send Email
              </button>
              <button type="button" onClick={() => openWhatsApp(selectedBooking)} className="inline-flex min-h-11 items-center rounded-full border border-stone-300 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em]">
                Request Balance
              </button>
              <button
                type="button"
                onClick={() => markManualPayment(selectedBooking)}
                disabled={selectedBooking.paymentStatus === 'Paid Full'}
                className={`inline-flex min-h-11 items-center rounded-full px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] ${
                  selectedBooking.paymentStatus === 'Paid Full' ? 'cursor-not-allowed bg-stone-300 text-stone-600' : 'bg-primary text-white'
                }`}
              >
                {getPaymentActionLabel(selectedBooking)}
              </button>
              <button type="button" onClick={() => rejectPayment(selectedBooking)} className="inline-flex min-h-11 items-center rounded-full border border-[#d8aaa3] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#9b3f35]">
                Reject Payment
              </button>
              <button type="button" onClick={() => updateBooking(selectedBooking.id, (order) => updateBookingStatus(order, 'Refunded', 'Cancelled'))} className="inline-flex min-h-11 items-center rounded-full border border-[#d8aaa3] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#9b3f35]">
                Refund
              </button>
              <button type="button" onClick={() => { setSelectedBookingId(''); setEditingBookingId(''); }} className="inline-flex min-h-11 items-center rounded-full border border-stone-300 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em]">
                Close
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
