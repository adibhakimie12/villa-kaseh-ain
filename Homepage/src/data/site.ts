import { buildWhatsappUrl, defaultSiteContent } from '../lib/siteContent';

export { buildWhatsappUrl } from '../lib/siteContent';
export {
  defaultSiteContent as siteContent,
  defaultSiteContent,
} from '../lib/siteContent';
export const siteConfig = defaultSiteContent.siteConfig;
export const heroMedia = defaultSiteContent.heroMedia;
export const villaFeatures = defaultSiteContent.villaFeatures;
export const galleryImages = defaultSiteContent.galleryImages;
export const roomTypes = defaultSiteContent.roomTypes;
export type RoomType = (typeof roomTypes)[number];
export const whatsappUrl = buildWhatsappUrl(siteConfig);
