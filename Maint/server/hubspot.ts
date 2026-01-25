import type { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { connections } from "./db";
import { eq, and } from "drizzle-orm";

// HubSpot OAuth Configuration
const HUBSPOT_CLIENT_ID = process.env.HUBSPOT_CLIENT_ID || '';
const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET || '';
const HUBSPOT_REDIRECT_URI = process.env.HUBSPOT_REDIRECT_URI || 'http://localhost:5000/api/hubspot/callback';

// OAuth scopes for HubSpot
const HUBSPOT_SCOPES = [
  'crm.objects.contacts.read',
  'crm.objects.companies.read',
  'crm.objects.deals.read',
  'crm.objects.leads.read',
  'crm.schemas.contacts.read',
  'crm.schemas.companies.read',
  'crm.schemas.deals.read',
  'analytics.behavioral_events.send'
].join(' ');

/**
 * HubSpot OAuth: Redirect user to HubSpot authorization page
 */
export async function hubspotAuthRedirect(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ message: 'userId query parameter is required' });
    }

    if (!HUBSPOT_CLIENT_ID) {
      return res.status(500).json({ message: 'HubSpot client ID not configured' });
    }

    // Store userId in session/state for callback
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');

    const authUrl = `https://app.hubspot.com/oauth/authorize?` +
      `client_id=${encodeURIComponent(HUBSPOT_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(HUBSPOT_REDIRECT_URI)}` +
      `&scope=${encodeURIComponent(HUBSPOT_SCOPES)}` +
      `&state=${encodeURIComponent(state)}`;

    res.redirect(authUrl);
  } catch (error) {
    console.error('HubSpot auth redirect error:', error);
    res.status(500).json({ message: 'Failed to initiate HubSpot authorization' });
  }
}

/**
 * HubSpot OAuth: Callback handler
 */
export async function hubspotOAuthCallback(req: Request, res: Response) {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).send('Missing authorization code or state');
    }

    // Decode state to get userId
    const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
    const userId = stateData.userId;

    if (!userId) {
      return res.status(400).send('Invalid state parameter');
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: HUBSPOT_CLIENT_ID,
        client_secret: HUBSPOT_CLIENT_SECRET,
        redirect_uri: HUBSPOT_REDIRECT_URI,
        code: code as string,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error('HubSpot token exchange failed:', errorData);
      return res.status(500).send('Failed to exchange authorization code for token');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Get account info
    const accountResponse = await fetch('https://api.hubapi.com/oauth/v1/access-tokens/' + access_token, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    let portalId = '';
    let hubDomain = '';
    if (accountResponse.ok) {
      const accountData = await accountResponse.json();
      portalId = accountData.hub_id || accountData.hub || '';
      hubDomain = accountData.hub_domain || '';
    }

    // Save or update connection
    const existingConnection = await db
      .select()
      .from(connections)
      .where(and(eq(connections.userId, userId), eq(connections.platform, 'hubspot')))
      .limit(1);

    const connectionData = {
      userId,
      platform: 'hubspot' as const,
      isConnected: true,
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: new Date(Date.now() + expires_in * 1000),
      accountId: portalId,
      accountName: hubDomain || portalId,
      connectedAt: new Date(),
    };

    if (existingConnection.length > 0) {
      await db
        .update(connections)
        .set(connectionData)
        .where(and(eq(connections.userId, userId), eq(connections.platform, 'hubspot')));
    } else {
      await db.insert(connections).values(connectionData);
    }

    // Redirect back to settings page
    res.redirect('/settings?hubspot=success');
  } catch (error) {
    console.error('HubSpot OAuth callback error:', error);
    res.status(500).send('Authentication failed');
  }
}

/**
 * Get HubSpot contacts
 */
export async function getHubSpotContacts(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const connection = await db
      .select()
      .from(connections)
      .where(and(eq(connections.userId, userId), eq(connections.platform, 'hubspot')))
      .limit(1);

    if (!connection.length || !connection[0].accessToken) {
      return res.status(404).json({ message: 'HubSpot not connected' });
    }

    const { accessToken } = connection[0];

    // Fetch contacts from HubSpot
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=email,firstname,lastname,company,lifecyclestage,createdate', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ message: 'Failed to fetch contacts', error: errorData });
    }

    const data = await response.json();
    res.json({
      contacts: data.results || [],
      total: data.total || 0,
    });
  } catch (error) {
    console.error('Get HubSpot contacts error:', error);
    res.status(500).json({ message: 'Failed to fetch contacts' });
  }
}

/**
 * Get HubSpot deals
 */
export async function getHubSpotDeals(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const connection = await db
      .select()
      .from(connections)
      .where(and(eq(connections.userId, userId), eq(connections.platform, 'hubspot')))
      .limit(1);

    if (!connection.length || !connection[0].accessToken) {
      return res.status(404).json({ message: 'HubSpot not connected' });
    }

    const { accessToken } = connection[0];

    // Fetch deals from HubSpot
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/deals?limit=100&properties=dealname,amount,dealstage,closedate,createdate,pipeline', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ message: 'Failed to fetch deals', error: errorData });
    }

    const data = await response.json();
    res.json({
      deals: data.results || [],
      total: data.total || 0,
    });
  } catch (error) {
    console.error('Get HubSpot deals error:', error);
    res.status(500).json({ message: 'Failed to fetch deals' });
  }
}

/**
 * Get HubSpot companies
 */
export async function getHubSpotCompanies(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const connection = await db
      .select()
      .from(connections)
      .where(and(eq(connections.userId, userId), eq(connections.platform, 'hubspot')))
      .limit(1);

    if (!connection.length || !connection[0].accessToken) {
      return res.status(404).json({ message: 'HubSpot not connected' });
    }

    const { accessToken } = connection[0];

    // Fetch companies from HubSpot
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/companies?limit=100&properties=name,domain,industry,city,state,country,createdate', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ message: 'Failed to fetch companies', error: errorData });
    }

    const data = await response.json();
    res.json({
      companies: data.results || [],
      total: data.total || 0,
    });
  } catch (error) {
    console.error('Get HubSpot companies error:', error);
    res.status(500).json({ message: 'Failed to fetch companies' });
  }
}

/**
 * Test HubSpot connection - Get summary stats
 */
export async function testHubSpotConnection(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const connection = await db
      .select()
      .from(connections)
      .where(and(eq(connections.userId, userId), eq(connections.platform, 'hubspot')))
      .limit(1);

    if (!connection.length || !connection[0].accessToken) {
      return res.status(404).json({ message: 'HubSpot not connected' });
    }

    const { accessToken, accountId, accountName } = connection[0];

    // Fetch summary counts
    const [contactsRes, dealsRes, companiesRes] = await Promise.all([
      fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }),
      fetch('https://api.hubapi.com/crm/v3/objects/deals?limit=1', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }),
      fetch('https://api.hubapi.com/crm/v3/objects/companies?limit=1', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }),
    ]);

    const contactsData = contactsRes.ok ? await contactsRes.json() : {};
    const dealsData = dealsRes.ok ? await dealsRes.json() : {};
    const companiesData = companiesRes.ok ? await companiesRes.json() : {};

    res.json({
      success: true,
      accountId,
      accountName,
      totals: {
        contacts: contactsData.total || 0,
        deals: dealsData.total || 0,
        companies: companiesData.total || 0,
      },
    });
  } catch (error) {
    console.error('Test HubSpot connection error:', error);
    res.status(500).json({ message: 'Failed to test connection' });
  }
}

/**
 * Disconnect HubSpot
 */
export async function disconnectHubSpot(req: Request, res: Response) {
  try {
    const userId = req.body.userId as string;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    await db
      .update(connections)
      .set({
        isConnected: false,
        accessToken: null,
        refreshToken: null,
      })
      .where(and(eq(connections.userId, userId), eq(connections.platform, 'hubspot')));

    res.json({ success: true, message: 'HubSpot disconnected' });
  } catch (error) {
    console.error('Disconnect HubSpot error:', error);
    res.status(500).json({ message: 'Failed to disconnect HubSpot' });
  }
}
