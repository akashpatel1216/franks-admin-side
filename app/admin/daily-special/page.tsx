import { supabaseAdminClient } from '@/lib/supabaseAdmin';
import DailySpecialForm, {
  DailySpecialFormState,
  DailySpecialRow,
} from './DailySpecialForm';

export const dynamic = 'force-dynamic';

async function fetchDailySpecial(): Promise<DailySpecialRow | null> {
  const supabase = supabaseAdminClient();
  const today = new Date();
  const todayIso = today.toISOString().split('T')[0]!;

  const { data: todayData, error: todayError } = await supabase
    .from('daily_specials')
    .select('*')
    .eq('special_date', todayIso)
    .order('updated_at', { ascending: false })
    .maybeSingle();

  if (todayError && todayError.code !== 'PGRST116') {
    console.error('Failed to load today daily special', todayError);
    throw new Error(todayError.message);
  }

  if (todayData) {
    return todayData as DailySpecialRow;
  }

  const { data: latestData, error: latestError } = await supabase
    .from('daily_specials')
    .select('*')
    .order('special_date', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError && latestError.code !== 'PGRST116') {
    console.error('Failed to load latest daily special', latestError);
    throw new Error(latestError.message);
  }

  return latestData ? (latestData as DailySpecialRow) : null;
}

export default async function DailySpecialPage() {
  const initialRow = await fetchDailySpecial();

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12">
      {/* TODO: Protect this route with proper admin authentication */ }
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-gray-900">
          Daily Special Admin
        </h1>
        <p className="text-sm text-gray-500">
          Manage the featured menu item for your guests.
        </p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <DailySpecialForm
          initialData={initialRow}
          initialState={{ status: 'idle' }}
          action={saveDailySpecial}
        />
      </section>
    </div>
  );
}

export async function saveDailySpecial(
  _prevState: DailySpecialFormState,
  formData: FormData,
): Promise<DailySpecialFormState> {
  'use server';

  const supabase = supabaseAdminClient();

  const specialDateRaw = formData.get('special_date');
  const title = (formData.get('title') ?? '').toString().trim();
  const description = (formData.get('description') ?? '').toString().trim();
  const priceInput = (formData.get('price_major') ?? '').toString().trim();
  const currencyCode =
    (formData.get('currency_code') ?? 'USD').toString().toUpperCase();
  const emoji = (formData.get('emoji') ?? '').toString().trim();
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

  if (!emoji) {
    return { status: 'error', message: 'Emoji is required.' };
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
      emoji,
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

