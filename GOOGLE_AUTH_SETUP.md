# Google Authentication Setup Guide

## ✅ Code Implementation Complete

The following files have been updated to support Google OAuth:
- `src/components/auth/login-form.tsx` - Added Google Sign In button
- `src/context/auth-context.tsx` - Added Google authentication logic
- `src/lib/data-supabase.ts` - Added function to create users from Google login
- `.env.local` - Created environment variables file

## 📋 Setup Steps

### Step 1: Update Environment Variables

Edit `.env.local` with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

You can find these in your Supabase Dashboard → Settings → API

### Step 2: Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Configure Consent Screen**:
   - User Type: External
   - App name: `BHCG Leads Central`
   - User support email: your email
   - Developer contact: your email
   - Save and continue through all steps

5. Create **OAuth 2.0 Client ID**:
   - Application type: **Web application**
   - Name: `BHCG Leads App`
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:9002
   https://bhcg-leads.vercel.app
   ```
   
   **Authorized redirect URIs:**
   ```
   http://localhost:9002/api/auth/callback/google
   https://bhcg-leads.vercel.app/api/auth/callback/google
   https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
   ```
   
6. Copy the **Client ID** and **Client Secret**

### Step 3: Supabase Configuration

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** and toggle it ON
5. Paste your Google **Client ID** and **Client Secret**
6. Copy the **Callback URL** shown (format: `https://xxxxx.supabase.co/auth/v1/callback`)
7. Add this callback URL to Google Console (Step 2, #5)
8. Click **Save**

### Step 4: Update Database Schema (if needed)

Make sure your `users` table allows NULL passwords for Google users:

```sql
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
```

Run this in Supabase SQL Editor if needed.

### Step 5: Deploy to Vercel

1. Add environment variables to Vercel:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Redeploy your application

## 🎯 How It Works

### User Flow:
1. User clicks "Continue with Google"
2. Redirected to Google login
3. After successful login, redirected back to your app
4. User profile auto-created in your `users` table with:
   - `id`: Email prefix (e.g., "john.doe" from john.doe@gmail.com)
   - `name`: Full name from Google profile
   - `password`: Empty (not used for Google users)

### Features:
- ✅ Seamless Google OAuth integration
- ✅ Auto-creates users on first login
- ✅ Works alongside existing manual login
- ✅ Session managed by Supabase
- ✅ Secure authentication flow

## 🧪 Testing

### Local Testing:
1. Make sure dev server is running: `npm run dev`
2. Go to `http://localhost:9002/login`
3. Click "Continue with Google"
4. Sign in with your Google account
5. You should be redirected to the dashboard

### Production Testing:
1. After deploying to Vercel
2. Go to `https://bhcg-leads.vercel.app/login`
3. Test Google login

## ⚠️ Important Notes

- **Callback URLs**: Make sure ALL callback URLs match exactly between Google Console and Supabase
- **Environment Variables**: Never commit `.env.local` to git (already in .gitignore)
- **User IDs**: Google users get auto-generated IDs from their email
- **Manual Login**: Still works for existing users with passwords
- **First Login**: New Google users are automatically added to the database

## 🔧 Troubleshooting

### "redirect_uri_mismatch" error:
- Check that all redirect URIs are added to Google Console
- Verify Supabase callback URL is included

### Google login button doesn't work:
- Check browser console for errors
- Verify environment variables are set correctly
- Ensure Supabase Google provider is enabled

### User not created in database:
- Check Supabase logs for errors
- Verify database permissions
- Check that password column allows NULL values

## 📱 What's New on Login Page

The login page now shows:
- Original User ID/Password fields (still functional)
- "OR" separator
- "Continue with Google" button with Google logo
- Responsive design for both login methods
