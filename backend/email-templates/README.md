# ResAlign AI - Waitlist Confirmation Email

Beautiful, responsive HTML email template for waitlist confirmation.

## Preview

The email includes:
- ✨ Modern dark theme matching ResAlign AI branding
- 📱 Fully responsive design (mobile-optimized)
- 🎨 Gradient backgrounds and smooth animations
- 📋 Feature highlights with icons
- 🔗 Social media links
- ✅ Professional footer

## Files

- **`waitlist-confirmation.html`** - Standalone HTML template for preview/testing
- **`SETUP_INSTRUCTIONS.md`** - Complete setup guide for Supabase + Resend integration
- **`../supabase/functions/send-waitlist-email/index.ts`** - Edge Function that sends the email

## Quick Start

### 1. Preview the Email

Open `waitlist-confirmation.html` in a browser to see how the email looks. Replace `{{name}}` with an actual name to preview personalization.

### 2. Deploy to Production

Follow the detailed instructions in `SETUP_INSTRUCTIONS.md` to:
1. Set up Resend for email delivery
2. Deploy the Supabase Edge Function
3. Configure environment variables
4. Test the complete flow

### 3. Customize

Edit the HTML template to match your brand:
- Update colors in the inline styles
- Replace social media links
- Modify copy and messaging
- Add your logo URL

## Testing Locally

To preview the email with a real name:

```bash
# Create a test HTML file
cp waitlist-confirmation.html test-email.html

# Replace the {{name}} placeholder
# On Windows (PowerShell):
(Get-Content test-email.html) -replace '{{name}}', 'John Doe' | Set-Content test-email.html

# On macOS/Linux:
sed -i '' 's/{{name}}/John Doe/g' test-email.html

# Open in browser
open test-email.html  # macOS
xdg-open test-email.html  # Linux
start test-email.html  # Windows
```

## Production Deployment

Required services:
- **Supabase** - Database and Edge Functions (free tier available)
- **Resend** - Email delivery service (3,000 emails/month free)

See `SETUP_INSTRUCTIONS.md` for step-by-step deployment guide.

## Email Client Compatibility

Tested and optimized for:
- ✅ Gmail (web and mobile)
- ✅ Outlook (2016+, web)
- ✅ Apple Mail (iOS and macOS)
- ✅ Yahoo Mail
- ✅ Thunderbird

## Support

Need help? Check:
1. `SETUP_INSTRUCTIONS.md` for detailed setup steps
2. [Supabase Docs](https://supabase.com/docs/guides/functions)
3. [Resend Docs](https://resend.com/docs/send-with-nodejs)

---

Made with 💜 by ResAlign AI Team

