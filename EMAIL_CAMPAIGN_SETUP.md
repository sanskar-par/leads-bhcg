# Email Campaign Setup Instructions

## 🚀 Quick Setup Guide

### Step 1: Update Database Schema

Run the following SQL in your Supabase SQL Editor to add email status tracking:

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the sidebar
3. Click "New query"
4. Copy and paste the contents of `supabase-add-mailed-status.sql`
5. Click "Run" or press `Ctrl+Enter`

This adds two new columns to the leads table:
- `mailed_status`: Tracks if email was sent ('not_mailed', 'mailed', 'failed')
- `mailed_at`: Timestamp when email was successfully sent

### Step 2: Get Gmail App Password

**Important:** You need a Gmail App Password (not your regular Gmail password)

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification** (if not already enabled)
4. Under "2-Step Verification", find **App passwords**
5. Click on it and generate a new app password for "Mail"
6. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)
7. **Save this password** - you'll need it in the admin dashboard

**Email credentials from Python script:**
- Email: `bhcg@hyderabad.bits-pilani.ac.in`
- App Password: `xncwzpisxnuzpbnt`

### Step 3: Access Admin Dashboard

1. Make sure you're logged in with the admin email: `bhcg@hyderabad.bits-pilani.ac.in`
2. Navigate to `/admin` in your application
3. You should see:
   - **Statistics cards** showing total leads, mailed, not mailed, and failed counts
   - **Email sender interface** with filters and template editor

### Step 4: Configure Email Settings

In the Admin Dashboard:

1. Go to the **Settings** tab
2. Enter your email configuration:
   - **SMTP Server**: `smtp.gmail.com` (default for Gmail)
   - **SMTP Port**: `587` (default for Gmail)
   - **Email Address**: `bhcg@hyderabad.bits-pilani.ac.in`
   - **Password**: Paste your 16-character app password
   - **Display Name**: `BITS Hyderabad Consulting Group`

### Step 5: Customize Email Template (Optional)

The default template is pre-configured with the BHCG branding. To customize:

1. Go to the **Template** tab
2. Edit the subject line and body
3. Use these variables that will be auto-replaced:
   - `{name}` - Recipient's name
   - `{company}` - Company name
   - `{roleType}` - Role type
   - `{industry}` - Industry

4. Use the **Preview** tab to see how the email looks

### Step 6: Filter and Select Recipients

1. Go to the **Send Emails** tab
2. Use the **Filter** dropdown to select leads:
   - **Not Mailed** (default) - Leads that haven't been emailed yet
   - **All** - All leads in database
   - **Mailed** - Previously sent emails
   - **Failed** - Failed email attempts

3. Use the **Search** box to find specific leads by name, email, or company

4. Select leads:
   - Check individual leads
   - Or click "Select All Filtered" to select all visible leads

### Step 7: Send Emails

1. Review your selected leads (count shown in the send button)
2. Click **"Send X Emails"** button
3. Confirm the action in the popup
4. Monitor progress:
   - Success notification will show count of sent/failed emails
   - Status cards will update automatically
   - Lead status will change to "Mailed" for successful sends

### Step 8: Monitor Results

After sending:
- **Statistics cards** update in real-time
- Each lead shows a status badge:
  - 🟢 **Mailed** - Successfully sent
  - 🟡 **Not Mailed** - Not sent yet
  - 🔴 **Failed** - Send failed
- Filter by status to resend failed emails or view sent emails

## 📧 Email Features

### Default Template Includes:
- Professional BHCG introduction
- Core competencies list
- Alumni credentials
- Collaboration invitation
- Brochure link
- Social media links (LinkedIn, Instagram, Website)

### Rate Limiting:
- 2 seconds delay between each email
- Prevents Gmail from flagging as spam
- Keeps within Gmail's 500 emails/day limit

### Error Handling:
- Failed emails are marked with "failed" status
- Can be filtered and resent
- Error messages logged in console

## 🔒 Security Notes

1. **Never commit your app password** to git
2. Only the admin email can access `/admin`
3. App password is only stored in session (not persisted)
4. Use environment variables for production deployment

## 🐛 Troubleshooting

### "Authentication failed"
- Check your app password is correct (16 characters, no spaces)
- Ensure 2-Factor Authentication is enabled on Gmail
- Try generating a new app password

### Emails going to spam
- The default template is designed to avoid spam filters
- Ask recipients to add your email to their contacts
- Don't send more than 25 emails per batch

### "Failed to send" errors
- Check your internet connection
- Verify SMTP settings are correct
- Ensure Gmail hasn't blocked the app password

### Stats not updating
- Refresh the page
- Check browser console for errors
- Verify the SQL migration was run successfully

## 📊 Understanding Status Cards

### Total Leads
- All leads in the database, regardless of status

### Successfully Mailed
- Emails that were sent without errors
- Includes timestamp of when sent

### Not Mailed
- Leads that haven't been emailed yet
- Default status for all new leads

### Failed
- Emails that encountered errors during sending
- Can be retried after fixing issues

## 🎯 Best Practices

1. **Test First**: Send to 1-2 test emails before bulk sending
2. **Use Filters**: Start with "Not Mailed" to avoid duplicates
3. **Batch Sending**: Send in batches of 20-25 to avoid rate limits
4. **Monitor Results**: Check status cards after each batch
5. **Retry Failed**: Filter by "Failed" status and retry after fixing issues
6. **Personalize**: Keep the template personalized with variables
7. **Stay Professional**: Maintain the BHCG branding and tone

## 📝 Column Descriptions

### Database Columns Added:
```sql
mailed_status TEXT DEFAULT 'not_mailed'
  - 'not_mailed': Lead hasn't been emailed
  - 'mailed': Email sent successfully
  - 'failed': Email send failed

mailed_at TIMESTAMPTZ
  - Timestamp when email was successfully sent
  - NULL if not sent or failed
```

## 🚀 Ready to Go!

Once you've completed all steps:
1. SQL migration is run ✅
2. Gmail app password is ready ✅
3. Admin dashboard is accessible ✅
4. Template is configured ✅

You're ready to start your email campaign! 🎉

---

**Need Help?**
- Check the browser console for detailed error messages
- Verify all SQL migrations are run in Supabase
- Ensure you're logged in with the admin email
- Double-check your Gmail app password
