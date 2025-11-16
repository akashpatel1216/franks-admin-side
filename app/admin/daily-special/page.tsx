import { supabaseAdminClient } from '@/lib/supabaseAdmin';
import DailySpecialForm, {
  DailySpecialRow,
} from './DailySpecialForm';
import { saveDailySpecial } from './actions';

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

