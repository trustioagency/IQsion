const { BigQuery } = require('@google-cloud/bigquery');

const bq = new BigQuery({ 
  location: 'US',
  keyFilename: '/Users/sametdurmus/Desktop/IQsion/Maint/server/maint-ca347-firebase-adminsdk-fbsvc-e8c566eb2c.json'
});

async function checkTodayData() {
  try {
    console.log('🔍 Checking GA4 data for today (2025-12-21)...\n');
    
    // Son 5 günün verisi
    const query = `
      SELECT 
        date,
        sessions,
        activeUsers,
        newUsers,
        eventCount
      FROM \`maint-ca347.iqsion.ga4_daily\`
      WHERE userId = 'CzBHVr3v1GS6s6yDivYyRIS4yJs1'
        AND date >= DATE_SUB(CURRENT_DATE('Europe/Istanbul'), INTERVAL 5 DAY)
      ORDER BY date DESC
    `;
    
    const [rows] = await bq.query(query);
    
    console.log('📊 Last 5 days data:');
    console.log('='.repeat(80));
    
    if (rows.length === 0) {
      console.log('❌ No data found for last 5 days!');
    } else {
      rows.forEach(row => {
        const isToday = row.date.value === '2025-12-21';
        const marker = isToday ? '👉' : '  ';
        console.log(`${marker} ${row.date.value}: ${row.sessions} sessions, ${row.activeUsers} users, ${row.newUsers} new`);
      });
      
      const hasToday = rows.some(row => row.date.value === '2025-12-21');
      console.log('');
      if (hasToday) {
        console.log('✅ Today\'s data EXISTS in BigQuery');
      } else {
        console.log('❌ Today\'s data MISSING from BigQuery');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTodayData();
