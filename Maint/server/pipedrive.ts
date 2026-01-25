import type { Request, Response } from "express";
import { db } from "./db";
import { platformConnections } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Pipedrive OAuth Configuration
const PIPEDRIVE_CLIENT_ID = process.env.PIPEDRIVE_CLIENT_ID || '';
const PIPEDRIVE_CLIENT_SECRET = process.env.PIPEDRIVE_CLIENT_SECRET || '';
const PIPEDRIVE_REDIRECT_URI = process.env.PIPEDRIVE_REDIRECT_URI || 'http://localhost:5000/api/pipedrive/callback';

/**
 * Pipedrive OAuth: Redirect user to Pipedrive authorization page
 */
export async function pipedriveAuthRedirect(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ message: 'userId query parameter is required' });
    }

    if (!PIPEDRIVE_CLIENT_ID) {
      return res.status(500).json({ message: 'Pipedrive client ID not configured' });
    }

    // Store userId in session/state for callback
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');

    const authUrl = `https://oauth.pipedrive.com/oauth/authorize?` +
      `client_id=${encodeURIComponent(PIPEDRIVE_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(PIPEDRIVE_REDIRECT_URI)}` +
      `&state=${encodeURIComponent(state)}`;

    res.redirect(authUrl);
  } catch (error) {
    console.error('Pipedrive auth redirect error:', error);
    res.status(500).json({ message: 'Failed to initiate Pipedrive authorization' });
  }
}

/**
 * Pipedrive OAuth: Callback handler
 */
export async function pipedriveOAuthCallback(req: Request, res: Response) {
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
    const tokenResponse = await fetch('https://oauth.pipedrive.com/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${PIPEDRIVE_CLIENT_ID}:${PIPEDRIVE_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: PIPEDRIVE_REDIRECT_URI,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error('Pipedrive token exchange failed:', errorData);
      return res.status(500).send('Failed to exchange authorization code for token');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in, api_domain } = tokenData;

    // Get user info to get company name
    const userResponse = await fetch(`https://${api_domain}/v1/users/me?api_token=${access_token}`);
    let companyName = api_domain;
    let companyId = '';

    if (userResponse.ok) {
      const userData = await userResponse.json();
      if (userData.data) {
        companyName = userData.data.company_name || api_domain;
        companyId = userData.data.company_id?.toString() || '';
      }
    }

    // Save or update connection
    const existingConnection = await db
      .select()
      .from(platformConnections)
      .where(and(eq(platformConnections.userId, userId), eq(platformConnections.platform, 'pipedrive')))
      .limit(1);

    const connectionData = {
      userId,
      platform: 'pipedrive' as const,
      isConnected: true,
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: new Date(Date.now() + expires_in * 1000),
      accountId: companyId,
      accountName: companyName,
      apiDomain: api_domain,
      connectedAt: new Date(),
    };

    if (existingConnection.length > 0) {
      await db
        .update(platformConnections)
        .set(connectionData)
        .where(and(eq(platformConnections.userId, userId), eq(platformConnections.platform, 'pipedrive')));
    } else {
      await db.insert(platformConnections).values(connectionData);
    }

    // Redirect back to settings page
    res.redirect('/settings?pipedrive=success');
  } catch (error) {
    console.error('Pipedrive OAuth callback error:', error);
    res.status(500).send('Authentication failed');
  }
}

/**
 * Get Pipedrive deals
 */
export async function getPipedriveDeals(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const connection = await db
      .select()
      .from(platformConnections)
      .where(and(eq(platformConnections.userId, userId), eq(platformConnections.platform, 'pipedrive')))
      .limit(1);

    if (!connection.length || !connection[0].accessToken) {
      return res.status(404).json({ message: 'Pipedrive not connected' });
    }

    const { accessToken, apiDomain } = connection[0];

    // Fetch deals from Pipedrive
    const response = await fetch(
      `https://${apiDomain}/v1/deals?limit=100&api_token=${accessToken}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ message: 'Failed to fetch deals', error: errorData });
    }

    const data = await response.json();
    res.json({
      deals: data.data || [],
      total: data.additional_data?.pagination?.total || 0,
    });
  } catch (error) {
    console.error('Get Pipedrive deals error:', error);
    res.status(500).json({ message: 'Failed to fetch deals' });
  }
}

/**
 * Get Pipedrive persons (contacts)
 */
export async function getPipedrivePersons(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const connection = await db
      .select()
      .from(platformConnections)
      .where(and(eq(platformConnections.userId, userId), eq(platformConnections.platform, 'pipedrive')))
      .limit(1);

    if (!connection.length || !connection[0].accessToken) {
      return res.status(404).json({ message: 'Pipedrive not connected' });
    }

    const { accessToken, apiDomain } = connection[0];

    // Fetch persons from Pipedrive
    const response = await fetch(
      `https://${apiDomain}/v1/persons?limit=100&api_token=${accessToken}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ message: 'Failed to fetch persons', error: errorData });
    }

    const data = await response.json();
    res.json({
      persons: data.data || [],
      total: data.additional_data?.pagination?.total || 0,
    });
  } catch (error) {
    console.error('Get Pipedrive persons error:', error);
    res.status(500).json({ message: 'Failed to fetch persons' });
  }
}

/**
 * Get Pipedrive organizations (companies)
 */
export async function getPipedriveOrganizations(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const connection = await db
      .select()
      .from(platformConnections)
      .where(and(eq(platformConnections.userId, userId), eq(platformConnections.platform, 'pipedrive')))
      .limit(1);

    if (!connection.length || !connection[0].accessToken) {
      return res.status(404).json({ message: 'Pipedrive not connected' });
    }

    const { accessToken, apiDomain } = connection[0];

    // Fetch organizations from Pipedrive
    const response = await fetch(
      `https://${apiDomain}/v1/organizations?limit=100&api_token=${accessToken}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ message: 'Failed to fetch organizations', error: errorData });
    }

    const data = await response.json();
    res.json({
      organizations: data.data || [],
      total: data.additional_data?.pagination?.total || 0,
    });
  } catch (error) {
    console.error('Get Pipedrive organizations error:', error);
    res.status(500).json({ message: 'Failed to fetch organizations' });
  }
}

/**
 * Test Pipedrive connection - Get summary stats
 */
export async function testPipedriveConnection(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const connection = await db
      .select()
      .from(platformConnections)
      .where(and(eq(platformConnections.userId, userId), eq(platformConnections.platform, 'pipedrive')))
      .limit(1);

    if (!connection.length || !connection[0].accessToken) {
      return res.status(404).json({ message: 'Pipedrive not connected' });
    }

    const { accessToken, apiDomain, accountId, accountName } = connection[0];

    // Fetch summary counts
    const [dealsRes, personsRes, orgsRes] = await Promise.all([
      fetch(`https://${apiDomain}/v1/deals/summary?api_token=${accessToken}`),
      fetch(`https://${apiDomain}/v1/persons?limit=1&api_token=${accessToken}`),
      fetch(`https://${apiDomain}/v1/organizations?limit=1&api_token=${accessToken}`),
    ]);

    const dealsData = dealsRes.ok ? await dealsRes.json() : {};
    const personsData = personsRes.ok ? await personsRes.json() : {};
    const orgsData = orgsRes.ok ? await orgsRes.json() : {};

    res.json({
      success: true,
      accountId,
      accountName,
      totals: {
        deals: dealsData.data?.total_count || 0,
        persons: personsData.additional_data?.pagination?.total || 0,
        organizations: orgsData.additional_data?.pagination?.total || 0,
      },
    });
  } catch (error) {
    console.error('Test Pipedrive connection error:', error);
    res.status(500).json({ message: 'Failed to test connection' });
  }
}

/**
 * Disconnect Pipedrive
 */
export async function disconnectPipedrive(req: Request, res: Response) {
  try {
    const userId = req.body.userId as string;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    await db
      .update(platformConnections)
      .set({
        isConnected: false,
        accessToken: null,
        refreshToken: null,
      })
      .where(and(eq(platformConnections.userId, userId), eq(platformConnections.platform, 'pipedrive')));

    res.json({ success: true, message: 'Pipedrive disconnected' });
  } catch (error) {
    console.error('Disconnect Pipedrive error:', error);
    res.status(500).json({ message: 'Failed to disconnect Pipedrive' });
  }
}
