import { siteConfig } from '../data/site';

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-surface-container-low px-4 py-10 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 text-sm text-on-surface-variant md:flex-row md:items-center md:justify-between">
        <img
          src="/villa-kaseh-ain-logo-transparent.png"
          alt={`${siteConfig.name} logo`}
          className="h-auto w-full max-w-[240px] object-contain"
        />
        <p>{siteConfig.tagline}</p>
        <p>{`Copyright ${new Date().getFullYear()} ${siteConfig.name}`}</p>
      </div>
    </footer>
  );
}
