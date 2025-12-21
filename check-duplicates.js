const { BigQuery } = require('@google-cloud/bigquery');

const bq = new BigQuery({ 
  location: 'US',
  keyFilename: '/Users/sametdurmus/Desktop/IQsion/Maint/server/maint-ca347-firebase-adminsdk-fbsvc-e8c566eb2c.json'
});

async function checkDuplicates() {
  try {
    console.log('🔍 Checking GA4 duplicates...\n');
    
    // 1. Get all users and their stats
    const statsQuery = `
      SELECT 
        userId,
        propertyId,
        COUNT(*) as total_rows,
        COUNT(DISTINCT date) as unique_dates,
        MIN(date) as first_date,
        MAX(date) as last_date
      FROM \`maint-ca347.iqsion.ga4_daily\`
      GROUP BY userId, propertyId
      ORDER BY total_rows DESC
      LIMIT 5
    `;
    
    const [stats] = await bq.query(statsQuery);
    
    console.log('📊 User Stats:');
    console.log('='.repeat(80));
    stats.forEach(row => {
      console.log(`User: ${row.userId}`);
      console.log(`  Property: ${row.propertyId}`);
      console.log(`  Total Rows: ${row.total_rows}`);
      console.log(`  Unique Dates: ${row.unique_dates}`);
      console.log(`  Date Range: ${row.first_date.value} → ${row.last_date.value}`);
      
      if (row.total_rows > row.unique_dates) {
        console.log(`  ⚠️  DUPLICATES: ${row.total_rows - row.unique_dates} extra rows!`);
      } else {
        console.log(`  ✅ No duplicates`);
      }
      console.log('');
    });
    
    // 2. Check for actual duplicates
    console.log('\n🔍 Duplicate Details:');
    console.log('='.repeat(80));
    
    for (const stat of stats) {
      if (stat.total_rows > stat.unique_dates) {
        const dupQuery = `
          SELECT 
            date,
            propertyId,
            COUNT(*) as row_count,
            ARRAY_AGG(STRUCT(sessions, activeUsers, newUsers) LIMIT 5) as values
          FROM \`maint-ca347.iqsion.ga4_daily\`
          WHERE userId = @userId AND propertyId = @propertyId
          GROUP BY date, propertyId
          HAVING COUNT(*) > 1
          ORDER BY date DESC
          LIMIT 10
        `;
        
        const [duplicates] = await bq.query({
          query: dupQuery,
          params: { userId: stat.userId, propertyId: stat.propertyId }
        });
        
        console.log(`\nUser ${stat.userId} (Property: ${stat.propertyId}):`);
        if (duplicates.length > 0) {
          duplicates.forEach(dup => {
            console.log(`  Date: ${dup.date.value} → ${dup.row_count} copies`);
            console.log(`  Values: ${JSON.stringify(dup.values)}`);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDuplicates();
