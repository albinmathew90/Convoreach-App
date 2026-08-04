const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./data/openwa.sqlite');
db.all("SELECT phone, errorReason FROM broadcast_recipients WHERE status = 'failed'", (err, rows) => {
  console.log(rows);
});
