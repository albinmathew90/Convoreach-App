const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./data/openwa.sqlite');
db.all("SELECT type, name, sql FROM sqlite_master WHERE tbl_name='sessions'", (err, rows) => {
  console.log(rows);
});
