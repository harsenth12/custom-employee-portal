const { Client } = require("pg");

require("dotenv").config();

const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "postgres"
});

async function createDatabase() {
    try {
        await client.connect();

        console.log("✅ Connected to PostgreSQL");

        await client.query(
            "CREATE DATABASE employee_portal"
        );

        console.log("✅ employee_portal database created");

        await client.end();
    } catch (error) {
        console.error("❌ Database creation failed:", error.message);
        await client.end();
    }
}

createDatabase();