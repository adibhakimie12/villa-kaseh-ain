export interface SiteConfig {
  name: string;
  tagline: string;
  locationShort: string;
  fullAddress: string;
  whatsappNumber: string;
  whatsappMessage: string;
  facebookUrl: string;
  instagramUrl: string;
  mapsUrl: string;
}

export interface HeroMedia {
  video: string;
  poster: string;
}

export interface VillaFeature {
  title: string;
  description: string;
}

export interface RoomType {
  id: string;
  label: string;
  period: string;
  price: number;
}

export interface StayRules {
  checkInLabel: string;
  checkOutLabel: string;
  responseWindow: string;
}

export interface BookingSettings {
  blockedDates: string[];
}

export type PaymentStatus = 'Pending' | 'Deposit Paid' | 'Paid Full' | 'Failed' | 'Refunded' | 'Rejected';
export type BookingStatus = 'Confirmed' | 'Awaiting Payment' | 'Checked In' | 'Completed' | 'Cancelled';
export type BookingTypeOption = 'Deposit Only' | 'Full Payment Only' | 'Deposit + Full Payment Choice';
export type PaymentOptionSelected = 'Deposit' | 'Full Amount';
export type GatewayMode = 'Sandbox' | 'Live';
export type GatewayProvider = 'manual' | 'billplz' | 'senangPay' | 'stripe';

export interface BookingOrder {
  id: string;
  guestName: string;
  phone: string;
  email: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  pax: number;
  rateId: string;
  totalAmount: number;
  depositAmount: number;
  amountPaid: number;
  remainingBalance: number;
  paymentOptionSelected: PaymentOptionSelected;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  paidDate: string;
  receiptImage: string;
  receiptUploadedAt: string;
  paymentRejectedReason: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ManualPaymentSettings {
  enabled: boolean;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  qrImage: string;
  instructions: string;
}

export interface BillplzSettings {
  enabled: boolean;
  apiKey: string;
  xSignature: string;
  collectionId: string;
  mode: GatewayMode;
}

export interface SenangPaySettings {
  enabled: boolean;
  merchantId: string;
  secretKey: string;
}

export interface StripeSettings {
  enabled: boolean;
  publishableKey: string;
  secretKey: string;
}

export interface PaymentGatewaySettings {
  activeGateway: GatewayProvider;
  billplz: BillplzSettings;
  senangPay: SenangPaySettings;
  stripe: StripeSettings;
}

export interface PaymentRules {
  bookingType: BookingTypeOption;
  depositAmount: number;
  depositPercentage: number;
  autoCancelAfterHours: number;
  refundable: boolean;
}

export interface AutomationSettings {
  email: {
    bookingConfirmation: boolean;
    paymentSuccess: boolean;
    reminderBeforeCheckIn: boolean;
    balancePaymentReminder: boolean;
  };
  whatsapp: {
    afterBooking: boolean;
    afterPayment: boolean;
    checkInReminder: boolean;
  };
  adminAlerts: {
    newBooking: boolean;
    paymentReceived: boolean;
    ownerEmail: string;
    ownerWhatsappNumber: string;
  };
}

export interface WhatsappTemplateSettings {
  confirmationMessage: string;
}

export interface FutureModuleSettings {
  promoCodes: boolean;
  affiliateBookingAgent: boolean;
  otaSync: boolean;
  googleCalendarSync: boolean;
}

export interface SiteContent {
  siteConfig: SiteConfig;
  heroMedia: HeroMedia;
  villaFeatures: VillaFeature[];
  galleryImages: string[];
  roomTypes: RoomType[];
  stayRules: StayRules;
  bookingSettings: BookingSettings;
  bookingOrders: BookingOrder[];
  manualPayment: ManualPaymentSettings;
  paymentGateway: PaymentGatewaySettings;
  paymentRules: PaymentRules;
  automationSettings: AutomationSettings;
  whatsappTemplates: WhatsappTemplateSettings;
  futureModules: FutureModuleSettings;
}

type PaymentContentLike = Pick<SiteContent, 'manualPayment' | 'paymentGateway'>;

export const STORAGE_KEY = 'villa-kaseh-ain-site-content';
export const ADMIN_SESSION_KEY = 'villa-kaseh-ain-admin-session';
export const ADMIN_PASSCODE = 'villa2026';

export const defaultSiteContent: SiteContent = {
  siteConfig: {
    name: 'Villa Kaseh Ain',
    tagline: 'Private Beachfront Escape in Kampung Pasir Putih, Marang',
    locationShort: 'Kampung Pasir Putih, Marang',
    fullAddress: 'Villa Kaseh Ain, Kampung Pasir Putih, Marang, Terengganu, Malaysia',
    whatsappNumber: '60166341564',
    whatsappMessage:
      'Hi Villa Kaseh Ain, saya nak tanya availability dan harga untuk tarikh pilihan saya.',
    facebookUrl: 'https://www.facebook.com/villakasehain',
    instagramUrl: 'https://www.instagram.com/villakasehain?igsh=MWN2eHZ3azlyM3RtNA==',
    mapsUrl: 'https://maps.app.goo.gl/nLUFF1MZYwaEBrM38',
  },
  heroMedia: {
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    poster:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
  },
  villaFeatures: [
    { title: 'Private Pool', description: 'Kolam persendirian untuk keluarga dan group.' },
    { title: 'Beach Access', description: 'Akses terus ke kawasan pantai.' },
    { title: 'BBQ Area', description: 'Ruang BBQ santai untuk makan malam.' },
    { title: 'Large Family Space', description: 'Ruang tamu luas sesuai untuk gathering.' },
    { title: 'Air-Conditioned Rooms', description: 'Keselesaan penuh di setiap bilik.' },
    { title: 'Parking', description: 'Tempat parkir yang selesa dan selamat.' },
  ],
  galleryImages: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1600&q=80',
  ],
  roomTypes: [
    {
      id: 'weekday',
      label: 'Weekday Stay',
      period: 'Isnin - Khamis',
      price: 1500,
    },
    {
      id: 'weekend',
      label: 'Weekend & Holiday',
      period: 'Jumaat - Ahad / Cuti',
      price: 2200,
    },
    {
      id: 'event',
      label: 'Private Event Package',
      period: 'Custom',
      price: 2800,
    },
  ],
  stayRules: {
    checkInLabel: '3:00 PM',
    checkOutLabel: '12:00 PM',
    responseWindow: 'Kebiasaannya team akan reply dalam masa kurang 2 jam pada waktu operasi.',
  },
  bookingSettings: {
    blockedDates: [],
  },
  bookingOrders: [],
  manualPayment: {
    enabled: true,
    bankName: 'Maybank',
    accountHolderName: 'Villa Kaseh Ain Owner',
    accountNumber: '1234567890',
    qrImage: '',
    instructions:
      'Sila transfer jumlah bayaran ke akaun owner atau scan QR. Selepas bayar, upload receipt dan WhatsApp admin untuk pengesahan.',
  },
  paymentGateway: {
    activeGateway: 'manual',
    billplz: {
      enabled: false,
      apiKey: '',
      xSignature: '',
      collectionId: '',
      mode: 'Sandbox',
    },
    senangPay: {
      enabled: false,
      merchantId: '',
      secretKey: '',
    },
    stripe: {
      enabled: false,
      publishableKey: '',
      secretKey: '',
    },
  },
  paymentRules: {
    bookingType: 'Deposit + Full Payment Choice',
    depositAmount: 500,
    depositPercentage: 30,
    autoCancelAfterHours: 1,
    refundable: true,
  },
  automationSettings: {
    email: {
      bookingConfirmation: true,
      paymentSuccess: true,
      reminderBeforeCheckIn: true,
      balancePaymentReminder: true,
    },
    whatsapp: {
      afterBooking: true,
      afterPayment: true,
      checkInReminder: true,
    },
    adminAlerts: {
      newBooking: true,
      paymentReceived: true,
      ownerEmail: 'owner@villakasehain.com',
      ownerWhatsappNumber: '60166341564',
    },
  },
  whatsappTemplates: {
    confirmationMessage:
      'Hi {name},\nTerima kasih kerana booking Villa Kaseh Ain.\n\nTarikh:\n{checkin} - {checkout}\n\nJumlah:\nRM {amount}\n\nKami akan hubungi anda segera.',
  },
  futureModules: {
    promoCodes: false,
    affiliateBookingAgent: false,
    otaSync: false,
    googleCalendarSync: false,
  },
};

export function isManualPaymentConfigured(content: PaymentContentLike) {
  return Boolean(
    content.manualPayment.enabled
      && content.manualPayment.bankName.trim()
      && content.manualPayment.accountHolderName.trim()
      && content.manualPayment.accountNumber.trim(),
  );
}

export function isGatewayConfigured(content: PaymentContentLike, gateway: GatewayProvider) {
  if (gateway === 'manual') {
    return isManualPaymentConfigured(content);
  }

  if (gateway === 'billplz') {
    const settings = content.paymentGateway.billplz;
    return Boolean(settings.enabled && settings.apiKey.trim() && settings.xSignature.trim() && settings.collectionId.trim());
  }

  if (gateway === 'senangPay') {
    const settings = content.paymentGateway.senangPay;
    return Boolean(settings.enabled && settings.merchantId.trim() && settings.secretKey.trim());
  }

  const settings = content.paymentGateway.stripe;
  return Boolean(settings.enabled && settings.publishableKey.trim() && settings.secretKey.trim());
}

export function getEffectivePaymentGateway(content: PaymentContentLike): GatewayProvider {
  const activeGateway = content.paymentGateway.activeGateway;
  return isGatewayConfigured(content, activeGateway) ? activeGateway : 'manual';
}

function uniqueSortedDates(dates: string[]) {
  return Array.from(new Set(dates.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export function normalizeSiteContent(input?: Partial<SiteContent> | null): SiteContent {
  return {
    siteConfig: {
      ...defaultSiteContent.siteConfig,
      ...input?.siteConfig,
    },
    heroMedia: {
      ...defaultSiteContent.heroMedia,
      ...input?.heroMedia,
    },
    villaFeatures:
      input?.villaFeatures?.length === defaultSiteContent.villaFeatures.length
        ? input.villaFeatures
        : defaultSiteContent.villaFeatures,
    galleryImages:
      input?.galleryImages?.length === defaultSiteContent.galleryImages.length
        ? input.galleryImages
        : defaultSiteContent.galleryImages,
    roomTypes:
      input?.roomTypes?.length === defaultSiteContent.roomTypes.length
        ? input.roomTypes.map((room, index) => ({
            ...defaultSiteContent.roomTypes[index],
            ...room,
            price: Number(room.price ?? defaultSiteContent.roomTypes[index].price),
          }))
        : defaultSiteContent.roomTypes,
    stayRules: {
      ...defaultSiteContent.stayRules,
      ...input?.stayRules,
    },
    bookingSettings: {
      blockedDates: uniqueSortedDates(input?.bookingSettings?.blockedDates ?? defaultSiteContent.bookingSettings.blockedDates),
    },
    bookingOrders: Array.isArray(input?.bookingOrders)
      ? input.bookingOrders.map((order) => ({
          id: order.id || `VKA-${Date.now()}`,
          guestName: order.guestName || '',
          phone: order.phone || '',
          email: order.email || '',
          checkIn: order.checkIn || '',
          checkOut: order.checkOut || '',
          nights: Number(order.nights) || 0,
          pax: Number(order.pax) || 0,
          rateId: order.rateId || defaultSiteContent.roomTypes[0].id,
          totalAmount: Number(order.totalAmount) || 0,
          depositAmount: Number(order.depositAmount) || 0,
          amountPaid: Number(order.amountPaid) || 0,
          remainingBalance: Number(order.remainingBalance) || Number(order.totalAmount) || 0,
          paymentOptionSelected: order.paymentOptionSelected || 'Deposit',
          paymentStatus: order.paymentStatus || 'Pending',
          bookingStatus: order.bookingStatus || 'Awaiting Payment',
          paidDate: order.paidDate || '',
          receiptImage: order.receiptImage || '',
          receiptUploadedAt: order.receiptUploadedAt || '',
          paymentRejectedReason: order.paymentRejectedReason || '',
          notes: order.notes || '',
          createdAt: order.createdAt || new Date().toISOString(),
          updatedAt: order.updatedAt || new Date().toISOString(),
        }))
      : defaultSiteContent.bookingOrders,
    manualPayment: {
      ...defaultSiteContent.manualPayment,
      ...input?.manualPayment,
      enabled: Boolean(input?.manualPayment?.enabled ?? defaultSiteContent.manualPayment.enabled),
    },
    paymentGateway: {
      activeGateway: input?.paymentGateway?.activeGateway ?? defaultSiteContent.paymentGateway.activeGateway,
      billplz: {
        ...defaultSiteContent.paymentGateway.billplz,
        ...input?.paymentGateway?.billplz,
      },
      senangPay: {
        ...defaultSiteContent.paymentGateway.senangPay,
        ...input?.paymentGateway?.senangPay,
      },
      stripe: {
        ...defaultSiteContent.paymentGateway.stripe,
        ...input?.paymentGateway?.stripe,
      },
    },
    paymentRules: {
      ...defaultSiteContent.paymentRules,
      ...input?.paymentRules,
      bookingType: input?.paymentRules?.bookingType ?? defaultSiteContent.paymentRules.bookingType,
      depositAmount: Number(input?.paymentRules?.depositAmount ?? defaultSiteContent.paymentRules.depositAmount),
      depositPercentage: Number(input?.paymentRules?.depositPercentage ?? defaultSiteContent.paymentRules.depositPercentage),
      autoCancelAfterHours: Number(input?.paymentRules?.autoCancelAfterHours ?? defaultSiteContent.paymentRules.autoCancelAfterHours),
      refundable: Boolean(input?.paymentRules?.refundable ?? defaultSiteContent.paymentRules.refundable),
    },
    automationSettings: {
      email: {
        ...defaultSiteContent.automationSettings.email,
        ...input?.automationSettings?.email,
      },
      whatsapp: {
        ...defaultSiteContent.automationSettings.whatsapp,
        ...input?.automationSettings?.whatsapp,
      },
      adminAlerts: {
        ...defaultSiteContent.automationSettings.adminAlerts,
        ...input?.automationSettings?.adminAlerts,
      },
    },
    whatsappTemplates: {
      ...defaultSiteContent.whatsappTemplates,
      ...input?.whatsappTemplates,
    },
    futureModules: {
      ...defaultSiteContent.futureModules,
      ...input?.futureModules,
    },
  };
}

export function buildWhatsappUrl(siteConfig: SiteConfig, message?: string) {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    message ?? siteConfig.whatsappMessage,
  )}`;
}

export function loadSiteContent(): SiteContent {
  if (typeof window === 'undefined') {
    return defaultSiteContent;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultSiteContent;
    }
    return normalizeSiteContent(JSON.parse(raw));
  } catch {
    return defaultSiteContent;
  }
}

export function saveSiteContent(content: SiteContent) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeSiteContent(content)));
}
