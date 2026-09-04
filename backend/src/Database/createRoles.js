const pool = require("../config/db");

async function createRoles() {
    try {
        await pool.query(`
            INSERT INTO roles (name)
            VALUES
                ('HR'),
                ('SALES'),
                ('SUPPORT'),
                ('FINANCE')
            ON CONFLICT (name) DO NOTHING
        `);

        console.log("✅ Roles created successfully");

        const result = await pool.query(
            "SELECT id, name FROM roles ORDER BY id"
        );

        console.table(result.rows);

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await pool.end();
    }
}

createRoles();