'use server';

import { supabaseAdminClient } from '@/lib/supabaseAdmin';
import { DailySpecialFormState } from './DailySpecialForm';

export async function saveDailySpecial(
  _prevState: DailySpecialFormState,
  formData: FormData,
): Promise<DailySpecialFormState> {
  const supabase = supabaseAdminClient();

  const specialDateRaw = formData.get('special_date');
  const title = (formData.get('title') ?? '').toString().trim();
  const description = (formData.get('description') ?? '').toString().trim();
  const priceInput = (formData.get('price_major') ?? '').toString().trim();
  const currencyCode =
    (formData.get('currency_code') ?? 'USD').toString().toUpperCase();
  const highlightsInput = (formData.get('highlights') ?? '')
    .toString()
    .trim();

  if (!specialDateRaw) {
    return { status: 'error', message: 'A special date is required.' };
  }

  const specialDate = new Date(specialDateRaw.toString());
  if (Number.isNaN(specialDate.getTime())) {
    return { status: 'error', message: 'Special date is invalid.' };
  }

  if (!title) {
    return { status: 'error', message: 'Title is required.' };
  }

  if (!description) {
    return { status: 'error', message: 'Description is required.' };
  }

  const priceMajor = Number.parseFloat(priceInput);
  if (!Number.isFinite(priceMajor) || priceMajor <= 0) {
    return { status: 'error', message: 'Price must be a positive number.' };
  }

  const priceCents = Math.round(priceMajor * 100);
  const highlights =
    highlightsInput.length === 0
      ? []
      : highlightsInput.split('\n').map((item) => item.trim()).filter(Boolean);

  const { error } = await supabase.from('daily_specials').upsert(
    {
      special_date: specialDate.toISOString().split('T')[0],
      title,
      description,
      price_cents: priceCents,
      currency_code: currencyCode,
      highlights,
    },
    {
      onConflict: 'special_date',
    },
  );

  if (error) {
    console.error('Failed to save daily special', error);
    return { status: 'error', message: error.message };
  }

  return { status: 'success', message: 'Daily special saved.' };
}

