# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in the details:
   - **Project Name**: BHCG Pitching Database
   - **Database Password**: (choose a strong password - save it!)
   - **Region**: Choose closest to your location
5. Click "Create new project" and wait for it to initialize (~2 minutes)

## 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, click on the **Settings** icon (gear icon) in the sidebar
2. Go to **API** section
3. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (under "Project API keys")

## 3. Update Your .env File

1. Open the `.env` file in the root of your project
2. Replace the placeholder values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_actual_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```

## 4. Run the Database Migration

1. In your Supabase project dashboard, click on the **SQL Editor** icon in the sidebar
2. Click "New query"
3. Copy the entire contents of `supabase-migration.sql` from this project
4. Paste it into the SQL editor
5. Click "Run" or press `Ctrl+Enter`
6. You should see "Success. No rows returned" - this means the tables were created!

## 5. Verify the Setup

1. Click on the **Table Editor** icon in the sidebar
2. You should see two tables:
   - `users` (with 3 sample users)
   - `leads` (with 3 sample leads)
3. Click on each table to verify the data was inserted correctly

## 6. Update Your Code to Use Supabase

Replace all imports in your components from:
```typescript
import { ... } from '@/lib/data';
```

To:
```typescript
import { ... } from '@/lib/data-supabase';
```

Files to update:
- `src/context/auth-context.tsx`
- `src/components/dashboard/add-lead-form.tsx`
- `src/components/dashboard/user-leads-table.tsx`
- `src/components/database/leads-table.tsx`
- `src/components/leaderboard/leaderboard-table.tsx`

## 7. Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C if running)
npm run dev
```

## 8. Test Your Application

1. Login with test credentials:
   - User ID: `user1`, Password: `password123`
   - User ID: `user2`, Password: `password123`
   - User ID: `user3`, Password: `password123`

2. Test adding a lead from the Dashboard

3. Check the Database view to see all leads

4. Check the Leaderboard to see user rankings

## Troubleshooting

### "TypeError: Cannot read properties of undefined"
- Make sure you've updated the `.env` file with actual Supabase credentials
- Restart the dev server after updating `.env`

### "Invalid API key"
- Double-check you copied the **anon public** key (not the service_role key)
- Verify the URL doesn't have extra spaces or characters

### "relation 'users' does not exist"
- Make sure you ran the entire SQL migration script in Supabase SQL Editor
- Check the Table Editor to confirm tables were created

### Changes not reflecting
- Clear your browser's local storage/session storage
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)

## Next Steps

Once everything is working:
1. You can delete the old `src/lib/data.ts` file (keep data-supabase.ts)
2. Add more users through the Supabase dashboard if needed
3. Consider setting up Row Level Security (RLS) policies for production

## Security Note

- The `.env` file contains sensitive credentials - **never commit it to git**
- The `.env` is already in `.gitignore` by default in Next.js projects
- For production deployment, set environment variables in your hosting platform (Vercel, etc.)
