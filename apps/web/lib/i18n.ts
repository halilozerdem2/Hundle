import { CATEGORY_LABELS, type Category, type NotificationFrequency } from '@news/shared';

export const LANGUAGE_COOKIE = 'language';
export const SUPPORTED_LANGUAGES = ['en', 'tr'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = 'en';

export const isSupportedLanguage = (value?: string | null): value is Language =>
  !!value && SUPPORTED_LANGUAGES.includes(value as Language);

export const resolveLanguage = (value?: string | null): Language =>
  (isSupportedLanguage(value) ? value : DEFAULT_LANGUAGE) as Language;

const turkishCategoryLabels: Record<Category, string> = {
  technology: 'Teknoloji',
  business: 'İş Dünyası',
  sports: 'Spor',
  science: 'Bilim',
  politics: 'Siyaset',
  health: 'Sağlık',
  entertainment: 'Eğlence',
  travel: 'Seyahat',
  finance: 'Finans',
  gaming: 'Oyun',
  education: 'Eğitim',
  energy: 'Enerji',
  environment: 'Çevre',
  startups: 'Girişimler',
  automotive: 'Otomotiv',
  fashion: 'Moda',
  food: 'Yemek',
  'real-estate': 'Gayrimenkul',
  world: 'Dünya',
  local: 'Yerel',
  culture: 'Kültür',
  security: 'Güvenlik',
  defense: 'Savunma',
  weather: 'Hava Durumu',
  celebrity: 'Ünlüler',
  movies: 'Filmler',
  music: 'Müzik',
  art: 'Sanat',
  literature: 'Edebiyat',
  space: 'Uzay',
  history: 'Tarih'
};

const englishFrequencyLabels: Record<NotificationFrequency, string> = {
  '1m': '1 minute',
  '1h': '1 hour',
  '3h': '3 hours',
  '6h': '6 hours',
  '12h': '12 hours',
  '24h': '24 hours',
  none: 'Do not send notifications'
};

const turkishFrequencyLabels: Record<NotificationFrequency, string> = {
  '1m': '1 dakika',
  '1h': '1 saat',
  '3h': '3 saat',
  '6h': '6 saat',
  '12h': '12 saat',
  '24h': '24 saat',
  none: 'Bildirim gönderme'
};

export const translations = {
  en: {
    header: {
      brandLabel: 'Hundle',
      languageLabel: 'Language',
      shortLabels: { en: 'EN', tr: 'TR' },
      optionNames: { en: 'English', tr: 'Turkish' }
    },
    home: {
      heroTitle: 'Build your news feed',
      heroSubtitle:
        'Select the topics that matter. We will pull matching stories and optionally nudge you.',
      myInterests: 'My interests',
      noSelections: 'No selections yet.',
      changeNotifications: 'Change notification settings',
      notificationFrequencyLabel: 'Notification frequency',
      selectionError: 'Please pick at least one category.',
      notificationsOff: 'Notifications are turned off.',
      notificationsInfo: (label: string) => `You will receive updates every ${label}.`,
      showNewsCta: 'Show my news',
      interestsEmpty: 'No selections yet.',
      selectedLabelFallback: 'no categories selected yet'
    },
    news: {
      selectedCategories: 'Selected categories',
      noCategories: 'No categories selected.',
      notificationsDisabled: 'Notifications are disabled.',
      notificationFrequency: (label: string) => `Notification frequency: ${label}`,
      changeNotifications: 'Change notification settings',
      changeCategories: 'Change categories',
      selectionPrompt: 'Return to the previous page to select at least one category.',
      emptyState: 'No fresh stories for this selection at the moment.'
    },
    newsTabs: {
      title: 'Your personal briefing',
      subtitle: 'Switch between your interests, news feed, alerts, and saved reads.',
      interestsTab: 'My interests',
      newsTab: 'My news',
      notificationsTab: 'Notification settings',
      readLaterTab: 'Read later',
      readLaterEmpty: 'Nothing saved for later yet. Mark a story to add it here.',
      categoriesHelper: 'Select the topics you want to follow and apply to refresh your feed.',
      applyCategories: 'Apply categories',
      notificationsHelper: 'Pick how often you would like to receive notifications or turn them off.',
      applyNotifications: 'Save notification settings'
    },
    newsFeed: {
      allNews: 'All news'
    },
    newsList: {
      idle: 'Pick at least one category and tap "Show my news" to see curated stories.',
      empty:
        'No fresh stories for those topics right now. Try broadening your picks or check back soon.',
      loadingFrom: (label: string) => `Gathering the latest from ${label}…`,
      refreshing: 'Refreshing the feed…',
      readMore: 'Read more →',
      addToReadLater: 'Read later',
      removeFromReadLater: 'Remove',
      selectedLabelFallback: 'all topics'
    },
    frequencyLabels: englishFrequencyLabels,
    categoryLabels: CATEGORY_LABELS
  },
  tr: {
    header: {
      brandLabel: 'Hundle',
      languageLabel: 'Dil',
      shortLabels: { en: 'EN', tr: 'TR' },
      optionNames: { en: 'İngilizce', tr: 'Türkçe' }
    },
    home: {
      heroTitle: 'Haber akışını oluştur',
      heroSubtitle: 'Önemli konuları seç, biz haberleri toparlayıp sana bildiririz.',
      myInterests: 'İlgilerim',
      noSelections: 'Henüz seçim yok.',
      changeNotifications: 'Bildirim ayarlarını değiştir',
      notificationFrequencyLabel: 'Bildirim sıklığı',
      selectionError: 'Lütfen en az bir kategori seç.',
      notificationsOff: 'Bildirimler kapalı.',
      notificationsInfo: (label: string) => `${label} arayla güncellemeler alacaksın.`,
      showNewsCta: 'Haberlerimi göster',
      interestsEmpty: 'Henüz seçim yok.',
      selectedLabelFallback: 'henüz kategori seçilmedi'
    },
    news: {
      selectedCategories: 'Seçilen kategoriler',
      noCategories: 'Kategori seçilmedi.',
      notificationsDisabled: 'Bildirimler kapalı.',
      notificationFrequency: (label: string) => `Bildirim sıklığı: ${label}`,
      changeNotifications: 'Bildirim ayarlarını değiştir',
      changeCategories: 'Kategorileri değiştir',
      selectionPrompt: 'Lütfen geri dönüp en az bir kategori seç.',
      emptyState: 'Bu seçim için şu anda yeni haber yok.'
    },
    newsTabs: {
      title: 'Kişisel bültenin',
      subtitle: 'İlgilerini, haber akışını, bildirimlerini ve daha sonra okumak istediklerini yönet.',
      interestsTab: 'İlgilerim',
      newsTab: 'Haberlerim',
      notificationsTab: 'Bildirim ayarları',
      readLaterTab: 'Daha sonra oku',
      readLaterEmpty: 'Henüz kaydedilmiş haber yok. Bir haberi işaretleyerek buraya ekleyebilirsin.',
      categoriesHelper: 'Takip etmek istediğin konuları seç ve akışını güncelle.',
      applyCategories: 'Kategorileri uygula',
      notificationsHelper: 'Bildirim almak istediğin sıklığı seç veya tamamen kapat.',
      applyNotifications: 'Bildirim ayarlarını kaydet'
    },
    newsFeed: {
      allNews: 'Tüm haberler'
    },
    newsList: {
      idle: 'Önce en az bir kategori seçip "Haberlerimi göster" butonuna dokun.',
      empty: 'Bu konular için yeni haber yok. Seçim alanını genişletebilir veya sonra tekrar bakabilirsin.',
      loadingFrom: (label: string) => `${label} içinden en yenileri topluyoruz…`,
      refreshing: 'Akış yenileniyor…',
      readMore: 'Devamını oku →',
      addToReadLater: 'Daha sonra oku',
      removeFromReadLater: 'Kaldır',
      selectedLabelFallback: 'tüm konular'
    },
    frequencyLabels: turkishFrequencyLabels,
    categoryLabels: turkishCategoryLabels
  }
} as const;

export type Translation = (typeof translations)[Language];
