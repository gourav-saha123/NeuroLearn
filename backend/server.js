const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');
const dns = require('dns');

// Fix for Node.js 18+ fetch issues (IPv6/DNS resolution)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Connect to Database
connectDB();

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
