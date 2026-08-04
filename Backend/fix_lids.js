const { DataSource } = require('typeorm');

async function fix() {
  const ds = new DataSource({
    type: 'sqlite',
    database: './data/openwa.sqlite',
  });
  await ds.initialize();
  
  const lids = await ds.query('SELECT * FROM lid_mappings');
  console.log('LIDs found:', lids.length);
  console.log(lids);
  
  const convs = await ds.query("SELECT * FROM inbox_conversations WHERE contactName = 'Device Doctor India' OR contactPhone LIKE '%27501%'");
  console.log('Conversations:');
  console.log(convs);
  
  await ds.destroy();
}

fix().catch(console.error);
