'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Heart, ExternalLink, Sparkles } from 'lucide-react';
import { WhatsAppIcon, FacebookIcon } from '@/components/icons/SocialIcons';

interface CommunitySettingsState {
  communityName_en: string;
  communityName_bn: string;
  whatsappUrl: string;
  whatsappNumber?: string;
  facebookUrl: string;
  websiteUrl?: string;
  customPrefix_en: string;
  customPrefix_bn: string;
  customFor_en: string;
  customFor_bn: string;
  enabled: boolean;
  showSocialBadges: boolean;
}

const DEFAULT_STATE: CommunitySettingsState = {
  communityName_en: 'our Alumni Community',
  communityName_bn: 'আমাদের অ্যালামনাই কমিউনিটি',
  whatsappUrl: '',
  whatsappNumber: '',
  facebookUrl: '',
  websiteUrl: '',
  customPrefix_en: 'Built with',
  customPrefix_bn: 'ভালোবাসা দিয়ে নির্মিত',
  customFor_en: 'for',
  customFor_bn: 'আমাদের',
  enabled: true,
  showSocialBadges: true,
};

export function CommunityFooterBadge() {
  const locale = useLocale();
  const isBn = locale === 'bn';

  const [settings, setSettings] = useState<CommunitySettingsState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings/community');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data) {
            setSettings({
              communityName_en: data.communityName_en || DEFAULT_STATE.communityName_en,
              communityName_bn: data.communityName_bn || DEFAULT_STATE.communityName_bn,
              whatsappUrl: data.whatsappUrl || '',
              whatsappNumber: data.whatsappNumber || '',
              facebookUrl: data.facebookUrl || '',
              websiteUrl: data.websiteUrl || '',
              customPrefix_en: data.customPrefix_en || DEFAULT_STATE.customPrefix_en,
              customPrefix_bn: data.customPrefix_bn || DEFAULT_STATE.customPrefix_bn,
              customFor_en: data.customFor_en || DEFAULT_STATE.customFor_en,
              customFor_bn: data.customFor_bn || DEFAULT_STATE.customFor_bn,
              enabled: data.enabled !== undefined ? data.enabled : true,
              showSocialBadges: data.showSocialBadges !== undefined ? data.showSocialBadges : true,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load community footer settings:', err);
      } finally {
        if (isMounted) setLoaded(true);
      }
    }
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!settings.enabled) {
    return null;
  }

  const prefix = isBn ? settings.customPrefix_bn : settings.customPrefix_en;
  const connector = isBn ? settings.customFor_bn : settings.customFor_en;
  const communityName = isBn ? settings.communityName_bn : settings.communityName_en;

  // Primary link for clicking on the community name itself if provided
  const primaryUrl = settings.facebookUrl || settings.whatsappUrl || settings.websiteUrl || '';

  return (
    <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5 py-1 px-2.5 rounded-full bg-slate-800/40 border border-slate-700/40 text-xs text-slate-400 backdrop-blur-xs transition-all duration-300 hover:border-slate-600/60 hover:bg-slate-800/70 shadow-xs">
      {/* Prefix */}
      <span>{prefix}</span>

      {/* Pulsing heart */}
      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse shrink-0 inline-block transition-transform hover:scale-125" />

      {/* Connector */}
      {connector && <span>{connector}</span>}

      {/* Dynamic Community Name */}
      {primaryUrl ? (
        <a
          href={primaryUrl}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-slate-200 hover:text-amber-400 transition-colors inline-flex items-center gap-1 group/name underline decoration-slate-600 hover:decoration-amber-400 underline-offset-2"
          title={`${isBn ? 'ভিজিট করুন:' : 'Visit:'} ${communityName}`}
        >
          <span>{communityName}</span>
          <ExternalLink className="w-3 h-3 opacity-0 group-hover/name:opacity-100 transition-opacity text-amber-400 shrink-0" />
        </a>
      ) : (
        <span className="font-semibold text-slate-200">{communityName}</span>
      )}

      {/* Social Actions (WhatsApp & Facebook) */}
      {settings.showSocialBadges && (settings.whatsappUrl || settings.facebookUrl) && (
        <div className="inline-flex items-center gap-1 ml-1 pl-1.5 border-l border-slate-700">
          {/* WhatsApp Badge */}
          {settings.whatsappUrl && (
            <a
              href={settings.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 text-[11px] font-medium transition-all shadow-2xs hover:scale-105"
              aria-label="WhatsApp Community"
              title={isBn ? 'হোয়াটসঅ্যাপে যুক্ত হোন' : 'Connect on WhatsApp'}
            >
              <WhatsAppIcon size={12} className="shrink-0 fill-emerald-400" />
              <span className="hidden xs:inline">WhatsApp</span>
            </a>
          )}

          {/* Facebook Badge */}
          {settings.facebookUrl && (
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/60 text-[11px] font-medium transition-all shadow-2xs hover:scale-105"
              aria-label="Facebook Community"
              title={isBn ? 'ফেসবুক গ্রুপ / পেজে যুক্ত হোন' : 'Join Facebook Community'}
            >
              <FacebookIcon size={11} className="shrink-0 fill-blue-400" />
              <span className="hidden xs:inline">Facebook</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
