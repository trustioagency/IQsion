const { BigQuery } = require('@google-cloud/bigquery');

const bq = new BigQuery({ 
  location: 'US',
  keyFilename: '/Users/sametdurmus/Desktop/IQsion/Maint/server/maint-ca347-firebase-adminsdk-fbsvc-e8c566eb2c.json'
});

async function cleanDuplicates() {
  try {
    const userId = 'CzBHVr3v1GS6s6yDivYyRIS4yJs1';
    const propertyId = '466101307';
    
    console.log(`🧹 Cleaning duplicates for User: ${userId}, Property: ${propertyId}\n`);
    
    // Delete duplicates - sadece en son eklenen kaydı tut (createdAt en büyük olan)
    const cleanQuery = `
      DELETE FROM \`maint-ca347.iqsion.ga4_daily\`
      WHERE CONCAT(userId, '-', propertyId, '-', CAST(date AS STRING)) IN (
        SELECT CONCAT(userId, '-', propertyId, '-', CAST(date AS STRING))
        FROM \`maint-ca347.iqsion.ga4_daily\`
        WHERE userId = @userId AND propertyId = @propertyId
        GROUP BY userId, propertyId, date
        HAVING COUNT(*) > 1
      )
      AND STRUCT(userId, propertyId, date, createdAt) NOT IN (
        SELECT AS STRUCT userId, propertyId, date, MAX(createdAt) as createdAt
        FROM \`maint-ca347.iqsion.ga4_daily\`
        WHERE userId = @userId AND propertyId = @propertyId
        GROUP BY userId, propertyId, date
        HAVING COUNT(*) > 1
      )
    `;
    
    const [job] = await bq.createQueryJob({
      query: cleanQuery,
      params: { userId, propertyId },
      location: 'US'
    });
    
    await job.getQueryResults();
    
    console.log('✅ Duplicates cleaned!\n');
    
    // Verify
    const verifyQuery = `
      SELECT 
        COUNT(*) as total_rows,
        COUNT(DISTINCT date) as unique_dates
      FROM \`maint-ca347.iqsion.ga4_daily\`
      WHERE userId = @userId AND propertyId = @propertyId
    `;
    
    const [results] = await bq.query({
      query: verifyQuery,
      params: { userId, propertyId }
    });
    
    console.log('📊 After cleanup:');
    console.log(`  Total Rows: ${results[0].total_rows}`);
    console.log(`  Unique Dates: ${results[0].unique_dates}`);
    
    if (results[0].total_rows === results[0].unique_dates) {
      console.log('\n✅ SUCCESS! No more duplicates!');
    } else {
      console.log('\n⚠️  Still has duplicates!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

cleanDuplicates();
