const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./data/openwa.sqlite');
db.all("SELECT id, name, userId FROM sessions", (err, rows) => {
  if (err) console.error(err);
  else console.log(rows);
  db.close();
});
