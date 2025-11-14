# Legal Documents Guide for ResAlign AI

This guide explains the three legal documents we've created for ResAlign AI before your public launch.

---

## Overview

We've created three essential legal documents tailored to your application:

1. **Privacy Policy** (`PRIVACY_POLICY.md`) - Explains how you collect, use, and protect user data
2. **Terms of Service** (`TERMS_OF_SERVICE.md`) - Establishes the legal agreement between you and users
3. **Cookie Policy** (`COOKIE_POLICY.md`) - Details how you use cookies and tracking technologies

All documents are customized based on your actual codebase and services used.

---

## Document Summaries

### 1. Privacy Policy (`PRIVACY_POLICY.md`)

**Purpose:** Tells users what data you collect and how you use it

**Key Sections:**
- **Data Collection:** Details about resumes, job descriptions, user accounts, authentication data, cookies, and usage information
- **Third-Party Services:** Information about Supabase, Reducto AI, Google Gemini, and Resend
- **Data Usage:** How data is used for service delivery, security, improvement, communication, and legal compliance
- **User Rights:** Access, correction, deletion, data portability rights
- **Jurisdiction-Specific Rights:** CCPA (California), GDPR (EU/UK), and other jurisdiction requirements
- **Security Measures:** Encryption, authentication, access controls, retention policies
- **Contact Information:** Where users can reach you with privacy questions

**What It Covers Specific to Your App:**
- Resume and job description file uploads
- Extraction of structured data (skills, experience, education, etc.)
- Analysis records and compatibility scores
- Waitlist email collection
- Supabase authentication and storage
- Email sending via Resend
- Google Gemini AI processing

---

### 2. Terms of Service (`TERMS_OF_SERVICE.md`)

**Purpose:** Legal agreement governing your relationship with users

**Key Sections:**
- **Acceptance:** Users must agree to use the service
- **Service Description:** What ResAlign AI is and what it does
- **User Eligibility:** Age requirements (13+), account creation, responsibility
- **Prohibited Conduct:** What users cannot do (illegal activity, harassment, scraping, etc.)
- **Intellectual Property:** You own the platform, users own their content
- **Limitations of Liability:** Important disclaimers about accuracy and damages
- **Third-Party Services:** Disclaimers about third-party service availability
- **Termination:** How accounts can be terminated by users or you
- **Dispute Resolution:** How disputes will be handled (arbitration in California)
- **Non-Professional Service Disclaimer:** Career analysis is not professional advice

**Important Disclaimers:**
- Analysis accuracy is not guaranteed
- Compatibility scores don't guarantee job offers or interviews
- Service is provided "as-is"
- Limited liability for damages

---

### 3. Cookie Policy (`COOKIE_POLICY.md`)

**Purpose:** Explains cookie usage and gives users control over tracking

**Key Sections:**
- **Cookie Types:** Session, persistent, first-party, third-party cookies
- **Cookies You Use:**
  - `sb-auth-token` - Supabase authentication (required)
  - `sb-session-id` - Session tracking (required)
  - `_session_id` - CSRF protection (required)
  - `user_preferences` - UI preferences (functional)
  - `last_tab` - Tab state (functional)
- **LocalStorage:** How Supabase SDK uses browser storage
- **Third-Party Services:** Supabase, Google Analytics (if used)
- **Browser Controls:** Instructions for users to manage cookies
- **Consent Requirements:** EU/GDPR compliant consent mechanisms
- **Opt-Out Options:** How to disable cookies and analytics

**Cookies You DON'T Use:**
- No marketing/advertising cookies
- No cross-site tracking
- No behavioral targeting

---

## Implementation Checklist

### Phase 1: Review and Customize (Required Before Launch)

- [ ] **Review all three documents** to ensure they match your current business practices
- [ ] **Update placeholder email:** Change `privacy@alignai.cv` and `support@alignai.cv` to your actual support emails
- [ ] **Update dates:** Change "January 1, 2025" to your actual effective dates
- [ ] **Verify third-party services:** Confirm Supabase, Reducto, Google Gemini, Resend are the services you're using
- [ ] **Check retention policies:** Verify the data retention periods match your system (currently 24-hour cleanup for files)
- [ ] **Add to website footer:** Create links to all three policies on your website
- [ ] **Add to signup/login:** Require users to accept ToS and Privacy Policy during registration
- [ ] **Cookie banner:** Implement consent mechanism for non-essential cookies (EU compliance)

### Phase 2: Website Integration

- [ ] Create `/privacy`, `/terms`, `/cookies` pages on your website
- [ ] Add links in website footer pointing to these pages
- [ ] Display cookie consent banner on first visit (especially for EU users)
- [ ] Include ToS/Privacy acceptance checkbox in signup form
- [ ] Add privacy/terms links in account settings

### Phase 3: Frontend Changes

Consider implementing these UI improvements:

```html
<!-- Footer Footer Links -->
<footer>
  <a href="/privacy">Privacy Policy</a>
  <a href="/terms">Terms of Service</a>
  <a href="/cookies">Cookie Policy</a>
</footer>

<!-- Signup Form Checkbox -->
<input type="checkbox" required>
<label>I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a></label>

<!-- Cookie Consent Banner -->
<div class="cookie-banner">
  <p>We use cookies to enhance your experience...</p>
  <button onClick={acceptAll}>Accept All</button>
  <button onClick={acceptRequired}>Accept Required Only</button>
  <a href="/cookies">Learn More</a>
</div>
```

### Phase 4: Ongoing Compliance

- [ ] Review policies annually or when services change
- [ ] Update effective dates when changes are made
- [ ] Keep data retention practices aligned with policies
- [ ] Ensure third-party service integrations remain compliant
- [ ] Monitor legal updates (especially GDPR, CCPA, LGPD changes)
- [ ] Respond to user privacy requests within 30 days
- [ ] Maintain records of consent for audits

---

## Key Customizations Made for Your App

### Data Collection Specifics
The Privacy Policy specifically documents:
- PDF file uploads (resumes and job descriptions)
- Extracted structured data (contact info, experience, education, skills, achievements, soft skills)
- Analysis records with compatibility scores and classifications
- Waitlist email and name collection
- JWT token-based authentication
- LocalStorage session persistence

### Third-Party Integrations
The documents are customized for your actual services:
- **Supabase:** Database, authentication, file storage (Supabase Storage)
- **Reducto AI:** PDF processing and data extraction
- **Google Gemini:** AI-powered analysis, recommendations, scoring
- **Resend:** Email service for waitlist confirmations

### Jurisdiction Compliance
Specific sections for:
- **California (CCPA):** Right to know, delete, opt-out, non-discrimination
- **EU/UK (GDPR):** Right to access, rectification, erasure, restrict, portability, object, lodge complaint
- **Other jurisdictions:** General framework for compliance

### Data Retention
Specific retention periods mentioned:
- User account data: 30 days after deletion
- Resume/JD files: 24 hours after last analysis (per your config)
- Analysis results: While account active
- Login/session data: Up to 90 days for audit
- Waitlist data: Until converted to user or deletion requested

---

## Addressing Specific Legal Concerns

### 1. Resume Privacy
Your documents explain:
- Resumes are stored securely in Supabase Storage
- Data is extracted by Reducto (temporary processing)
- Analysis is done by Google Gemini
- You do NOT share resume content with third parties for marketing
- Users can delete files anytime

### 2. Career Analysis Accuracy
Your Terms of Service includes:
- Analysis accuracy is not guaranteed
- Compatibility scores don't guarantee employment
- Results may differ from human assessment
- Service is educational, not professional career advice

### 3. Data Security
Your Privacy Policy describes:
- HTTPS/TLS encryption in transit
- Database encryption at rest
- JWT-based authentication
- Access controls
- Security monitoring

### 4. User Control
All policies explain users can:
- Access their data
- Export their data
- Delete their account
- Update personal information
- Manage cookie preferences
- Opt out of non-essential cookies

---

## Email Addresses in Documents

The following email addresses appear in the documents and should be updated:

| Email | Purpose | Document(s) |
|---|---|---|
| `privacy@alignai.cv` | Privacy questions, data access/deletion requests | Privacy Policy, Cookie Policy |
| `support@alignai.cv` | General support and Terms questions | Terms of Service |

**Update these to your actual support email addresses before launch.**

---

## Important Disclaimers

### What These Documents Do
✅ Explain your actual data practices  
✅ Comply with major privacy laws (GDPR, CCPA, etc.)  
✅ Protect you legally with proper disclaimers  
✅ Give users transparency and control  
✅ Reduce regulatory risk  

### What These Documents Don't Do
❌ Guarantee legal compliance (consult a lawyer)  
❌ Cover every possible jurisdiction
❌ Replace professional legal review  
❌ Constitute legal advice  

### Recommendations
1. **Have a lawyer review** before finalizing - budget $500-2000 for legal review
2. **Get specific legal advice** about GDPR/CCPA compliance if handling EU/CA users
3. **Consider data processing agreements** with Supabase if required by your contracts
4. **Obtain legal opinions** on liability limitations for your jurisdiction
5. **Keep records** of policy updates and user consents

---

## Next Steps for Launch

### Immediate (This Week)
1. Review all three documents line-by-line
2. Update placeholder emails
3. Verify all third-party services mentioned
4. Update dates to your actual launch date
5. Share with co-founders/team for review

### Before Public Launch (1 Week Before)
1. Have a lawyer review the documents
2. Make any requested modifications
3. Implement policy pages on your website
4. Add footer links
5. Update signup/login flow

### At Launch
1. Publish all three policies
2. Require ToS acceptance in signup
3. Display cookie consent banner
4. Notify existing users of new policies
5. Add privacy/terms links to account settings

### After Launch
1. Monitor for legal updates
2. Respond to user privacy requests
3. Review and update policies annually
4. Keep track of any policy changes you make

---

## Additional Resources

### Privacy Law Resources
- **GDPR Guide:** https://gdpr-info.eu/
- **CCPA Guide:** https://oag.ca.gov/privacy/ccpa
- **Privacy Shield:** https://www.privacyshield.gov/
- **COPPA (Children's Privacy):** https://www.ftc.gov/coppa

### Cookie Standards
- **HTTP State Management Mechanism:** https://tools.ietf.org/html/rfc6265
- **ePrivacy Directive:** https://ec.europa.eu/digital-single-market/

### Web Standards
- **HTTPS/TLS:** https://tools.ietf.org/html/rfc8446
- **JWT Authentication:** https://tools.ietf.org/html/rfc7519

### Platform Privacy Policies
- **Supabase Privacy:** https://supabase.com/privacy
- **Google Privacy:** https://policies.google.com/privacy
- **Resend Privacy:** https://resend.com/privacy

---

## Support and Questions

If you have questions about these documents:

1. **General questions:** Review the specific policy section
2. **Legal questions:** Consult with a qualified attorney
3. **Technical implementation:** Refer to the implementation checklist
4. **Updates needed:** Create a new version and date it appropriately

---

**Last Updated:** January 1, 2025  
**Document Version:** 1.0

For questions, contact your legal advisor or see the contact information in each policy document.
