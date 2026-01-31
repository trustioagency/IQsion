import { BigQuery, Table, Dataset, Query, QueryRowsResponse } from "@google-cloud/bigquery";

const BQ_DATASET = process.env.BQ_DATASET || "iqsion";
const BQ_TABLE = process.env.BQ_TABLE || "metrics_daily";
const BQ_LOCATION = process.env.BQ_LOCATION || "US";
const BQ_PARTITION_EXPIRATION_DAYS = Number(process.env.BQ_PARTITION_EXPIRATION_DAYS || 90); // üst sınır, tablo genel TTL

let _bq: BigQuery | null = null;

export function getBigQuery(): BigQuery {
  if (_bq) return _bq;
  // Set default location and projectId on the client
  _bq = new BigQuery({ 
    projectId: process.env.GOOGLE_CLOUD_PROJECT || 'maint-ca347',
    location: BQ_LOCATION 
  });
  return _bq;
}

export async function ensureDatasetAndTable(): Promise<{ dataset: Dataset; table: Table }>
{
  const bq = getBigQuery();
  const [dataset] = await bq.dataset(BQ_DATASET).get({ autoCreate: true });

  const tableRef = dataset.table(BQ_TABLE);
  const [exists] = await tableRef.exists();
  if (!exists) {
    const schema = {
      fields: [
        { name: "userId", type: "STRING", mode: "REQUIRED" },
        { name: "source", type: "STRING", mode: "REQUIRED" },
        { name: "accountId", type: "STRING" },
        { name: "date", type: "DATE", mode: "REQUIRED" },
        { name: "campaignId", type: "STRING" },
        { name: "adGroupId", type: "STRING" },
        { name: "impressions", type: "INTEGER" },
        { name: "clicks", type: "INTEGER" },
        { name: "costMicros", type: "INTEGER" },
        { name: "sessions", type: "INTEGER" },
        { name: "transactions", type: "INTEGER" },
        { name: "revenueMicros", type: "INTEGER" },
        { name: "createdAt", type: "TIMESTAMP" },
      ],
    } as const;

    const createConfig: any = {
      schema,
      timePartitioning: {
        type: "DAY",
        field: "date",
        expirationMs: String(BQ_PARTITION_EXPIRATION_DAYS * 24 * 60 * 60 * 1000),
      },
      clustering: {
        fields: ["userId", "source", "accountId"],
      },
    };
    await tableRef.create(createConfig);
  } else {
    // Mevcut tabloda accountId kolonu yoksa ekle
    try {
      const [metadata] = await tableRef.getMetadata();
      const existingFields = metadata?.schema?.fields || [];
      const hasAccountId = existingFields.some((f: any) => f.name === 'accountId');
      
      if (!hasAccountId) {
        console.log('[BigQuery] Adding accountId column to existing table...');
        const newSchema = {
          fields: [
            ...existingFields,
            { name: "accountId", type: "STRING", mode: "NULLABLE" }
          ]
        };
        await tableRef.setMetadata({ schema: newSchema } as any);
        console.log('[BigQuery] accountId column added successfully');
      }
    } catch (schemaErr) {
      console.error('[BigQuery] Failed to add accountId column:', schemaErr);
    }
    
    // Mevcut tabloda TTL yoksa, varsayılan TTL uygula (global üst sınır)
    try {
      const [metadata] = await tableRef.getMetadata();
      const curExp = metadata?.timePartitioning?.expirationMs ? Number(metadata.timePartitioning.expirationMs) : 0;
      const desired = BQ_PARTITION_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
      if (!curExp || curExp > desired) {
        await tableRef.setMetadata({
          timePartitioning: {
            type: "DAY",
            field: "date",
            expirationMs: String(desired),
          }
        } as any);
      }
    } catch {}
  }

  return { dataset, table: tableRef };
}

export type MetricsRow = {
  userId: string;
  source: string;
  accountId?: string;
  date: string; // YYYY-MM-DD
  campaignId?: string;
  adGroupId?: string;
  impressions?: number;
  clicks?: number;
  costMicros?: number;
  sessions?: number;
  transactions?: number;
  revenueMicros?: number;
  createdAt?: string; // RFC3339 timestamp
};

export async function insertMetrics(rows: MetricsRow[]): Promise<{ inserted: number }>{
  if (!rows.length) return { inserted: 0 };
  
  const bq = getBigQuery();
  await ensureDatasetAndTable();
  
  // GROUP rows by (userId, source) to minimize queries
  const grouped = new Map<string, MetricsRow[]>();
  for (const r of rows) {
    const key = `${r.userId}|||${r.source}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(r);
  }

  let totalInserted = 0;

  for (const [key, groupRows] of Array.from(grouped.entries())) {
    const now = new Date().toISOString();
    const payload = groupRows.map((r: MetricsRow) => ({
      ...r,
      createdAt: r.createdAt || now,
    }));

    const values = payload.map((r: MetricsRow & { createdAt: string }) => {
      const userIdEsc = String(r.userId || '').replace(/'/g, "\\'");
      const sourceEsc = String(r.source || '').replace(/'/g, "\\'");
      const accountId = r.accountId ? `'${String(r.accountId).replace(/'/g, "\\'")}'` : 'NULL';
      const date = String(r.date || '1970-01-01');
      const campaignId = r.campaignId ? `'${String(r.campaignId).replace(/'/g, "\\'")}'` : 'NULL';
      const adGroupId = r.adGroupId ? `'${String(r.adGroupId).replace(/'/g, "\\'")}'` : 'NULL';
      const impressions = r.impressions ?? 'NULL';
      const clicks = r.clicks ?? 'NULL';
      const costMicros = r.costMicros ?? 'NULL';
      const sessions = r.sessions ?? 'NULL';
      const transactions = r.transactions ?? 'NULL';
      const revenueMicros = r.revenueMicros ?? 'NULL';
      const createdAt = `TIMESTAMP('${r.createdAt}')`;
      return `('${userIdEsc}', '${sourceEsc}', ${accountId}, DATE('${date}'), ${campaignId}, ${adGroupId}, ${impressions}, ${clicks}, ${costMicros}, ${sessions}, ${transactions}, ${revenueMicros}, ${createdAt})`;
    }).join(',\n      ');

    // Use MERGE INTO to prevent duplicates atomically
    const mergeSql = `
      MERGE INTO \`${bq.projectId}.${BQ_DATASET}.${BQ_TABLE}\` AS target
      USING (
        SELECT * FROM UNNEST([
          STRUCT<userId STRING, source STRING, accountId STRING, date DATE, campaignId STRING, adGroupId STRING, impressions INT64, clicks INT64, costMicros INT64, sessions INT64, transactions INT64, revenueMicros INT64, createdAt TIMESTAMP>
          ${values}
        ])
      ) AS source
      ON target.userId = source.userId 
         AND target.source = source.source 
         AND target.date = source.date
         AND (target.accountId IS NULL AND source.accountId IS NULL OR target.accountId = source.accountId)
         AND (target.campaignId IS NULL AND source.campaignId IS NULL OR target.campaignId = source.campaignId)
         AND (target.adGroupId IS NULL AND source.adGroupId IS NULL OR target.adGroupId = source.adGroupId)
      WHEN MATCHED THEN
        UPDATE SET
          accountId = source.accountId,
          impressions = source.impressions,
          clicks = source.clicks,
          costMicros = source.costMicros,
          sessions = source.sessions,
          transactions = source.transactions,
          revenueMicros = source.revenueMicros,
          createdAt = source.createdAt
      WHEN NOT MATCHED THEN
        INSERT (userId, source, accountId, date, campaignId, adGroupId, impressions, clicks, costMicros, sessions, transactions, revenueMicros, createdAt)
        VALUES (source.userId, source.source, source.accountId, source.date, source.campaignId, source.adGroupId, source.impressions, source.clicks, source.costMicros, source.sessions, source.transactions, source.revenueMicros, source.createdAt)
    `;

    const [job] = await bq.createQueryJob({
      query: mergeSql,
      location: BQ_LOCATION,
    });
    await job.getQueryResults();
    totalInserted += payload.length;
  }

  return { inserted: totalInserted };
}

export async function queryByUserAndRange(userId: string, from: string, to: string) {
  const bq = getBigQuery();
  // Duplicate'leri önlemek için her (userId,source,date) için MAX(createdAt) olan satırları seç
  const sql = `
    WITH latest AS (
      SELECT userId, source, date, MAX(createdAt) as maxCreated
      FROM \`${bq.projectId}.${BQ_DATASET}.${BQ_TABLE}\`
      WHERE userId = @userId AND date BETWEEN @from AND @to
      GROUP BY userId, source, date
    )
    SELECT m.source,
           SUM(CAST(m.costMicros AS INT64)) AS costMicros,
           SUM(CAST(m.revenueMicros AS INT64)) AS revenueMicros,
           SUM(CAST(m.clicks AS INT64)) AS clicks,
           SUM(CAST(m.impressions AS INT64)) AS impressions,
           SUM(CAST(m.sessions AS INT64)) AS sessions,
           SUM(CAST(m.transactions AS INT64)) AS transactions
    FROM \`${bq.projectId}.${BQ_DATASET}.${BQ_TABLE}\` m
    INNER JOIN latest l ON m.userId=l.userId AND m.source=l.source AND m.date=l.date AND m.createdAt=l.maxCreated
    GROUP BY m.source
    ORDER BY revenueMicros DESC
  `;
  const options: Query = {
    query: sql,
    params: { userId, from, to },
    location: BQ_LOCATION,
  };
  const [job] = await bq.createQueryJob(options);
  const [rows] = (await job.getQueryResults()) as QueryRowsResponse;
  return rows;
}

export async function applyRetentionForUser(userId: string, retentionDays: number) {
  const bq = getBigQuery();
  const sql = `
    DELETE FROM \`${bq.projectId}.${BQ_DATASET}.${BQ_TABLE}\`
    WHERE userId = @userId
      AND date < DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY)
  `;
  const options: Query = {
    query: sql,
    params: { userId, days: retentionDays },
    location: BQ_LOCATION,
  };
  const [job] = await bq.createQueryJob(options);
  await job.getQueryResults();
  return { ok: true };
}

export async function applyRetentionForUserAndSource(userId: string, source: string, retentionDays: number) {
  const bq = getBigQuery();
  const sql = `
    DELETE FROM \`${bq.projectId}.${BQ_DATASET}.${BQ_TABLE}\`
    WHERE userId = @userId AND source = @source
      AND date < DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY)
  `;
  const options: Query = {
    query: sql,
    params: { userId, source, days: retentionDays },
    location: BQ_LOCATION,
  };
  const [job] = await bq.createQueryJob(options);
  await job.getQueryResults();
  return { ok: true };
}

// ===== GA4 specific tables =====
export async function ensureGa4Tables() {
  const bq = getBigQuery();
  const [dataset] = await bq.dataset(BQ_DATASET).get({ autoCreate: true });

  // ga4_daily: per date totals
  const daily = dataset.table('ga4_daily');
  const [dExists] = await daily.exists();
  if (!dExists) {
    await daily.create({
      schema: {
        fields: [
          { name: 'userId', type: 'STRING', mode: 'REQUIRED' },
          { name: 'date', type: 'DATE', mode: 'REQUIRED' },
          { name: 'propertyId', type: 'STRING' },
          { name: 'sessions', type: 'INTEGER' },
          { name: 'avgSessionDurationSec', type: 'FLOAT' },
          { name: 'activeUsers', type: 'INTEGER' },
          { name: 'newUsers', type: 'INTEGER' },
          { name: 'eventCount', type: 'INTEGER' },
          { name: 'bounceRate', type: 'FLOAT' },
          { name: 'createdAt', type: 'TIMESTAMP' },
        ]
      },
      timePartitioning: { type: 'DAY', field: 'date', expirationMs: String(BQ_PARTITION_EXPIRATION_DAYS * 86400000) },
      clustering: { fields: ['userId'] },
    } as any);
  }

  // ga4_geo_daily: per date + region
  const geo = dataset.table('ga4_geo_daily');
  const [gExists] = await geo.exists();
  if (!gExists) {
    await geo.create({
      schema: {
        fields: [
          { name: 'userId', type: 'STRING', mode: 'REQUIRED' },
          { name: 'date', type: 'DATE', mode: 'REQUIRED' },
          { name: 'propertyId', type: 'STRING' },
          { name: 'region', type: 'STRING' },
          { name: 'sessions', type: 'INTEGER' },
          { name: 'activeUsers', type: 'INTEGER' },
          { name: 'createdAt', type: 'TIMESTAMP' },
        ]
      },
      timePartitioning: { type: 'DAY', field: 'date', expirationMs: String(BQ_PARTITION_EXPIRATION_DAYS * 86400000) },
      clustering: { fields: ['userId'] },
    } as any);
  }

  return { dataset };
}

// ===== CRM specific tables =====
export async function ensureCrmTables() {
  const bq = getBigQuery();
  const [dataset] = await bq.dataset(BQ_DATASET).get({ autoCreate: true });

  const deals = dataset.table('crm_deals');
  const [dExists] = await deals.exists();
  if (!dExists) {
    await deals.create({
      schema: {
        fields: [
          { name: 'userId', type: 'STRING', mode: 'REQUIRED' },
          { name: 'source', type: 'STRING', mode: 'REQUIRED' },
          { name: 'accountId', type: 'STRING' },
          { name: 'dealId', type: 'STRING', mode: 'REQUIRED' },
          { name: 'name', type: 'STRING' },
          { name: 'stage', type: 'STRING' },
          { name: 'status', type: 'STRING' },
          { name: 'amount', type: 'FLOAT' },
          { name: 'currency', type: 'STRING' },
          { name: 'pipelineId', type: 'STRING' },
          { name: 'ownerId', type: 'STRING' },
          { name: 'createdDate', type: 'DATE' },
          { name: 'updatedDate', type: 'DATE' },
          { name: 'closeDate', type: 'DATE' },
          { name: 'isWon', type: 'BOOLEAN' },
          { name: 'isLost', type: 'BOOLEAN' },
          { name: 'createdAt', type: 'TIMESTAMP' },
        ]
      },
      timePartitioning: { type: 'DAY', field: 'createdDate', expirationMs: String(BQ_PARTITION_EXPIRATION_DAYS * 86400000) },
      clustering: { fields: ['userId', 'source', 'accountId'] },
    } as any);
  }

  const contacts = dataset.table('crm_contacts');
  const [cExists] = await contacts.exists();
  if (!cExists) {
    await contacts.create({
      schema: {
        fields: [
          { name: 'userId', type: 'STRING', mode: 'REQUIRED' },
          { name: 'source', type: 'STRING', mode: 'REQUIRED' },
          { name: 'accountId', type: 'STRING' },
          { name: 'contactId', type: 'STRING', mode: 'REQUIRED' },
          { name: 'email', type: 'STRING' },
          { name: 'firstname', type: 'STRING' },
          { name: 'lastname', type: 'STRING' },
          { name: 'companyId', type: 'STRING' },
          { name: 'lifecycleStage', type: 'STRING' },
          { name: 'createdDate', type: 'DATE' },
          { name: 'updatedDate', type: 'DATE' },
          { name: 'createdAt', type: 'TIMESTAMP' },
        ]
      },
      timePartitioning: { type: 'DAY', field: 'createdDate', expirationMs: String(BQ_PARTITION_EXPIRATION_DAYS * 86400000) },
      clustering: { fields: ['userId', 'source', 'accountId'] },
    } as any);
  }

  return { dataset };
}

export type CrmDealRow = {
  userId: string;
  source: string; // hubspot | pipedrive
  accountId?: string;
  dealId: string;
  name?: string;
  stage?: string;
  status?: string;
  amount?: number;
  currency?: string;
  pipelineId?: string;
  ownerId?: string;
  createdDate?: string; // YYYY-MM-DD
  updatedDate?: string; // YYYY-MM-DD
  closeDate?: string; // YYYY-MM-DD
  isWon?: boolean;
  isLost?: boolean;
  createdAt?: string;
};

export type CrmContactRow = {
  userId: string;
  source: string; // hubspot | pipedrive
  accountId?: string;
  contactId: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  companyId?: string;
  lifecycleStage?: string;
  createdDate?: string; // YYYY-MM-DD
  updatedDate?: string; // YYYY-MM-DD
  createdAt?: string;
};

export async function insertCrmDeals(rows: CrmDealRow[]) {
  if (!rows.length) return { inserted: 0 };
  const bq = getBigQuery();
  await ensureCrmTables();
  const now = new Date().toISOString();

  const values = rows.map(r => {
    const userIdEsc = String(r.userId || '').replace(/'/g, "\\'");
    const sourceEsc = String(r.source || '').replace(/'/g, "\\'");
    const accountId = r.accountId ? `'${String(r.accountId).replace(/'/g, "\\'")}'` : 'NULL';
    const dealId = `'${String(r.dealId || '').replace(/'/g, "\\'")}'`;
    const name = r.name ? `'${String(r.name).replace(/'/g, "\\'")}'` : 'NULL';
    const stage = r.stage ? `'${String(r.stage).replace(/'/g, "\\'")}'` : 'NULL';
    const status = r.status ? `'${String(r.status).replace(/'/g, "\\'")}'` : 'NULL';
    const amount = r.amount ?? 'NULL';
    const currency = r.currency ? `'${String(r.currency).replace(/'/g, "\\'")}'` : 'NULL';
    const pipelineId = r.pipelineId ? `'${String(r.pipelineId).replace(/'/g, "\\'")}'` : 'NULL';
    const ownerId = r.ownerId ? `'${String(r.ownerId).replace(/'/g, "\\'")}'` : 'NULL';
    const createdDate = r.createdDate ? `DATE('${r.createdDate}')` : 'NULL';
    const updatedDate = r.updatedDate ? `DATE('${r.updatedDate}')` : 'NULL';
    const closeDate = r.closeDate ? `DATE('${r.closeDate}')` : 'NULL';
    const isWon = typeof r.isWon === 'boolean' ? (r.isWon ? 'TRUE' : 'FALSE') : 'NULL';
    const isLost = typeof r.isLost === 'boolean' ? (r.isLost ? 'TRUE' : 'FALSE') : 'NULL';
    const createdAt = `TIMESTAMP('${r.createdAt || now}')`;
    return `('${userIdEsc}', '${sourceEsc}', ${accountId}, ${dealId}, ${name}, ${stage}, ${status}, ${amount}, ${currency}, ${pipelineId}, ${ownerId}, ${createdDate}, ${updatedDate}, ${closeDate}, ${isWon}, ${isLost}, ${createdAt})`;
  }).join(',\n      ');

  const mergeSql = `
    MERGE INTO \`${bq.projectId}.${BQ_DATASET}.crm_deals\` AS target
    USING (
      SELECT * FROM UNNEST([
        STRUCT<userId STRING, source STRING, accountId STRING, dealId STRING, name STRING, stage STRING, status STRING, amount FLOAT64, currency STRING, pipelineId STRING, ownerId STRING, createdDate DATE, updatedDate DATE, closeDate DATE, isWon BOOL, isLost BOOL, createdAt TIMESTAMP>
        ${values}
      ])
    ) AS source
    ON target.userId = source.userId
       AND target.source = source.source
       AND target.dealId = source.dealId
    WHEN MATCHED THEN
      UPDATE SET
        accountId = source.accountId,
        name = source.name,
        stage = source.stage,
        status = source.status,
        amount = source.amount,
        currency = source.currency,
        pipelineId = source.pipelineId,
        ownerId = source.ownerId,
        createdDate = source.createdDate,
        updatedDate = source.updatedDate,
        closeDate = source.closeDate,
        isWon = source.isWon,
        isLost = source.isLost,
        createdAt = source.createdAt
    WHEN NOT MATCHED THEN
      INSERT (userId, source, accountId, dealId, name, stage, status, amount, currency, pipelineId, ownerId, createdDate, updatedDate, closeDate, isWon, isLost, createdAt)
      VALUES (source.userId, source.source, source.accountId, source.dealId, source.name, source.stage, source.status, source.amount, source.currency, source.pipelineId, source.ownerId, source.createdDate, source.updatedDate, source.closeDate, source.isWon, source.isLost, source.createdAt)
  `;

  const [job] = await bq.createQueryJob({ query: mergeSql, location: BQ_LOCATION });
  await job.getQueryResults();
  return { inserted: rows.length };
}

export async function insertCrmContacts(rows: CrmContactRow[]) {
  if (!rows.length) return { inserted: 0 };
  const bq = getBigQuery();
  await ensureCrmTables();
  const now = new Date().toISOString();

  const values = rows.map(r => {
    const userIdEsc = String(r.userId || '').replace(/'/g, "\\'");
    const sourceEsc = String(r.source || '').replace(/'/g, "\\'");
    const accountId = r.accountId ? `'${String(r.accountId).replace(/'/g, "\\'")}'` : 'NULL';
    const contactId = `'${String(r.contactId || '').replace(/'/g, "\\'")}'`;
    const email = r.email ? `'${String(r.email).replace(/'/g, "\\'")}'` : 'NULL';
    const firstname = r.firstname ? `'${String(r.firstname).replace(/'/g, "\\'")}'` : 'NULL';
    const lastname = r.lastname ? `'${String(r.lastname).replace(/'/g, "\\'")}'` : 'NULL';
    const companyId = r.companyId ? `'${String(r.companyId).replace(/'/g, "\\'")}'` : 'NULL';
    const lifecycleStage = r.lifecycleStage ? `'${String(r.lifecycleStage).replace(/'/g, "\\'")}'` : 'NULL';
    const createdDate = r.createdDate ? `DATE('${r.createdDate}')` : 'NULL';
    const updatedDate = r.updatedDate ? `DATE('${r.updatedDate}')` : 'NULL';
    const createdAt = `TIMESTAMP('${r.createdAt || now}')`;
    return `('${userIdEsc}', '${sourceEsc}', ${accountId}, ${contactId}, ${email}, ${firstname}, ${lastname}, ${companyId}, ${lifecycleStage}, ${createdDate}, ${updatedDate}, ${createdAt})`;
  }).join(',\n      ');

  const mergeSql = `
    MERGE INTO \`${bq.projectId}.${BQ_DATASET}.crm_contacts\` AS target
    USING (
      SELECT * FROM UNNEST([
        STRUCT<userId STRING, source STRING, accountId STRING, contactId STRING, email STRING, firstname STRING, lastname STRING, companyId STRING, lifecycleStage STRING, createdDate DATE, updatedDate DATE, createdAt TIMESTAMP>
        ${values}
      ])
    ) AS source
    ON target.userId = source.userId
       AND target.source = source.source
       AND target.contactId = source.contactId
    WHEN MATCHED THEN
      UPDATE SET
        accountId = source.accountId,
        email = source.email,
        firstname = source.firstname,
        lastname = source.lastname,
        companyId = source.companyId,
        lifecycleStage = source.lifecycleStage,
        createdDate = source.createdDate,
        updatedDate = source.updatedDate,
        createdAt = source.createdAt
    WHEN NOT MATCHED THEN
      INSERT (userId, source, accountId, contactId, email, firstname, lastname, companyId, lifecycleStage, createdDate, updatedDate, createdAt)
      VALUES (source.userId, source.source, source.accountId, source.contactId, source.email, source.firstname, source.lastname, source.companyId, source.lifecycleStage, source.createdDate, source.updatedDate, source.createdAt)
  `;

  const [job] = await bq.createQueryJob({ query: mergeSql, location: BQ_LOCATION });
  await job.getQueryResults();
  return { inserted: rows.length };
}

export async function insertGa4Daily(rows: Array<{ userId: string; date: string; propertyId?: string; sessions?: number; avgSessionDurationSec?: number; activeUsers?: number; newUsers?: number; eventCount?: number; bounceRate?: number; createdAt?: string }>) {
  if (!rows.length) return { inserted: 0 };
  
  const bq = getBigQuery();
  const now = new Date().toISOString();
  
  // Use MERGE INTO to prevent duplicates atomically
  const values = rows.map(r => {
    const userIdEsc = String(r.userId || '').replace(/'/g, "\\'");
    const date = String(r.date || '1970-01-01');
    const propertyId = r.propertyId ? `'${String(r.propertyId).replace(/'/g, "\\'")}'` : 'NULL';
    const sessions = r.sessions ?? 'NULL';
    const avgSessionDurationSec = r.avgSessionDurationSec ?? 'NULL';
    const activeUsers = r.activeUsers ?? 'NULL';
    const newUsers = r.newUsers ?? 'NULL';
    const eventCount = r.eventCount ?? 'NULL';
    const bounceRate = r.bounceRate ?? 'NULL';
    const createdAt = `TIMESTAMP('${r.createdAt || now}')`;
    return `('${userIdEsc}', DATE('${date}'), ${propertyId}, ${sessions}, ${avgSessionDurationSec}, ${activeUsers}, ${newUsers}, ${eventCount}, ${bounceRate}, ${createdAt})`;
  }).join(',\n      ');
  
  const mergeSql = `
    MERGE INTO \`${bq.projectId}.${BQ_DATASET}.ga4_daily\` AS target
    USING (
      SELECT * FROM UNNEST([
        STRUCT<userId STRING, date DATE, propertyId STRING, sessions INT64, avgSessionDurationSec FLOAT64, activeUsers INT64, newUsers INT64, eventCount INT64, bounceRate FLOAT64, createdAt TIMESTAMP>
        ${values}
      ])
    ) AS source
    ON target.userId = source.userId 
       AND target.date = source.date 
       AND (target.propertyId IS NULL AND source.propertyId IS NULL OR target.propertyId = source.propertyId)
    WHEN MATCHED THEN
      UPDATE SET
        sessions = source.sessions,
        avgSessionDurationSec = source.avgSessionDurationSec,
        activeUsers = source.activeUsers,
        newUsers = source.newUsers,
        eventCount = source.eventCount,
        bounceRate = source.bounceRate,
        createdAt = source.createdAt
    WHEN NOT MATCHED THEN
      INSERT (userId, date, propertyId, sessions, avgSessionDurationSec, activeUsers, newUsers, eventCount, bounceRate, createdAt)
      VALUES (source.userId, source.date, source.propertyId, source.sessions, source.avgSessionDurationSec, source.activeUsers, source.newUsers, source.eventCount, source.bounceRate, source.createdAt)
  `;
  
  const [job] = await bq.createQueryJob({
    query: mergeSql,
    location: BQ_LOCATION,
  });
  await job.getQueryResults();
  
  return { inserted: rows.length };
}

export async function insertGa4GeoDaily(rows: Array<{ userId: string; date: string; propertyId?: string; region?: string; sessions?: number; activeUsers?: number; createdAt?: string }>) {
  if (!rows.length) return { inserted: 0 };
  
  const bq = getBigQuery();
  const now = new Date().toISOString();
  
  // Use MERGE INTO to prevent duplicates atomically
  const values = rows.map(r => {
    const userIdEsc = String(r.userId || '').replace(/'/g, "\\'");
    const date = String(r.date || '1970-01-01');
    const propertyId = r.propertyId ? `'${String(r.propertyId).replace(/'/g, "\\'")}'` : 'NULL';
    const region = r.region ? `'${String(r.region).replace(/'/g, "\\'")}'` : 'NULL';
    const sessions = r.sessions ?? 'NULL';
    const activeUsers = r.activeUsers ?? 'NULL';
    const createdAt = `TIMESTAMP('${r.createdAt || now}')`;
    return `('${userIdEsc}', DATE('${date}'), ${propertyId}, ${region}, ${sessions}, ${activeUsers}, ${createdAt})`;
  }).join(',\n      ');
  
  const mergeSql = `
    MERGE INTO \`${bq.projectId}.${BQ_DATASET}.ga4_geo_daily\` AS target
    USING (
      SELECT * FROM UNNEST([
        STRUCT<userId STRING, date DATE, propertyId STRING, region STRING, sessions INT64, activeUsers INT64, createdAt TIMESTAMP>
        ${values}
      ])
    ) AS source
    ON target.userId = source.userId 
       AND target.date = source.date 
       AND (target.propertyId IS NULL AND source.propertyId IS NULL OR target.propertyId = source.propertyId)
       AND (target.region IS NULL AND source.region IS NULL OR target.region = source.region)
    WHEN MATCHED THEN
      UPDATE SET
        sessions = source.sessions,
        activeUsers = source.activeUsers,
        createdAt = source.createdAt
    WHEN NOT MATCHED THEN
      INSERT (userId, date, propertyId, region, sessions, activeUsers, createdAt)
      VALUES (source.userId, source.date, source.propertyId, source.region, source.sessions, source.activeUsers, source.createdAt)
  `;
  
  const [job] = await bq.createQueryJob({
    query: mergeSql,
    location: BQ_LOCATION,
  });
  await job.getQueryResults();
  
  return { inserted: rows.length };
}
