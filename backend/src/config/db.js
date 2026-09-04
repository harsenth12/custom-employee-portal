const { Pool } = require("pg");
const config = require("./config");

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false
});

pool.on("connect", () => {
    console.log("✅ PostgreSQL connected");
});

pool.on("error", (error) => {
    console.error("❌ PostgreSQL error:", error.message);
});

module.exports = pool;
