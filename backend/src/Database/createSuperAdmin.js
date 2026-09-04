const bcrypt = require("bcryptjs");

const pool = require("../config/db");

async function createSuperAdmin() {
    try {
        const name = "Super Admin";
        const email = "superadmin@portal.com";
        const password = "Admin@123";

        // Check whether Super Admin already exists
        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            console.log("⚠️ Super Admin already exists");
            await pool.end();
            return;
        }

        // Get SUPER_ADMIN role
        const roleResult = await pool.query(
            "SELECT id FROM roles WHERE name = $1",
            ["SUPER_ADMIN"]
        );

        if (roleResult.rows.length === 0) {
            console.log("❌ SUPER_ADMIN role does not exist");
            await pool.end();
            return;
        }

        const roleId = roleResult.rows[0].id;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const userResult = await pool.query(
            `INSERT INTO users
                (name, email, password, is_active)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email`,
            [name, email, hashedPassword, true]
        );

        const userId = userResult.rows[0].id;

        // Assign SUPER_ADMIN role
        await pool.query(
            `INSERT INTO user_roles (user_id, role_id)
             VALUES ($1, $2)`,
            [userId, roleId]
        );

        console.log("✅ Super Admin created successfully");
        console.log("Email:", email);
        console.log("Password:", password);

        await pool.end();

    } catch (error) {
        console.error("❌ Super Admin creation failed:");
        console.error(error.message);

        await pool.end();
        process.exit(1);
    }
}

createSuperAdmin();