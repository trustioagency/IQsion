import { BigQuery, Table, Dataset, Query, QueryRowsResponse } from "@google-cloud/bigquery";

const BQ_DATASET = process.env.BQ_DATASET || "iqsion";
const BQ_TABLE = process.env.BQ_TABLE || "metrics_daily";
const BQ_LOCATION = process.env.BQ_LOCATION || "US";
const BQ_PARTITION_EXPIRATION_DAYS = Number(process.env.BQ_PARTITION_EXPIRATION_DAYS || 90); // üst sınır, tablo genel TTL

let _bq: BigQuery | null = null;

export function getBigQuery(): BigQuery {
  if (_bq) return _bq;
  // Set default location on the client; dataset.get no longer accepts `location` in options
  _bq = new BigQuery({ location: BQ_LOCATION });
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
        fields: ["userId", "source"],
      },
    };
    await tableRef.create(createConfig);
  } else {
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
  const { table } = await ensureDatasetAndTable();
  
  // WORKAROUND: Streaming insert yerine batch DML INSERT kullan
  // MERGE UPDATE yapınca streaming buffer'a takılıyor, sadece INSERT ile devam
  // Dashboard tarafında MAX(createdAt) ile en yeni satırları alacağız
  const payload = rows.map(r => ({
    ...r,
    createdAt: r.createdAt || new Date().toISOString(),
  }));

  // Batch INSERT query
  const values = payload.map(r => {
    const userId = String(r.userId || '').replace(/'/g, "\\'");
    const source = String(r.source || '').replace(/'/g, "\\'");
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
    return `('${userId}', '${source}', DATE('${date}'), ${campaignId}, ${adGroupId}, ${impressions}, ${clicks}, ${costMicros}, ${sessions}, ${transactions}, ${revenueMicros}, ${createdAt})`;
  }).join(',\n      ');

  const insertSql = `
    INSERT INTO \`${bq.projectId}.${BQ_DATASET}.${BQ_TABLE}\`
    (userId, source, date, campaignId, adGroupId, impressions, clicks, costMicros, sessions, transactions, revenueMicros, createdAt)
    VALUES ${values}
  `;

  const [job] = await bq.createQueryJob({
    query: insertSql,
    location: BQ_LOCATION,
  });
  await job.getQueryResults();

  return { inserted: payload.length };
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

export async function insertGa4Daily(rows: Array<{ userId: string; date: string; propertyId?: string; sessions?: number; avgSessionDurationSec?: number; activeUsers?: number; bounceRate?: number; createdAt?: string }>) {
  const bq = getBigQuery();
  const table = bq.dataset(BQ_DATASET).table('ga4_daily');
  await table.insert(rows.map(r => ({ ...r, createdAt: r.createdAt || new Date().toISOString() })), { ignoreUnknownValues: true, skipInvalidRows: true });
  return { inserted: rows.length };
}

export async function insertGa4GeoDaily(rows: Array<{ userId: string; date: string; propertyId?: string; region?: string; sessions?: number; activeUsers?: number; createdAt?: string }>) {
  const bq = getBigQuery();
  const table = bq.dataset(BQ_DATASET).table('ga4_geo_daily');
  await table.insert(rows.map(r => ({ ...r, createdAt: r.createdAt || new Date().toISOString() })), { ignoreUnknownValues: true, skipInvalidRows: true });
  return { inserted: rows.length };
}
