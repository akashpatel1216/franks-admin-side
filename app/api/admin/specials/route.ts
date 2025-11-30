import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminClient } from '@/lib/supabaseAdmin';

// Check authentication
function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  return authHeader === 'Bearer authenticated';
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = supabaseAdminClient();
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_specials')
      .select('*')
      .eq('special_date', today)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to fetch daily specials', error);
      return NextResponse.json(
        { error: 'Failed to fetch daily specials' },
        { status: 500 }
      );
    }

    // Return data with prices converted from cents to dollars
    if (data) {
      return NextResponse.json({
        soup_name: data.soup_name || '',
        soup_price: (data.soup_price || 0) / 100,
        lunch_name: data.lunch_name || '',
        lunch_price: (data.lunch_price || 0) / 100,
        dinner_name: data.dinner_name || '',
        dinner_price: (data.dinner_price || 0) / 100,
        vegetable_name: data.vegetable_name || '',
        vegetable_price: (data.vegetable_price || 0) / 100,
      });
    }

    // Return empty form if no record exists
    return NextResponse.json({
      soup_name: '',
      soup_price: 0,
      lunch_name: '',
      lunch_price: 0,
      dinner_name: '',
      dinner_price: 0,
      vegetable_name: '',
      vegetable_price: 0,
    });
  } catch (error) {
    console.error('Error in GET /api/admin/specials', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      soup_name,
      soup_price,
      lunch_name,
      lunch_price,
      dinner_name,
      dinner_price,
      vegetable_name,
      vegetable_price,
    } = body;

    // Validate required fields
    if (
      soup_name === undefined ||
      lunch_name === undefined ||
      dinner_name === undefined ||
      vegetable_name === undefined
    ) {
      return NextResponse.json(
        { error: 'All name fields are required' },
        { status: 400 }
      );
    }

    // Convert dollar prices to cents
    const soup_price_cents = Math.round((soup_price || 0) * 100);
    const lunch_price_cents = Math.round((lunch_price || 0) * 100);
    const dinner_price_cents = Math.round((dinner_price || 0) * 100);
    const vegetable_price_cents = Math.round((vegetable_price || 0) * 100);

    // Validate prices are non-negative
    if (
      soup_price_cents < 0 ||
      lunch_price_cents < 0 ||
      dinner_price_cents < 0 ||
      vegetable_price_cents < 0
    ) {
      return NextResponse.json(
        { error: 'Prices must be non-negative' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdminClient();
    const today = new Date().toISOString().split('T')[0];

    // UPSERT: Create if doesn't exist, update if it does
    const { error: upsertError } = await supabase
      .from('daily_specials')
      .upsert(
        {
          special_date: today,
          soup_name: soup_name.trim(),
          soup_price: soup_price_cents,
          lunch_name: lunch_name.trim(),
          lunch_price: lunch_price_cents,
          dinner_name: dinner_name.trim(),
          dinner_price: dinner_price_cents,
          vegetable_name: vegetable_name.trim(),
          vegetable_price: vegetable_price_cents,
          currency_code: 'USD',
        },
        {
          onConflict: 'special_date',
        }
      );

    if (upsertError) {
      console.error('Failed to update daily specials', upsertError);
      return NextResponse.json(
        { error: 'Failed to save daily specials' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Daily specials saved successfully' });
  } catch (error) {
    console.error('Error in PUT /api/admin/specials', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

