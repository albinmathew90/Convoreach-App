const { DataSource } = require('typeorm');

async function merge() {
  const ds = new DataSource({
    type: 'sqlite',
    database: './data/openwa.sqlite',
  });
  await ds.initialize();
  
  const sessions = await ds.query('SELECT id, name, userId FROM session');
  console.log('Sessions:', sessions);
  
  await ds.destroy();
}

merge().catch(console.error);
