'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';

export type DailySpecialRow = {
  id: string;
  special_date: string;
  title: string;
  description: string;
  price_cents: number;
  currency_code: string;
  highlights: string[] | null;
  created_at: string;
  updated_at: string;
};

export type DailySpecialFormState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

type Props = {
  initialData: DailySpecialRow | null;
  initialState: DailySpecialFormState;
  action: (
    prevState: DailySpecialFormState,
    formData: FormData,
  ) => Promise<DailySpecialFormState>;
};

const formatterCache = new Map<string, Intl.NumberFormat>();

function formatPrice(priceCents: number, currencyCode: string) {
  if (!formatterCache.has(currencyCode)) {
    formatterCache.set(
      currencyCode,
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
      }),
    );
  }
  const formatter = formatterCache.get(currencyCode)!;
  return formatter.format(priceCents / 100);
}

export default function DailySpecialForm({
  initialData,
  initialState,
  action,
}: Props) {
  const inputClasses =
    'w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 placeholder:text-gray-400';
  const labelClasses = 'text-sm font-medium text-gray-700';
  const helpTextClasses = 'text-xs text-gray-500';

  const initialHighlights = useMemo(
    () => (initialData?.highlights ?? []).join('\n'),
    [initialData?.highlights],
  );

  const [specialDate, setSpecialDate] = useState<string>(
    initialData?.special_date ?? new Date().toISOString().split('T')[0]!,
  );
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [priceMajor, setPriceMajor] = useState<string>(
    initialData ? (initialData.price_cents / 100).toFixed(2) : '',
  );
  const [currencyCode, setCurrencyCode] = useState(
    initialData?.currency_code ?? 'USD',
  );
  const [highlights, setHighlights] = useState(initialHighlights);
  const [clientError, setClientError] = useState<string | null>(null);

  const [state, setState] = useState(initialState);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (state.status === 'success') {
      setClientError(null);
    } else if (state.status === 'error') {
      setClientError(state.message);
    }
  }, [state]);

  const formattedPrice =
    initialData && initialData.price_cents > 0
      ? formatPrice(initialData.price_cents, initialData.currency_code)
      : null;

  function handleSubmit(formData: FormData) {
    setClientError(null);

    if (!specialDate) {
      setClientError('Please choose a date for the special.');
      return;
    }
    if (!title.trim()) {
      setClientError('Title is required.');
      return;
    }
    if (!description.trim()) {
      setClientError('Description is required.');
      return;
    }
    const priceNum = Number.parseFloat(priceMajor);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setClientError('Price must be a positive number.');
      return;
    }

    formData.set('special_date', specialDate);
    formData.set('title', title);
    formData.set('description', description);
    formData.set('price_major', priceMajor);
    formData.set('currency_code', currencyCode);
    formData.set('highlights', highlights);

    startTransition(async () => {
      setState({ status: 'loading' });
      const nextState = await action(state, formData);
      setState(nextState);
    });
  }

  return (
    <form
      className="flex flex-col gap-8"
      action={handleSubmit}
    >
      {initialData ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Current Daily Special
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div>
              <p className="text-base font-semibold text-gray-900">{initialData.title}</p>
              <p className="text-sm text-gray-600">
                {new Date(initialData.special_date).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            {formattedPrice ? (
              <span className="ml-auto rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700 shadow-sm">
                {formattedPrice}
              </span>
            ) : null}
          </div>
          {initialData.highlights && initialData.highlights.length > 0 ? (
            <ul className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
              {initialData.highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 rounded-md bg-white px-3 py-2 shadow-sm"
                >
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-gray-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <fieldset className="flex flex-col gap-6 rounded-lg border border-gray-200 bg-white/90 p-6 shadow-sm">
        <legend className="text-base font-semibold text-gray-900">
          Special Details
        </legend>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="special_date" className={labelClasses}>
              Special Date
            </label>
            <input
              id="special_date"
              name="special_date"
              type="date"
              value={specialDate}
              onChange={(event) => setSpecialDate(event.target.value)}
              className={inputClasses}
              required
            />
            <p className={helpTextClasses}>
              Choose the date this special should appear for guests.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="title" className={labelClasses}>
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={inputClasses}
            placeholder="Grilled Atlantic Salmon"
            required
          />
          <p className={helpTextClasses}>
            Keep it short and descriptive. Guests see this name first.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="description" className={labelClasses}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={`${inputClasses} min-h-[140px]`}
            placeholder="Pan-seared and finished with lemon beurre blanc, served with roasted asparagus."
            required
          />
          <p className={helpTextClasses}>
            Highlight the preparation, ingredients, or story behind the dish.
          </p>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-6 rounded-lg border border-gray-200 bg-white/90 p-6 shadow-sm">
        <legend className="text-base font-semibold text-gray-900">
          Pricing & Highlights
        </legend>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="sm:col-span-2 flex flex-col gap-2">
            <label htmlFor="price_major" className={labelClasses}>
              Price (major units)
            </label>
            <input
              id="price_major"
              name="price_major"
              type="number"
              min="0"
              step="0.01"
              value={priceMajor}
              onChange={(event) => setPriceMajor(event.target.value)}
              className={inputClasses}
              placeholder="26.00"
              required
            />
            <p className={helpTextClasses}>
              Enter the price as guests should see it (for example 26.00).
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="currency_code" className={labelClasses}>
              Currency Code
            </label>
            <input
              id="currency_code"
              name="currency_code"
              type="text"
              maxLength={3}
              value={currencyCode}
              onChange={(event) => setCurrencyCode(event.target.value.toUpperCase())}
              className={`${inputClasses} uppercase`}
              placeholder="USD"
              required
            />
            <p className={helpTextClasses}>
              Use the three-letter ISO code your location accepts.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="highlights" className={labelClasses}>
            Highlights
            <span className="ml-2 text-xs font-normal text-gray-400">
              (one per line)
            </span>
          </label>
          <textarea
            id="highlights"
            name="highlights"
            value={highlights}
            onChange={(event) => setHighlights(event.target.value)}
            className={`${inputClasses} min-h-[140px]`}
            placeholder={`Locally sourced ingredients
Chef's favorite pairing`}
          />
          <p className={helpTextClasses}>
            Optional bullet points for noteworthy ingredients, pairings, or prep.
          </p>
        </div>
      </fieldset>

      {clientError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {clientError}
        </div>
      ) : null}

      {state.status === 'success' ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {state.message}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-gray-500">
          All changes save to Supabase and appear to guests immediately.
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-md bg-gray-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Saving…' : 'Save Daily Special'}
        </button>
      </div>
    </form>
  );
}

