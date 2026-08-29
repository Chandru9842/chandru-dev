/**
 * Dynamic Favicon and SEO Head Synchronizer
 * Updates the browser tab favicon and document title dynamically
 * based on CMS settings (Profile Favicon, SEO Logo, Website Logo).
 */

export function updateFavicon(iconUrl?: string) {
  if (!iconUrl) return;

  // Find or create primary icon link
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  link.href = iconUrl;
  if (iconUrl.startsWith('data:image/svg') || iconUrl.endsWith('.svg')) {
    link.type = 'image/svg+xml';
  } else if (iconUrl.startsWith('data:image/png') || iconUrl.endsWith('.png')) {
    link.type = 'image/png';
  }

  // Also update shortcut icon and apple touch icon for full compatibility
  let shortcut = document.querySelector<HTMLLinkElement>("link[rel='shortcut icon']");
  if (!shortcut) {
    shortcut = document.createElement('link');
    shortcut.rel = 'shortcut icon';
    document.getElementsByTagName('head')[0].appendChild(shortcut);
  }
  shortcut.href = iconUrl;

  let appleIcon = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
  if (!appleIcon) {
    appleIcon = document.createElement('link');
    appleIcon.rel = 'apple-touch-icon';
    document.getElementsByTagName('head')[0].appendChild(appleIcon);
  }
  appleIcon.href = iconUrl;
}

export function updateMetaTags(seoData?: {
  metaTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  faviconUrl?: string;
}) {
  if (!seoData) return;

  if (seoData.metaTitle) {
    document.title = seoData.metaTitle;
  }

  if (seoData.metaDescription) {
    let descMeta = document.querySelector<HTMLMetaElement>("meta[name='description']");
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.name = 'description';
      document.head.appendChild(descMeta);
    }
    descMeta.content = seoData.metaDescription;
  }

  if (seoData.ogTitle) {
    let ogTitleMeta = document.querySelector<HTMLMetaElement>("meta[property='og:title']");
    if (ogTitleMeta) ogTitleMeta.content = seoData.ogTitle;
  }

  if (seoData.ogDescription) {
    let ogDescMeta = document.querySelector<HTMLMetaElement>("meta[property='og:description']");
    if (ogDescMeta) ogDescMeta.content = seoData.ogDescription;
  }

  if (seoData.ogImage) {
    let ogImgMeta = document.querySelector<HTMLMetaElement>("meta[property='og:image']");
    if (ogImgMeta) ogImgMeta.content = seoData.ogImage;
  }

  if (seoData.faviconUrl) {
    updateFavicon(seoData.faviconUrl);
  }
}
