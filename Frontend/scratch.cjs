const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('d:/OpenWa/data/openwa.sqlite');
db.all('SELECT id, name, trigger, status FROM crm_flow', (err, rows) => {
  console.log(JSON.stringify(rows, null, 2));
  
  db.all('SELECT * FROM crm_flow_state', (err2, rows2) => {
    console.log("STATES:", JSON.stringify(rows2, null, 2));
    db.close();
  });
});
