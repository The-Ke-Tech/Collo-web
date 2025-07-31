require('dotenv').config();
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Render uses a valid cert, but we keep this for safety
});

client.connect()
  .then(() => {
    console.log("✅ Database connected successfully!");
    return client.end();
  })
  .catch((err) => {
    console.error("❌ Database connection failed:");
    console.error(err);
    process.exit(1);
  });
