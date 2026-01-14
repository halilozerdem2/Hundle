import HomeClient from './HomeClient';
import {
  AVAILABLE_CATEGORIES,
  NOTIFICATION_FREQUENCIES,
  type Category,
  type NotificationFrequency
} from '@news/shared';

interface HomePageProps {
  searchParams?: {
    categories?: string;
    frequency?: string;
    notifications?: string;
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

const Page = ({ searchParams }: HomePageProps) => {
  const categories = parseCategories(searchParams?.categories);
  const notificationsEnabled = searchParams?.notifications !== 'off';
  const frequency = isFrequency(searchParams?.frequency) ? searchParams!.frequency : '1h';

  return (
    <HomeClient
      initialCategories={categories}
      initialFrequency={frequency}
      notificationsEnabled={notificationsEnabled}
    />
  );
};

export default Page;
