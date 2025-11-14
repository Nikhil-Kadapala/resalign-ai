# Waitlist Confirmation Email Setup Guide

This guide explains how to set up automated confirmation emails for users joining the ResAlign AI waitlist.

## Overview

When a user joins the waitlist through the frontend modal:
1. Their email and name are stored in the Supabase `waitlist` table
2. A Supabase Edge Function is triggered to send a confirmation email
3. The user receives a beautifully designed email with information about ResAlign AI

## Prerequisites

- Supabase project set up
- Supabase CLI installed (`npm install -g supabase`)
- [Resend](https://resend.com) account for email delivery (free tier available)

## Setup Steps

### 1. Create Waitlist Table in Supabase

If you haven't already, create the `waitlist` table in your Supabase database:

```sql
CREATE TABLE waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for public waitlist signup)
CREATE POLICY "Allow public insert" ON waitlist
  FOR INSERT
  WITH CHECK (true);

-- Allow users to read their own entries
CREATE POLICY "Allow users to read own entry" ON waitlist
  FOR SELECT
  USING (true);
```

### 2. Set Up Resend for Email Delivery

1. **Sign up for Resend**: Go to [resend.com](https://resend.com) and create an account
2. **Verify your domain** (optional but recommended for production):
   - Add your domain in the Resend dashboard
   - Add the required DNS records to your domain registrar
   - Wait for verification (can take a few hours)
3. **Get your API key**:
   - Navigate to API Keys in the Resend dashboard
   - Create a new API key
   - Copy the key (you'll need it in step 4)

> **Note**: For testing, you can use Resend's testing domain (e.g., `onboarding@resend.dev`), which doesn't require domain verification.

### 3. Deploy the Supabase Edge Function

The Edge Function is located at: `supabase/functions/send-waitlist-email/index.ts`

**Deploy the function:**

```bash
# From the project root directory
cd x:\align-ai

# Login to Supabase (if not already logged in)
supabase login

# Link your project (replace with your project ref)
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-waitlist-email
```

### 4. Configure Environment Variables

Set the required environment variables for the Edge Function:

```bash
# Set the Resend API key
supabase secrets set RESEND_API_KEY=re_your_resend_api_key_here
```

**Verify secrets are set:**

```bash
supabase secrets list
```

You should see:
- `RESEND_API_KEY` (your Resend API key)
- `SUPABASE_URL` (automatically set)
- `SUPABASE_SERVICE_ROLE_KEY` (automatically set)

### 5. Test the Email Function

You can test the function directly using curl or from the Supabase dashboard:

**Using curl:**

```bash
curl -X POST 'https://your-project-ref.supabase.co/functions/v1/send-waitlist-email' \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "test@example.com"
  }'
```

**From Supabase Dashboard:**

1. Go to Edge Functions in your Supabase dashboard
2. Click on `send-waitlist-email`
3. Use the "Invoke" button with test data:
   ```json
   {
     "name": "John Doe",
     "email": "test@example.com"
   }
   ```

### 6. Verify Frontend Integration

The frontend `WaitlistModal` component is already configured to call this Edge Function. Ensure your environment variables are set in `.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_KEY=your_supabase_anon_key
```

### 7. Test End-to-End Flow

1. Run the frontend: `cd frontend && npm run dev`
2. Click "Join Waitlist" button
3. Fill in your name and email
4. Submit the form
5. Check:
   - Entry appears in Supabase `waitlist` table
   - Confirmation email arrives in inbox
   - Email displays correctly (check spam folder if needed)

## Email Template Customization

### Modify the Email Template

The email template is embedded in the Edge Function at `supabase/functions/send-waitlist-email/index.ts` in the `getEmailHTML()` function.

You can also use the standalone HTML template at `backend/email-templates/waitlist-confirmation.html` as a reference for design changes.

**To customize:**

1. Edit the HTML in the `getEmailHTML()` function
2. Test locally if possible (see Testing section below)
3. Redeploy the function: `supabase functions deploy send-waitlist-email`

### Key Customization Points

- **Logo**: Replace the `R` placeholder with your actual logo URL
- **Brand colors**: Update the gradient colors (currently purple/blue theme)
- **Copy**: Modify the welcome text and feature descriptions
- **Social links**: Update URLs to match your social media profiles
- **Sender email**: Change `from: 'ResAlign AI <onboarding@resalignai.com>'` to your verified domain

## Troubleshooting

### Emails Not Sending

1. **Check Edge Function logs:**
   ```bash
   supabase functions logs send-waitlist-email
   ```

2. **Verify Resend API key:**
   ```bash
   supabase secrets list
   ```

3. **Check Resend dashboard:**
   - Go to resend.com/emails
   - Look for failed delivery attempts
   - Check error messages

### Emails Going to Spam

- Verify your domain in Resend
- Add SPF, DKIM, and DMARC DNS records
- Avoid spam trigger words in subject/body
- Test with different email providers

### Function Timeout

If emails are timing out:
- Check Resend API response time
- Ensure RESEND_API_KEY is correct
- Check network connectivity from Supabase Edge Functions

### HTML Rendering Issues

Different email clients render HTML differently. Test with:
- Gmail (web and mobile)
- Outlook (desktop and web)
- Apple Mail
- Yahoo Mail

Use [Litmus](https://litmus.com) or [Email on Acid](https://www.emailonacid.com) for comprehensive testing.

## Production Checklist

Before going live:

- [ ] Verify your domain in Resend
- [ ] Update sender email to use your verified domain
- [ ] Test with real email addresses
- [ ] Check spam folder placement
- [ ] Test on multiple email clients
- [ ] Set up email monitoring/alerts
- [ ] Update privacy policy to mention waitlist emails
- [ ] Add unsubscribe link (if required by your email volume)

## Cost Considerations

**Resend Pricing (as of 2025):**
- Free tier: 3,000 emails/month
- Pro: $20/month for 50,000 emails
- Scale: Custom pricing

**Supabase Edge Functions:**
- Free tier: 500K invocations/month
- 2GB bandwidth/month
- Pro: $25/month with higher limits

## Alternative Email Providers

If you prefer a different email service, you can modify the Edge Function to use:

- **SendGrid**: Popular, reliable, good free tier
- **Mailgun**: Developer-friendly, competitive pricing
- **Amazon SES**: Very low cost, requires more setup
- **Postmark**: Excellent deliverability, transactional focus

Update the fetch call in `index.ts` to match your provider's API.

## Support

For issues:
- Supabase: [supabase.com/docs](https://supabase.com/docs)
- Resend: [resend.com/docs](https://resend.com/docs)
- This project: Open an issue on GitHub

## Files in This Setup

- `backend/email-templates/waitlist-confirmation.html` - Standalone email template (reference)
- `supabase/functions/send-waitlist-email/index.ts` - Edge Function that sends emails
- `frontend/src/components/WaitlistModal.tsx` - Frontend component that triggers email
- `backend/email-templates/SETUP_INSTRUCTIONS.md` - This file

---

**Last Updated**: October 26, 2025

