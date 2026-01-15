// components/Footer.tsx
'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { I18nContext } from '@/context/I18nContext';
import { usePathname } from 'next/navigation';

const Footer = () => {
  const { lang, t } = useContext(I18nContext);
  const pathname = usePathname();
  
  const currentLang = pathname.split('/')[1] || 'en';
  const isRtl = currentLang === 'fa';

  // Quick links
  const quickLinks = [
    { name: t('footer.home'), href: `/${currentLang}` },
    { name: t('footer.doctors'), href: `/${currentLang}/doctors` },
    { name: t('footer.departments'), href: `/${currentLang}/departments` },
    { name: t('footer.services'), href: `/${currentLang}/services` },
    { name: t('footer.appointments'), href: `/${currentLang}/appointments` },
  ];

  // Medical services
  const services = [
    { name: t('footer.emergencyCare') },
    { name: t('footer.cardiology') },
    { name: t('footer.neurology') },
    { name: t('footer.orthopedics') },
    { name: t('footer.pediatrics') },
    { name: t('footer.radiology') },
  ];

  // Contact info
  const contactInfo = {
    address: t('footer.address'),
    phone: t('footer.phone'),
    email: t('footer.email'),
    emergency: t('footer.emergencyPhone'),
    workingHours: t('footer.workingHours'),
  };

  // Social media links
  const socialLinks = [
    { name: 'Facebook', icon: '📘', href: '#' },
    { name: 'Twitter', icon: '🐦', href: '#' },
    { name: 'Instagram', icon: '📷', href: '#' },
    { name: 'LinkedIn', icon: '💼', href: '#' },
    { name: 'YouTube', icon: '▶️', href: '#' },
  ];

  return (
    <footer 
      className="bg-gradient-to-b from-gray-900 to-gray-950 text-white"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Main Footer Content */}
      <div className="px-4 py-12 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Hospital Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">{t('navbar.hospitalName')}</h3>
                <p className="text-sm text-gray-300">{t('navbar.leadingCenter')}</p>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
            
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 hover:bg-cyan-600 transition-colors duration-300"
                  aria-label={social.name}
                >
                  <span className="text-lg">{social.icon}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="text-lg font-bold border-b border-cyan-600 pb-2">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-cyan-300 transition-colors duration-300 flex items-center space-x-2"
                  >
                    <span className="text-cyan-500">›</span>
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Medical Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="text-lg font-bold border-b border-cyan-600 pb-2">
              {t('footer.medicalServices')}
            </h3>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.name} className="text-gray-300 hover:text-cyan-300 transition-colors duration-300">
                  <span className="flex items-center space-x-2">
                    <svg className="h-4 w-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{service.name}</span>
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="text-lg font-bold border-b border-cyan-600 pb-2">
              {t('footer.contactInfo')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <svg className="h-5 w-5 text-cyan-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-300">{contactInfo.address}</span>
              </li>
              <li className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-300">{contactInfo.phone}</span>
              </li>
              <li className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-300">{contactInfo.email}</span>
              </li>
              <li className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM12 4.5L18.5 8.25V15.75L12 19.5L5.5 15.75V8.25L12 4.5ZM12 7L8 11H11V16H13V11H16L12 7Z"/>
                </svg>
                <span className="text-gray-300 font-semibold">{contactInfo.emergency}</span>
              </li>
              <li className="flex items-start space-x-3">
                <svg className="h-5 w-5 text-cyan-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-300">{contactInfo.workingHours}</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Newsletter Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-gray-800"
        >
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-xl font-bold mb-4">{t('footer.newsletter')}</h3>
            <p className="text-gray-300 mb-6">{t('footer.newsletterDescription')}</p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                className="flex-grow px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-cyan-700 hover:to-emerald-700 transition-all duration-300"
              >
                {t('footer.subscribe')}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 border-t border-gray-800">
        <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} {t('navbar.hospitalName')}. {t('footer.allRightsReserved')}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <Link href={`/${currentLang}/privacy`} className="hover:text-cyan-300 transition-colors">
                {t('footer.privacyPolicy')}
              </Link>
              <Link href={`/${currentLang}/terms`} className="hover:text-cyan-300 transition-colors">
                {t('footer.termsOfService')}
              </Link>
              <Link href={`/${currentLang}/sitemap`} className="hover:text-cyan-300 transition-colors">
                {t('footer.sitemap')}
              </Link>
              <Link href={`/${currentLang}/contact`} className="hover:text-cyan-300 transition-colors">
                {t('footer.contactUs')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;