# HubSpot CRM Integration Setup Guide

## 1. Create HubSpot App

1. Go to [HubSpot Developer Portal](https://developers.hubspot.com/)
2. Sign in with your HubSpot account
3. Click "Create app" button
4. Fill in app details:
   - App name: **IQsion Analytics**
   - Description: **B2B SaaS marketing intelligence platform**
   - Logo: Upload IQsion logo

## 2. Configure OAuth Settings

### Redirect URLs
Add the following redirect URL in the "Auth" tab:
```
https://app.iqsion.com/api/auth/hubspot/callback
```

For local development, also add:
```
http://localhost:5000/api/auth/hubspot/callback
```

### Required Scopes
In the "Auth" tab, select the following scopes:

**CRM Scopes:**
- `crm.objects.contacts.read` - Read contacts
- `crm.objects.companies.read` - Read companies
- `crm.objects.deals.read` - Read deals
- `crm.objects.leads.read` - Read leads (optional)
- `crm.schemas.contacts.read` - Read contact properties
- `crm.schemas.companies.read` - Read company properties
- `crm.schemas.deals.read` - Read deal properties

**Analytics Scopes:**
- `analytics.behavioral_events.send` - Send behavioral events (optional)

## 3. Get Credentials

After creating the app, go to the "Auth" tab and copy:

1. **Client ID** - Your app's public identifier
2. **Client Secret** - Your app's secret key (keep this secure!)

## 4. Update Environment Variables

Add the following to your `.env` file (or `Maint/server/env`):

```bash
HUBSPOT_CLIENT_ID=your_client_id_here
HUBSPOT_CLIENT_SECRET=your_client_secret_here
HUBSPOT_REDIRECT_URI=https://app.iqsion.com/api/auth/hubspot/callback
```

For local development:
```bash
HUBSPOT_REDIRECT_URI=http://localhost:5000/api/auth/hubspot/callback
```

## 5. Test Connection

1. Restart your server: `npm run dev:all`
2. Go to Settings page: http://localhost:5173/settings (or https://app.iqsion.com/settings)
3. Find HubSpot in the platform connections list
4. Click "Connect" button
5. Authorize IQsion to access your HubSpot account
6. You'll be redirected back to settings with a success message

## 6. Verify Data Access

After connecting, test the integration:

1. Click "Test Connection" on the HubSpot card
2. You should see:
   - Portal/Hub ID
   - Total contacts count
   - Total deals count
   - Total companies count

## API Endpoints

Once connected, you can access HubSpot data via these endpoints:

### Get Contacts
```bash
GET /api/hubspot/contacts?userId=YOUR_USER_ID
```

Response:
```json
{
  "contacts": [
    {
      "id": "123",
      "properties": {
        "email": "contact@example.com",
        "firstname": "John",
        "lastname": "Doe",
        "company": "Acme Corp",
        "lifecyclestage": "lead"
      }
    }
  ],
  "total": 150
}
```

### Get Deals
```bash
GET /api/hubspot/deals?userId=YOUR_USER_ID
```

Response:
```json
{
  "deals": [
    {
      "id": "456",
      "properties": {
        "dealname": "Enterprise Deal",
        "amount": "50000",
        "dealstage": "closedwon",
        "closedate": "2026-01-15"
      }
    }
  ],
  "total": 45
}
```

### Get Companies
```bash
GET /api/hubspot/companies?userId=YOUR_USER_ID
```

Response:
```json
{
  "companies": [
    {
      "id": "789",
      "properties": {
        "name": "Tech Solutions Inc",
        "domain": "techsolutions.com",
        "industry": "Software"
      }
    }
  ],
  "total": 30
}
```

### Test Connection
```bash
GET /api/hubspot/summary?userId=YOUR_USER_ID
```

Response:
```json
{
  "success": true,
  "accountId": "12345678",
  "accountName": "company.hubspot.com",
  "totals": {
    "contacts": 150,
    "deals": 45,
    "companies": 30
  }
}
```

## Troubleshooting

### "Missing HUBSPOT_CLIENT_ID" Error
- Make sure you've added the credentials to your `.env` file
- Restart the server after updating environment variables

### "Invalid redirect_uri" Error
- Check that the redirect URI in your HubSpot app matches exactly
- Include both production and development URLs if testing locally

### "Insufficient scopes" Error
- Go back to HubSpot Developer Portal
- Check all required scopes in the Auth tab
- Re-authorize the app in IQsion settings

### Token Expired
- HubSpot access tokens expire after 6 hours
- The integration automatically uses refresh tokens to get new access tokens
- If you see auth errors, try disconnecting and reconnecting

## Next Steps

Once HubSpot is connected, you can:

1. **Lead Scoring**: Automatically score leads based on engagement
2. **Attribution**: Track which marketing channels bring the best leads
3. **Deal Analytics**: Analyze deal velocity and conversion rates
4. **Contact Enrichment**: Enrich contacts with behavioral data
5. **Automated Workflows**: Trigger actions based on lead behavior

## Security Notes

- Never commit `.env` files to git
- Keep your client secret secure
- Use HTTPS in production
- Regularly rotate credentials
- Monitor API usage in HubSpot dashboard
