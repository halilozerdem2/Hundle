import HomeClient from './HomeClient';
import {
  AVAILABLE_CATEGORIES,
  NOTIFICATION_FREQUENCIES,
  type Category,
  type NotificationFrequency
} from '@news/shared';

type Panel = 'categories' | 'notifications';

interface HomePageProps {
  searchParams?: {
    categories?: string;
    frequency?: string;
    notifications?: string;
    panel?: string;
  };
}

const parseCategories = (value?: string): Category[] => {
  if (!value) return [];
  return value
    .split(',')
    .map((category) => category.trim())
    .filter((category): category is Category =>
      AVAILABLE_CATEGORIES.includes(category as Category)
    );
};

const isFrequency = (value?: string): value is NotificationFrequency =>
  !!value && NOTIFICATION_FREQUENCIES.includes(value as NotificationFrequency);

const isPanel = (value?: string): value is Panel =>
  value === 'categories' || value === 'notifications';

const Page = ({ searchParams }: HomePageProps) => {
  const categories = parseCategories(searchParams?.categories);
  const notificationsEnabled = searchParams?.notifications !== 'off';
  const requestedFrequency = isFrequency(searchParams?.frequency)
    ? searchParams.frequency!
    : '1h';
  const frequency = notificationsEnabled ? requestedFrequency : 'none';
  const panel = isPanel(searchParams?.panel) ? searchParams?.panel : undefined;

  return (
    <HomeClient
      initialCategories={categories}
      initialFrequency={frequency}
      notificationsEnabled={notificationsEnabled}
      initialPanel={panel}
    />
  );
};

export default Page;
