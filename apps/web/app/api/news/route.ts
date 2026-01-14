import { NextResponse } from 'next/server';
import { AVAILABLE_CATEGORIES, Category } from '@news/shared';
import { fetchNews } from '@news/news-core';

interface RequestBody {
  categories?: string[];
}

const isCategory = (value: string): value is Category =>
  AVAILABLE_CATEGORIES.includes(value as Category);

export const POST = async (request: Request) => {
  const body = (await request.json()) as RequestBody;
  const categories = (body.categories ?? []).filter(
    (category): category is Category => typeof category === 'string' && isCategory(category)
  );

  if (!categories.length) {
    return NextResponse.json(
      { message: 'Select at least one category before requesting news.' },
      { status: 400 }
    );
  }

  const articles = await fetchNews(categories);
  return NextResponse.json({ articles });
};
