'use client';

import type { ReactNode } from 'react';
import LanguageProvider from './LanguageProvider';
import type { Language } from '../lib/i18n';

interface ProvidersProps {
  initialLanguage: Language;
  children: ReactNode;
}

const Providers = ({ initialLanguage, children }: ProvidersProps) => (
  <LanguageProvider initialLanguage={initialLanguage}>{children}</LanguageProvider>
);

export default Providers;
