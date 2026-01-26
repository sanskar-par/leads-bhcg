# Email Functionality Setup Guide

## Overview
The admin dashboard now includes a complete email pitching system that allows you to send customized emails to leads from the database.

## Setup Steps

### 1. Install Required Package
Run this command in your terminal:

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

### 2. Run Database Migration
The email functionality requires two new columns in the `leads` table. Run this SQL in Supabase:

```sql
-- Run this in Supabase SQL Editor
-- File: supabase-add-email-status.sql
```

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the sidebar
3. Click **New query**
4. Copy the contents of `supabase-add-email-status.sql`
5. Paste and click **Run**

### 3. Configure Gmail App Password

For Gmail accounts (recommended for BHCG email):

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification** (if not already enabled)
4. Go to **App passwords** (search for it in settings)
5. Create a new app password:
   - App: Mail
   - Device: Other (custom name) - enter "BHCG Leads App"
6. Copy the 16-character password (like: `abcd efgh ijkl mnop`)
7. Save this password - you'll enter it in the admin dashboard

## How to Use

### Access Admin Dashboard
1. Login as `bhcg@hyderabad.bits-pilani.ac.in`
2. Navigate to `/admin`

### Send Emails

#### Step 1: Configure SMTP (One-time setup)
1. Go to **SMTP Config** tab
2. Keep default settings:
   - SMTP Server: `smtp.gmail.com`
   - Port: `587`
   - Email: `bhcg@hyderabad.bits-pilani.ac.in`
3. Enter your Gmail App Password (16 characters)

#### Step 2: Customize Template (Optional)
1. Go to **Template** tab
2. Edit subject line and email body
3. Use these variables:
   - `{name}` - Lead's name
   - `{company}` - Lead's company
   - `{roleType}` - Lead's role
   - `{industry}` - Lead's industry
4. Preview shows how email will look for first lead
5. Click "Reset to Default Template" to restore original

#### Step 3: Select Recipients
1. Go to **Send Emails** tab
2. Use filters:
   - **Status Filter**: Choose "Not Mailed" to send only to new leads
   - **Search**: Find specific leads by name, email, or company
3. Select leads individually or "Select All"
4. Click **Send to X leads** button

#### Step 4: Monitor Progress
- Green "Mailed" badge: Successfully sent
- Red "Failed" badge: Failed to send
- Blue "Not Mailed" badge: Not yet sent

### Features

✅ **Filter by Status**: Only email leads that haven't been contacted
✅ **Search & Filter**: Find specific leads quickly
✅ **Template Editor**: Customize your pitch with HTML support
✅ **Preview**: See exactly what recipients will receive
✅ **Bulk Selection**: Email multiple leads at once
✅ **Status Tracking**: Know which leads have been contacted
✅ **Rate Limiting**: Built-in 2-second delays to avoid spam detection
✅ **Error Handling**: Failed emails are marked and can be retried

### Email Template Variables

Use these in subject or body:
- `{name}` → Recipient's name
- `{company}` → Company name  
- `{roleType}` → Role (CEO, VP, etc.)
- `{industry}` → Industry sector

Example:
```
Subject: Invite for Collaboration | {company} | BHCG
Body: Dear {name}, We are reaching out to {company}...
```

## Troubleshooting

### "Invalid credentials" error
- Double-check your Gmail App Password (16 characters, no spaces)
- Make sure 2-Step Verification is enabled on Google Account
- Use an App Password, NOT your regular Gmail password

### Emails not sending
- Check spam/junk folder for test emails
- Verify SMTP settings are correct (smtp.gmail.com, port 587)
- Gmail has a limit of ~500 emails per day

### Status not updating
- Refresh the page
- Check browser console for errors
- Verify database migration was run successfully

### Rate Limiting
- Gmail may block if too many emails sent too fast
- Built-in 2-second delay between emails
- Send in smaller batches if needed

## Best Practices

1. **Test First**: Send to yourself or a test email first
2. **Check Spam**: Make sure emails aren't going to spam
3. **Batch Sending**: Send to small groups first (10-20 leads)
4. **Personalize**: Use the template variables for personalization
5. **Track Status**: Use filters to avoid duplicate emails
6. **Monitor Failed**: Check failed emails and retry or fix email addresses

## Security Notes

⚠️ **Never commit your App Password to Git**
⚠️ **The password is entered in the browser and sent via HTTPS**
⚠️ **Only admin users (bhcg@hyderabad.bits-pilani.ac.in) can access this feature**

## Default Template

The default template includes:
- BHCG introduction and value proposition
- Core competencies list
- Alumni company mentions
- Call to action for collaboration
- Brochure link
- Social media links

You can customize this template in the Template tab or reset to default anytime.

## Statistics Dashboard

The admin page shows:
- **Total Leads**: All leads in database
- **Mailed**: Successfully sent emails
- **Not Mailed**: Ready to contact
- **Failed**: Need attention/retry

## API Endpoint

The email system uses: `POST /api/send-emails`

Request body:
```json
{
  "leadIds": ["id1", "id2"],
  "emailTemplate": {
    "subject": "...",
    "body": "..."
  },
  "smtpConfig": {
    "email": "...",
    "password": "...",
    "smtpServer": "smtp.gmail.com",
    "smtpPort": 587
  }
}
```

Response:
```json
{
  "success": true,
  "results": {
    "successful": ["id1"],
    "failed": []
  },
  "message": "Successfully sent 1 emails, 0 failed"
}
```

## Support

For issues or questions:
1. Check this guide first
2. Check browser console for errors
3. Verify database migration was successful
4. Test with a single email first

---

**Note**: Remember to always get permission before sending emails to contacts in your database.
