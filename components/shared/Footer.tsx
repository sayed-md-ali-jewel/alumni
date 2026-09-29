'use client';

import React from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Linkedin,
  Youtube,
  Globe,
  Instagram,
  Twitter,
  MessageCircle,
} from 'lucide-react';
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider';
import { CommunityFooterBadge } from '@/components/shared/CommunityFooterBadge';

export function Footer() {
  const t = useTranslations('nav');
  const common = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const { settings, siteName, footerTagline, aboutText, copyrightText } = useSiteSettings();

  // Hide footer inside dedicated admin portal
  if (pathname?.startsWith('/dashboard/admin')) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-900 flex items-center justify-center font-bold text-xl overflow-hidden shrink-0">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt={siteName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <GraduationCap className="w-6 h-6 text-slate-950" />
                )}
              </div>
              <div>
                <span className="font-bold text-lg text-white tracking-tight">
                  {siteName}
                </span>
                <p className="text-xs text-slate-400">
                  {footerTagline}
                </p>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {aboutText}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.linkedinUrl && (
                <a
                  href={settings.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {settings.youtubeUrl && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {settings.websiteUrl && (
                <a
                  href={settings.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-amber-600 transition-colors"
                  aria-label="Web"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {settings.twitterUrl && (
                <a
                  href={settings.twitterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-sky-500 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-pink-600 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {(settings.whatsappUrl || settings.whatsappNumber) && (
                <a
                  href={
                    settings.whatsappUrl ||
                    `https://wa.me/${settings.whatsappNumber?.replace(/[^0-9]/g, '')}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-emerald-600 transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              {locale === 'bn' ? 'প্রয়োজনীয় লিংক' : 'Quick Links'}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/committee" className="hover:text-amber-400 transition-colors">
                  {t('committee')}
                </Link>
              </li>
              <li>
                <Link href="/directory" className="hover:text-amber-400 transition-colors">
                  {t('directory')}
                </Link>
              </li>
              <li>
                <Link href="/blood-donors" className="hover:text-amber-400 transition-colors">
                  {t('bloodDonors')}
                </Link>
              </li>
              <li>
                <Link href="/blood-requests" className="hover:text-amber-400 transition-colors">
                  {t('bloodRequests')}
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-amber-400 transition-colors">
                  {t('events')}
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-amber-400 transition-colors">
                  {t('news')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Giving & Blood Aid */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              {locale === 'bn' ? 'তহবিল ও রক্তদান সহায়তা' : 'Giving & Blood Aid'}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/donate" className="hover:text-amber-400 transition-colors">
                  {locale === 'bn' ? 'স্কুল উন্নয়ন ও বৃত্তি তহবিল' : 'School Development Fund'}
                </Link>
              </li>
              <li>
                <Link href="/blood-requests/create" className="hover:text-rose-400 transition-colors flex items-center gap-1.5 text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                  <span>{locale === 'bn' ? 'জরুরি রক্তের আবেদন' : 'Post Blood Request'}</span>
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-amber-400 transition-colors">
                  {locale === 'bn' ? 'রক্তদাতা হিসেবে নিবন্ধন' : 'Register as Donor'}
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-amber-400 transition-colors">
                  {t('community')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Secretariat */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              {locale === 'bn' ? 'যোগাযোগ ও সচিবালয়' : 'Contact Secretariat'}
            </h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{settings.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{settings.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Dynamic Community Badge */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            © {new Date().getFullYear()} {copyrightText}
          </p>
          <CommunityFooterBadge />
        </div>
      </div>
    </footer>
  );
}

