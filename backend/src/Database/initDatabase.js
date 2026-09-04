const fs = require("fs");
const path = require("path");

const pool = require("../config/db");

async function initializeDatabase() {
    try {
        const schemaPath = path.join(__dirname, "schema.sql");

        const schema = fs.readFileSync(schemaPath, "utf8");

        await pool.query(schema);

        console.log("✅ Database tables created successfully");

        await pool.end();
    } catch (error) {
        console.error("❌ Database initialization failed:");
        console.error(error.message);

        await pool.end();
        process.exit(1);
    }
}

initializeDatabase();