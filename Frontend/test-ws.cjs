const { io } = require("socket.io-client");

// Need to simulate a token or find a valid token!
// Wait, I have sqlite! I can query the DB for a valid user and mock the JWT.
const sqlite3 = require('sqlite3');
const jwt = require('jsonwebtoken');

const db = new sqlite3.Database('../OpenWa/data/openwa.sqlite');
db.get("SELECT id FROM users LIMIT 1", (err, row) => {
  if (err || !row) return console.error("No user found");
  
  const token = jwt.sign({ id: row.id }, process.env.JWT_SECRET || 'fallback_secret_for_crm_openwa');
  console.log("Token:", token);

  const socket = io('http://localhost:2785/crm-events', {
    auth: { token },
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log("Connected to WS!");
    // Keep it open for 5 seconds to receive events, but since we are just testing connection:
    setTimeout(() => {
      socket.disconnect();
    }, 5000);
  });

  socket.on('connect_error', (err) => {
    console.error("Connection error:", err.message);
  });

  socket.on('notification.received', (msg) => {
    console.log("RECEIVED:", msg);
  });
});
