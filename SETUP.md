# Wavelength Booking System - Setup Guide

This guide will help you set up Google Calendar integration and Stripe payment processing for the Wavelength booking system.

## Prerequisites
- A Google account with Google Calendar
- A Stripe account
- Basic knowledge of API keys and OAuth

---

## Part 1: Google Calendar Integration

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click **NEW PROJECT**
4. Enter project name: `Wavelength Booking`
5. Click **CREATE**

### Step 2: Enable Google Calendar API

1. In the Cloud Console, navigate to **APIs & Services > Library**
2. Search for "Google Calendar API"
3. Click on it and press **ENABLE**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **+ CREATE CREDENTIALS > OAuth client ID**
3. If prompted, configure the OAuth consent screen first:
   - Choose **External** user type
   - Fill in app name: `Wavelength Booking`
   - Add your email as support contact
   - Add scopes: `https://www.googleapis.com/auth/calendar`
   - Save and continue

4. Back in Credentials, click **+ CREATE CREDENTIALS > OAuth client ID**
5. Choose **Web application**
6. Add Authorized JavaScript origins: `https://yourdomain.com`
7. Add Authorized redirect URIs: `https://yourdomain.com/callback`
8. Click **CREATE**
9. Copy your **Client ID**

### Step 4: Create an API Key

1. In **APIs & Services > Credentials**, click **+ CREATE CREDENTIALS > API Key**
2. Copy your API Key

### Step 5: Update calendar.js

Replace the following in `calendar.js`:

```javascript
const CALENDAR_CONFIG = {
    apiKey: 'YOUR_GOOGLE_API_KEY',              // Paste your API Key here
    clientId: 'YOUR_GOOGLE_CLIENT_ID',          // Paste your Client ID here
    calendarId: 'YOUR_CALENDAR_ID@gmail.com',   // Your Google Calendar ID
    scope: 'https://www.googleapis.com/auth/calendar'
};
```

**To find your Calendar ID:**
1. Open [Google Calendar](https://calendar.google.com/)
2. Right-click on your calendar > Settings
3. Copy the **Calendar ID** (looks like: `abc123def456@group.calendar.google.com`)

---

## Part 2: Stripe Payment Integration

### Step 1: Create a Stripe Account

1. Go to [Stripe](https://stripe.com)
2. Click **Sign up**
3. Complete registration and email verification

### Step 2: Get Your API Keys

1. In Stripe Dashboard, go to **Developers > API Keys**
2. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)

### Step 3: Update payment.js

Replace the following in `payment.js`:

```javascript
const STRIPE_CONFIG = {
    publishableKey: 'YOUR_STRIPE_PUBLISHABLE_KEY',  // Paste your Publishable key
    backendUrl: 'YOUR_BACKEND_URL'                   // Your backend server URL
};
```

### Step 4: Set Up Backend API

You need a backend server to handle payment intents securely. Here's a minimal Node.js example:

**Create `backend/server.js`:**

```javascript
const express = require('express');
const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency, clientName, clientEmail } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            metadata: {
                clientName: clientName,
                clientEmail: clientEmail
            }
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

**Install dependencies:**
```bash
npm install express stripe cors
```

**Start the server:**
```bash
node server.js
```

### Step 5: Deploy Your Backend

Options:
- **Heroku** (free tier available)
- **AWS Lambda**
- **Vercel**
- **Railway**
- **Your own server**

Update `backendUrl` in `payment.js` to your deployed backend URL.

---

## Part 3: Environment Variables

For security, use environment variables instead of hardcoding keys:

### Create `.env` file:
```
GOOGLE_API_KEY=YOUR_API_KEY
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
GOOGLE_CALENDAR_ID=YOUR_CALENDAR_ID@gmail.com
STRIPE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=YOUR_SECRET_KEY
BACKEND_URL=YOUR_BACKEND_URL
```

### Load in your HTML (using a build tool or server-side rendering):
```html
<script>
    const CALENDAR_CONFIG = {
        apiKey: '{{ GOOGLE_API_KEY }}',
        clientId: '{{ GOOGLE_CLIENT_ID }}',
        calendarId: '{{ GOOGLE_CALENDAR_ID }}'
    };
</script>
```

---

## Part 4: Testing

### Test Google Calendar:
1. Open your booking page
2. Click "Load Google Calendar"
3. Authorize the app when prompted
4. Verify time slots appear

### Test Stripe Payments:
Use Stripe's test card: **4242 4242 4242 4242**
- Expiry: Any future date
- CVC: Any 3 digits

### Test Confirmations:
1. Select a time slot
2. Fill in booking details
3. Use test card to complete payment
4. Verify:
   - Calendar event is created
   - Confirmation email is sent
   - Payment appears in Stripe dashboard

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Calendar won't load | Check API key and Client ID in `calendar.js` |
| Time slots not showing | Verify Calendar ID and OAuth permissions |
| Payment fails | Check Stripe keys and backend URL |
| CORS errors | Add domain to Stripe and Google Cloud allowed origins |
| Emails not sending | Set up email service (SendGrid, AWS SES, etc.) |

---

## Security Checklist

- [ ] Never commit `.env` file to Git
- [ ] Use HTTPS for all connections
- [ ] Validate input on backend
- [ ] Set up CSRF protection
- [ ] Enable Stripe webhook signing
- [ ] Use strong password for Google Cloud account
- [ ] Enable 2FA on Stripe and Google accounts
- [ ] Regularly rotate API keys
- [ ] Monitor Stripe dashboard for suspicious activity

---

## Support
For issues or questions:
- Google Calendar API: https://developers.google.com/calendar
- Stripe Documentation: https://stripe.com/docs
- GitHub Issues: Add your repository issues here

Happy booking!