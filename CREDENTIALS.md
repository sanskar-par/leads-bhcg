# 🔐 BHCG Email Credentials - QUICK REFERENCE

## Gmail Configuration

**Email Address:**
```
bhcg@hyderabad.bits-pilani.ac.in
```

**App Password:** (from Python script)
```

```

## SMTP Settings

```
SMTP Server: smtp.gmail.com
SMTP Port: 587
Display Name: BITS Hyderabad Consulting Group
```

## Admin Access

**Admin Email:** `bhcg@hyderabad.bits-pilani.ac.in`
**Admin Page:** `http://localhost:9002/admin` (or your deployed URL)

## Quick Setup Steps

1. **Run SQL Migration:**
   - Open Supabase SQL Editor
   - Run `supabase-add-mailed-status.sql`

2. **Login as Admin:**
   - Login with Google using `bhcg@hyderabad.bits-pilani.ac.in`

3. **Configure Email:**
   - Go to Admin Dashboard → Settings Tab
   - Enter email: `bhcg@hyderabad.bits-pilani.ac.in`
   - Enter password: ``

4. **Start Sending:**
   - Filter leads (default: Not Mailed)
   - Select recipients
   - Click "Send Emails"

## Status Updates

After sending, leads will automatically update to:
- ✅ **Mailed** - Successfully sent
- ❌ **Failed** - Send error occurred

Statistics cards will refresh automatically!

---

⚠️ **SECURITY WARNING:** This file contains sensitive credentials.
- Never commit to public repositories
- Share only with authorized team members
- Rotate password if compromised
