const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./data/openwa.sqlite');

db.serialize(() => {
  db.run(`
    CREATE TABLE "sessions_new" (
      "id" varchar PRIMARY KEY NOT NULL, 
      "name" varchar(100) NOT NULL, 
      "status" varchar(50) NOT NULL DEFAULT ('created'), 
      "phone" varchar(20), 
      "pushName" varchar(100), 
      "config" text NOT NULL DEFAULT ('{}'), 
      "proxyUrl" varchar(255), 
      "proxyType" varchar(10), 
      "connectedAt" text, 
      "lastActiveAt" text, 
      "createdAt" datetime NOT NULL DEFAULT (datetime('now')), 
      "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), 
      "userId" varchar, 
      CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
    )
  `);

  db.run(`INSERT INTO "sessions_new" SELECT "id", "name", "status", "phone", "pushName", "config", "proxyUrl", "proxyType", "connectedAt", "lastActiveAt", "createdAt", "updatedAt", "userId" FROM "sessions"`);

  db.run(`DROP TABLE "sessions"`);

  db.run(`ALTER TABLE "sessions_new" RENAME TO "sessions"`);

  console.log("Schema migration complete.");
});
