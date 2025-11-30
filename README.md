# Frank's Restaurant Admin App

Simple admin interface for managing daily specials (soup, lunch, dinner, and vegetable).

## Features

- 🔐 Password-protected login
- 📝 Edit 8 fields: soup name/price, lunch name/price, dinner name/price, vegetable name/price
- 💾 Automatic UPSERT (creates if doesn't exist, updates if it does)
- 📅 Always uses today's date automatically
- 💵 Prices stored in cents, displayed in dollars
- 📱 Mobile-responsive design

## Environment Variables

Create a `.env` file in the root directory with:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-secure-password
```

**Important:**
- Never commit `.env` to git
- The `SUPABASE_SERVICE_ROLE_KEY` should never be exposed to the client
- Change `ADMIN_PASSWORD` to a strong password

## Database Schema

The app expects a `daily_specials` table in Supabase with:

- `special_date` (date, primary key)
- `soup_name` (text)
- `soup_price` (integer, in cents)
- `lunch_name` (text)
- `lunch_price` (integer, in cents)
- `dinner_name` (text)
- `dinner_price` (integer, in cents)
- `vegetable_name` (text)
- `vegetable_price` (integer, in cents)
- `currency_code` (text, default 'USD')
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Visit `http://localhost:3000` and you'll be redirected to `/admin/login`.

## Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
4. Deploy

## Usage

1. Navigate to `/admin/login`
2. Enter the admin password
3. Edit the daily specials for today
4. Click "Save Changes"
5. Changes appear immediately on the main website

## Security Notes

- Authentication is handled via sessionStorage (simple password check)
- For production, consider implementing proper session management
- All database operations use server-side API routes
- Service role key is never exposed to the client

