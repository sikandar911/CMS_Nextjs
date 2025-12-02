# University Success Kit Email Automation Setup

## Overview
This setup automatically sends the "University Success Kit" PDF to users who submit the form on the landing page.

## What Was Created

### 1. Component: `UniversityKitForm.tsx`
- Location: `/components/UniversityKitForm.tsx`
- Supports both desktop and mobile variants
- Handles form submission with loading states
- Displays success/error messages

### 2. API Route: `/api/university-kit`
- Location: `/app/api/university-kit/route.ts`
- Handles email sending via Office365 SMTP
- Attaches the PDF file
- Sends professional HTML email

### 3. Updated Landing Page
- Location: `/app/page.tsx`
- Uses the new component for both desktop and mobile forms

## Required Setup

### Step 1: Add the PDF File
Place your PDF file in the public folder:
```
/public/Blog Lead Magnet-2.pdf
```

The file MUST be named exactly: `Blog Lead Magnet-2.pdf`

If you want to use a different filename, update line 46 in `/app/api/university-kit/route.ts`:
```typescript
const pdfPath = path.join(process.cwd(), 'public', 'YOUR-FILE-NAME.pdf')
```

### Step 2: Email Configuration (Already Done)
The email is configured with:
- **Host**: smtp.office365.com
- **Port**: 587
- **Username**: noreply@uapp.uk
- **Password**: Q!!&707281213598ut
- **Display Name**: UAPP

⚠️ **Security Note**: For production, move these credentials to environment variables in `.env`:
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=noreply@uapp.uk
SMTP_PASS=Q!!&707281213598ut
```

Then update `/app/api/university-kit/route.ts`:
```typescript
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
}
```

### Step 3: Test the Setup
1. Start the dev server: `npm run dev`
2. Go to the homepage
3. Fill in the form with your email
4. Check your inbox for the email with PDF attachment

## Email Template Features

The email includes:
- ✅ Professional HTML design with UAPP branding
- ✅ Personalized greeting with user's first name
- ✅ PDF attachment (renamed to "University-Success-Kit.pdf")
- ✅ Clear attachment indicator
- ✅ Call-to-action buttons linking to blog
- ✅ Footer with copyright and links
- ✅ Plain text fallback for email clients that don't support HTML

## Troubleshooting

### PDF Not Found Error
- Ensure `Blog Lead Magnet-2.pdf` exists in `/public/` folder
- Check file name spelling (case-sensitive on Linux servers)

### Email Not Sending
- Verify SMTP credentials are correct
- Check Office365 allows SMTP access
- Ensure port 587 is not blocked by firewall
- Check email server logs in terminal

### Form Not Submitting
- Open browser console (F12) to see error messages
- Verify API route is accessible at `/api/university-kit`
- Check network tab for failed requests

## File Structure
```
CMS_Nextjs-main/
├── app/
│   ├── api/
│   │   └── university-kit/
│   │       └── route.ts          # Email API handler
│   └── page.tsx                   # Landing page (updated)
├── components/
│   └── UniversityKitForm.tsx      # Form component
└── public/
    └── Blog Lead Magnet-2.pdf     # PDF to send (YOU NEED TO ADD THIS)
```

## Next Steps

1. **Add the PDF file** to `/public/` folder
2. **Test the form** on localhost
3. **Move credentials to .env** before deploying to production
4. **Optional**: Add database logging to track submissions (create a table to store name, email, timestamp)

## Security Best Practices

⚠️ **Before deploying to production**:
1. Move all SMTP credentials to environment variables
2. Add rate limiting to prevent spam
3. Add CAPTCHA to prevent bots
4. Validate and sanitize all user inputs
5. Add email verification to prevent fake emails
6. Consider using a service like SendGrid or AWS SES for better deliverability

## Support

If you encounter issues:
1. Check the terminal for error logs
2. Verify PDF file exists and is accessible
3. Test SMTP credentials with a simple email client
4. Ensure Office365 account allows SMTP access
