const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./data/openwa.sqlite');

db.run("DELETE FROM sessions WHERE name = 'testing'", function(err) {
  if (err) {
    console.error(err);
  } else {
    console.log(`Row(s) deleted: ${this.changes}`);
  }
});
