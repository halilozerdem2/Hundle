'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SUPPORTED_LANGUAGES, type Language } from '../lib/i18n';
import { useLanguage } from './LanguageProvider';

const Header = () => {
  const { language, setLanguage, copy } = useLanguage();

  const handleLanguageChange = (code: Language) => {
    if (code !== language) {
      setLanguage(code);
    }
  };

  return (
    <header className="site-header">
      <Link href="/" className="site-header__brand">
        <span className="site-header__logo">
          <Image
            src="/logo.png"
            alt="Hundle logo"
            fill
            sizes="80px"
            className="site-header__logo-image"
          />
        </span>
        <span className="site-header__label">{copy.header.brandLabel}</span>
      </Link>
      <div className="site-header__language" role="group" aria-label={copy.header.languageLabel}>
        {SUPPORTED_LANGUAGES.map((code) => (
          <button
            key={code}
            type="button"
            className={`language-toggle ${language === code ? 'language-toggle--active' : ''}`}
            aria-pressed={language === code}
            aria-label={copy.header.optionNames[code]}
            onClick={() => handleLanguageChange(code)}
          >
            {copy.header.shortLabels[code]}
          </button>
        ))}
      </div>
    </header>
  );
};

export default Header;
