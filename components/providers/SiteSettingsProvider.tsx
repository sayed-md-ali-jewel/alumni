'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { DEFAULT_SITE_SETTINGS, SiteSettings } from '@/lib/siteSettings';

interface SiteSettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
  siteName: string;
  tagline: string;
  footerTagline: string;
  aboutText: string;
  copyrightText: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryBtnText: string;
  heroSecondaryBtnText: string;
  updateSettingsLocally: (newSettings: Partial<SiteSettings>) => void;
  refetch: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: DEFAULT_SITE_SETTINGS,
  isLoading: true,
  siteName: DEFAULT_SITE_SETTINGS.siteName_en,
  tagline: DEFAULT_SITE_SETTINGS.tagline_en,
  footerTagline: DEFAULT_SITE_SETTINGS.footerTagline_en,
  aboutText: DEFAULT_SITE_SETTINGS.about_en,
  copyrightText: DEFAULT_SITE_SETTINGS.copyright_en,
  heroBadge: DEFAULT_SITE_SETTINGS.heroBadge_en,
  heroTitle: DEFAULT_SITE_SETTINGS.heroTitle_en,
  heroSubtitle: DEFAULT_SITE_SETTINGS.heroSubtitle_en,
  heroPrimaryBtnText: DEFAULT_SITE_SETTINGS.heroPrimaryBtnText_en,
  heroSecondaryBtnText: DEFAULT_SITE_SETTINGS.heroSecondaryBtnText_en,
  updateSettingsLocally: () => {},
  refetch: async () => {},
});

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const isBn = locale === 'bn';

  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/site');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      }
    } catch (err) {
      console.warn('Failed to load dynamic site settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Dynamically update Favicon if custom faviconUrl is set
  useEffect(() => {
    if (typeof document !== 'undefined' && settings.faviconUrl) {
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.faviconUrl;
    }
  }, [settings.faviconUrl]);

  const updateSettingsLocally = useCallback((newSettings: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const siteName = isBn ? settings.siteName_bn : settings.siteName_en;
  const tagline = isBn ? settings.tagline_bn : settings.tagline_en;
  const footerTagline = isBn ? settings.footerTagline_bn : settings.footerTagline_en;
  const aboutText = isBn ? settings.about_bn : settings.about_en;
  const copyrightText = isBn ? settings.copyright_bn : settings.copyright_en;
  const heroBadge = isBn ? settings.heroBadge_bn || DEFAULT_SITE_SETTINGS.heroBadge_bn : settings.heroBadge_en || DEFAULT_SITE_SETTINGS.heroBadge_en;
  const heroTitle = isBn ? settings.heroTitle_bn || DEFAULT_SITE_SETTINGS.heroTitle_bn : settings.heroTitle_en || DEFAULT_SITE_SETTINGS.heroTitle_en;
  const heroSubtitle = isBn ? settings.heroSubtitle_bn || DEFAULT_SITE_SETTINGS.heroSubtitle_bn : settings.heroSubtitle_en || DEFAULT_SITE_SETTINGS.heroSubtitle_en;
  const heroPrimaryBtnText = isBn ? settings.heroPrimaryBtnText_bn || DEFAULT_SITE_SETTINGS.heroPrimaryBtnText_bn : settings.heroPrimaryBtnText_en || DEFAULT_SITE_SETTINGS.heroPrimaryBtnText_en;
  const heroSecondaryBtnText = isBn ? settings.heroSecondaryBtnText_bn || DEFAULT_SITE_SETTINGS.heroSecondaryBtnText_bn : settings.heroSecondaryBtnText_en || DEFAULT_SITE_SETTINGS.heroSecondaryBtnText_en;

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        isLoading,
        siteName,
        tagline,
        footerTagline,
        aboutText,
        copyrightText,
        heroBadge,
        heroTitle,
        heroSubtitle,
        heroPrimaryBtnText,
        heroSecondaryBtnText,
        updateSettingsLocally,
        refetch: fetchSettings,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}
