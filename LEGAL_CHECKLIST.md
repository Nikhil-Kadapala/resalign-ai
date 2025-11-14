# Legal Compliance Pre-Launch Checklist

## Quick Reference Guide

Use this checklist to ensure legal compliance before your public launch of ResAlign AI.

---

## 🔍 Review Phase (1-2 days)

### Document Review
- [ ] Read PRIVACY_POLICY.md completely
- [ ] Read TERMS_OF_SERVICE.md completely
- [ ] Read COOKIE_POLICY.md completely
- [ ] Read LEGAL_DOCUMENTS_README.md for context
- [ ] Verify all information matches your actual practices

### Customization Required
- [ ] Replace `privacy@alignai.cv` with your actual email (3 locations)
- [ ] Replace `support@alignai.cv` with your actual email (2 locations)
- [ ] Update "January 1, 2025" effective dates with your actual dates
- [ ] Verify Supabase, Reducto, Google Gemini, Resend are still your services
- [ ] Check data retention periods match your config (24 hours for files)
- [ ] Verify jurisdiction (currently California) is appropriate for you

---

## ⚖️ Legal Review Phase (3-7 days)

### Professional Review
- [ ] Have a lawyer review all three policies
- [ ] Get legal opinion on liability limitations
- [ ] Get specific advice for your target jurisdictions
- [ ] Ask about GDPR/CCPA compliance requirements
- [ ] Ask about data processing agreements with Supabase
- [ ] Get written confirmation of legal compliance

### Important Questions for Your Lawyer
- Does our liability limitation work in our jurisdiction?
- Do we need separate terms for EU users?
- Should we have data processing agreements with third parties?
- Are we compliant with COPPA if any users are under 13?
- What's the best way to handle disputes (arbitration vs. litigation)?

---

## 🌐 Website Integration Phase (3-5 days)

### Create Policy Pages
- [ ] Create `/privacy` page with PRIVACY_POLICY.md content
- [ ] Create `/terms` page with TERMS_OF_SERVICE.md content
- [ ] Create `/cookies` page with COOKIE_POLICY.md content
- [ ] Test all three pages load correctly
- [ ] Ensure pages are mobile-responsive
- [ ] Add links to all three in footer

### Update Navigation
- [ ] Add footer section with links to all three policies
- [ ] Add policy links in account settings
- [ ] Add policy links in signup/login flow
- [ ] Test all links work and go to correct pages

### Signup/Login Integration
- [ ] Add checkbox: "I agree to Terms of Service and Privacy Policy"
- [ ] Make checkbox required before signup
- [ ] Store consent records with timestamp
- [ ] Display links to policies next to checkbox
- [ ] Add to backend verification

---

## 🍪 Cookie Implementation Phase (2-3 days)

### Consent Banner
- [ ] Implement cookie consent banner (especially for EU visitors)
- [ ] Banner should appear on first visit
- [ ] Button: "Accept All Cookies"
- [ ] Button: "Accept Required Only"
- [ ] Link: "Learn More" → /cookies page
- [ ] Test banner displays correctly

### Cookie Management
- [ ] Add "Manage Preferences" option in settings
- [ ] Allow users to change cookie preferences
- [ ] Document each cookie using table in COOKIE_POLICY.md
- [ ] Test cookie blocking doesn't break app
- [ ] Verify only necessary cookies work when others disabled

### LocalStorage
- [ ] Review all LocalStorage items in app
- [ ] Update COOKIE_POLICY.md if items differ from:
  - `sb-session`
  - `sb-user`
  - `app-preferences`
- [ ] Document purpose and duration of each

---

## 🔐 Data Handling Phase (2-3 days)

### Data Subject Rights Implementation
- [ ] Create endpoint for users to request their data
- [ ] Create endpoint for users to delete their account
- [ ] Create endpoint for users to export their data
- [ ] Set 30-day response time for data requests
- [ ] Log all data requests for compliance

### Retention Policies
- [ ] Verify resume/JD files auto-delete after 24 hours (check config)
- [ ] Verify user data deleted 30 days after account deletion
- [ ] Verify login logs retained for 90 days max
- [ ] Test cleanup processes work automatically
- [ ] Create manual cleanup script as backup

### Security
- [ ] Verify HTTPS/TLS on all endpoints
- [ ] Verify JWT tokens are secure
- [ ] Verify passwords are hashed (Supabase handles)
- [ ] Verify file access is restricted to user only
- [ ] Conduct security audit or penetration test (optional but recommended)

---

## 📧 Email & Communication Phase (1-2 days)

### Waitlist Emails
- [ ] Verify Resend is used for sending (check COOKIE_POLICY.md)
- [ ] Update email footer with company info
- [ ] Include unsubscribe link in all marketing emails
- [ ] Test email sending works

### User Communications
- [ ] Prepare welcome email with links to policies
- [ ] Prepare account deletion confirmation email
- [ ] Prepare data export email
- [ ] Prepare policy update notification template

---

## 📋 Audit & Documentation Phase (1-2 days)

### Documentation
- [ ] Create document of all data you collect
- [ ] Create document of all third-party services
- [ ] Create data flow diagram (where data goes)
- [ ] Create retention schedule
- [ ] Store these safely for audits

### Testing
- [ ] Test signup flow with policy acceptance
- [ ] Test cookie consent banner
- [ ] Test user data deletion works
- [ ] Test user data export works
- [ ] Test all policy links work
- [ ] Test on mobile devices
- [ ] Test in different browsers

---

## 🚀 Pre-Launch Final Check (1 day)

### Last Minute Review
- [ ] All three policies are publicly accessible
- [ ] All links in policies are working
- [ ] Email addresses are correct and monitored
- [ ] Signup requires terms acceptance
- [ ] Cookie banner displays on first visit
- [ ] Policy pages look professional and complete
- [ ] No broken links or formatting issues
- [ ] Mobile version looks good

### Communication Preparation
- [ ] Draft announcement about policies
- [ ] Prepare FAQ about privacy practices
- [ ] Prepare responses to common questions
- [ ] Set up email monitoring for privacy@alignai.cv
- [ ] Set up email monitoring for support@alignai.cv

---

## ✅ Launch Day

- [ ] Publish all three policies on website
- [ ] Enable cookie consent banner
- [ ] Make policy acceptance required in signup
- [ ] Monitor for user questions about policies
- [ ] Have lawyer contact ready in case of issues

---

## 📊 Post-Launch Compliance (Ongoing)

### Weekly
- [ ] Monitor privacy@alignai.cv and support@alignai.cv for inquiries
- [ ] Respond to any user privacy requests

### Monthly
- [ ] Review data deletion logs
- [ ] Check data retention is working properly
- [ ] Verify third-party services are still compliant

### Quarterly
- [ ] Review privacy practices for changes
- [ ] Update policies if needed
- [ ] Check for legal updates in your jurisdiction

### Annually
- [ ] Full review of all three policies
- [ ] Check third-party service policies haven't changed
- [ ] Get updated legal review if major changes
- [ ] Update effective dates if minor changes
- [ ] Document all changes made during the year

---

## 🚨 Critical Reminders

### Don't Forget
⚠️ **Emails must be monitored** - Users have 30-day response time expectation  
⚠️ **Data deletion must work** - Test deletion process thoroughly  
⚠️ **Cookies need consent** - EU users especially need clear consent  
⚠️ **Policies must be updated** - If you add/remove services or change practices  
⚠️ **Legal review is essential** - Don't launch without attorney review  

### Common Mistakes to Avoid
❌ Using placeholder emails that aren't monitored  
❌ Forgetting to update policies when adding new services  
❌ Not implementing cookie consent banner  
❌ Not requiring policy acceptance in signup  
❌ Deleting data before retention period ends  
❌ Sharing user data with third parties not mentioned in policies  

---

## 📞 Support Resources

### In This Project
- **PRIVACY_POLICY.md** - Full privacy policy (13 sections)
- **TERMS_OF_SERVICE.md** - Full terms (19 sections)
- **COOKIE_POLICY.md** - Full cookie policy (15 sections)
- **LEGAL_DOCUMENTS_README.md** - Comprehensive guide

### External Resources
- **GDPR Compliance:** https://gdpr-info.eu/
- **CCPA Compliance:** https://oag.ca.gov/privacy/ccpa
- **Privacy Laws Database:** https://iapp.org/resources/
- **Template Agreements:** https://github.com/cogent/legal-templates

### When to Hire a Lawyer
- If you have users outside US/UK/EU
- If you plan to monetize user data
- If you handle payment information
- If you process data from minors
- If you have high liability exposure
- Before your Series A funding round

---

## Document Status

| Document | Status | Last Updated | Review By Lawyer |
|----------|--------|--------------|-----------------|
| Privacy Policy | ✅ Ready | Jan 1, 2025 | ⬜ Not yet |
| Terms of Service | ✅ Ready | Jan 1, 2025 | ⬜ Not yet |
| Cookie Policy | ✅ Ready | Jan 1, 2025 | ⬜ Not yet |

---

**Update this checklist as you complete items. Print or bookmark for easy reference!**

**Last Updated:** January 1, 2025  
**For:** ResAlign AI  
**Status:** Ready for Launch Preparation
