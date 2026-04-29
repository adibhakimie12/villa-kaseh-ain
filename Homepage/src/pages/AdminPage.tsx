import { FormEvent, useMemo, useState } from 'react';
import { Lock, LogOut, Plus, RefreshCw, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';
import { eachDateInRange, formatLongDate } from '../lib/date';

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
            Panel ni versi simple untuk urus content dan blocked dates. Untuk production nanti kita tukar ke login sebenar berasaskan backend.
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
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white"
              >
                Unlock Local Admin
              </button>
              <p className="text-xs text-on-surface-variant">
                Default passcode semasa: <span className="font-semibold text-on-surface">villa2026</span>
              </p>
            </form>

            <form className="space-y-4 rounded-[1.75rem] border border-stone-200/80 p-5" onSubmit={handleSupabaseLogin}>
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Supabase Admin Login</p>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none"
                  placeholder="admin@email.com"
                  disabled={!canUseSupabase || isLoading}
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
                  disabled={!canUseSupabase || isLoading}
                />
              </label>
              <button
                type="submit"
                disabled={!canUseSupabase || isLoading}
                className={`inline-flex items-center justify-center rounded-full px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] ${
                  canUseSupabase && !isLoading ? 'bg-[#22312d] text-white' : 'bg-stone-300 text-stone-500'
                }`}
              >
                {isLoading ? 'Signing In...' : 'Login with Supabase'}
              </button>
              <p className="text-xs text-on-surface-variant">
                {canUseSupabase
                  ? 'Guna account Supabase Auth yang dibenarkan dalam polisi SQL.'
                  : 'Isi env Supabase dulu untuk aktifkan mode sync merentas device.'}
              </p>
            </form>
          </div>

          {error || syncError ? <p className="mt-6 text-sm text-[#b34343]">{error || syncError}</p> : null}
        </section>
      </div>
    </main>
  );
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
  const blockedDates = content.bookingSettings.blockedDates;

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

  return (
    <main className="bg-[#eef2f5] px-4 pb-20 pt-28 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="lux-surface rounded-[2rem] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Admin Panel</p>
              <h1 className="mt-3 font-headline text-3xl md:text-5xl">Website Control Room</h1>
              <p className="mt-4 max-w-2xl text-sm text-on-surface-variant md:text-base">
                Apa yang awak edit di sini terus update pada browser semasa. Ini sesuai untuk prototype dan staging sebelum kita sambung ke database sebenar.
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
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-on-surface"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                Refresh Sync
              </button>
              <button
                type="button"
                onClick={resetContent}
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-on-surface"
              >
                <RotateCcw size={14} />
                Reset Demo Data
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <article className="lux-surface rounded-[2rem] p-6 md:p-8">
              <div className="flex items-center gap-2">
                <Save size={16} className="text-primary" />
                <h2 className="font-headline text-2xl">Basic Content</h2>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Tagline</span>
                  <input
                    value={content.siteConfig.tagline}
                    onChange={(event) => updateSiteConfigField('tagline', event.target.value)}
                    className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">WhatsApp Number</span>
                  <input
                    value={content.siteConfig.whatsappNumber}
                    onChange={(event) => updateSiteConfigField('whatsappNumber', event.target.value)}
                    className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Full Address</span>
                  <input
                    value={content.siteConfig.fullAddress}
                    onChange={(event) => updateSiteConfigField('fullAddress', event.target.value)}
                    className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Default WhatsApp Message</span>
                  <textarea
                    value={content.siteConfig.whatsappMessage}
                    onChange={(event) => updateSiteConfigField('whatsappMessage', event.target.value)}
                    className="lux-inset mt-2 min-h-28 w-full rounded-2xl px-4 py-4 text-sm outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Check-In</span>
                  <input
                    value={content.stayRules.checkInLabel}
                    onChange={(event) => updateStayRuleField('checkInLabel', event.target.value)}
                    className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Check-Out</span>
                  <input
                    value={content.stayRules.checkOutLabel}
                    onChange={(event) => updateStayRuleField('checkOutLabel', event.target.value)}
                    className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Response Window</span>
                  <textarea
                    value={content.stayRules.responseWindow}
                    onChange={(event) => updateStayRuleField('responseWindow', event.target.value)}
                    className="lux-inset mt-2 min-h-24 w-full rounded-2xl px-4 py-4 text-sm outline-none"
                  />
                </label>
              </div>
            </article>

            <article className="lux-surface rounded-[2rem] p-6 md:p-8">
              <h2 className="font-headline text-2xl">Rates</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {content.roomTypes.map((room) => (
                  <label key={room.id} className="block">
                    <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">{room.label}</span>
                    <input
                      type="number"
                      min={0}
                      value={room.price}
                      onChange={(event) => updateRoomPrice(room.id, event.target.value)}
                      className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none"
                    />
                  </label>
                ))}
              </div>
            </article>
          </div>

          <div className="space-y-8">
            <article className="lux-surface rounded-[2rem] p-6 md:p-8">
              <h2 className="font-headline text-2xl">Blocked Dates</h2>
              <p className="mt-3 text-sm text-on-surface-variant">
                Pilih range tarikh yang tak available. Website booking akan terus detect dan sekat pilihan yang overlap.
              </p>

              <div className="mt-6 grid gap-4">
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Start Date</span>
                  <input
                    type="date"
                    value={rangeStart}
                    onChange={(event) => setRangeStart(event.target.value)}
                    className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">End Date</span>
                  <input
                    type="date"
                    value={rangeEnd}
                    onChange={(event) => setRangeEnd(event.target.value)}
                    className="lux-inset mt-2 w-full rounded-2xl px-4 py-4 text-sm outline-none"
                  />
                </label>
                <button
                  type="button"
                  onClick={addBlockedRange}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white"
                >
                  <Plus size={14} />
                  Add Blocked Range
                </button>
              </div>
            </article>

            <article className="lux-surface-soft rounded-[2rem] p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-headline text-2xl">Unavailable List</h2>
                <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                  {blockedDates.length} blocked
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {blockedDateLabels.length ? (
                  blockedDateLabels.map((item) => (
                    <button
                      key={item.date}
                      type="button"
                      onClick={() => removeBlockedDate(item.date)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#d8b3b3] bg-[#fff2f2] px-4 py-2 text-sm text-[#8f3b3b]"
                    >
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
      </div>
    </main>
  );
}
