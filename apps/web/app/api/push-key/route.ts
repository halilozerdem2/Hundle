import { NextResponse } from 'next/server';
import { getPublicVapidKey } from '@news/push-core';

export const GET = () => {
  const publicKey = getPublicVapidKey();
  return NextResponse.json({ publicKey });
};
