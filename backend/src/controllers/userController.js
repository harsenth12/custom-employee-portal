const bcrypt = require("bcryptjs");
const pool = require("../config/db");

// =========================
// GET ALL USERS
// =========================

const getUsers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                u.id,
                u.name,
                u.email,
                u.is_active,
                u.created_at,
                r.name AS role
            FROM users u
            LEFT JOIN user_roles ur
                ON u.id = ur.user_id
            LEFT JOIN roles r
                ON ur.role_id = r.id
            ORDER BY u.id ASC
        `);

        res.status(200).json(result.rows);

    } catch (error) {
        console.error("Get users error:", error.message);

        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};


// =========================
// CREATE USER
// =========================

const createUser = async (req, res) => {
    try {
        const { name, email, password, roleId } = req.body;

        if (!name || !email || !password || !roleId) {
            return res.status(400).json({
                message: "Name, email, password and role are required"
            });
        }

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        const roleResult = await pool.query(
            "SELECT id FROM roles WHERE id = $1",
            [roleId]
        );

        if (roleResult.rows.length === 0) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userResult = await pool.query(
            `INSERT INTO users
                (name, email, password, is_active)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, is_active, created_at`,
            [name, email, hashedPassword, true]
        );

        const userId = userResult.rows[0].id;

        await pool.query(
            `INSERT INTO user_roles
                (user_id, role_id)
             VALUES ($1, $2)`,
            [userId, roleId]
        );

        // AUDIT LOG
        console.log("AUDIT USER:", req.user);

        await pool.query(
            `INSERT INTO audit_logs
                (user_id, action, description)
             VALUES ($1, $2, $3)`,
            [
                req.user.userId,
                "CREATE_USER",
                `Created user ${email}`
            ]
        );

        res.status(201).json({
            message: "User created successfully",
            user: userResult.rows[0]
        });

    } catch (error) {
        console.error("Create user error:", error.message);

        res.status(500).json({
            message: "Failed to create user"
        });
    }
};


// =========================
// UPDATE USER
// =========================

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, is_active, roleId } = req.body;

        const userResult = await pool.query(
            `UPDATE users
             SET name = $1,
                 email = $2,
                 is_active = $3
             WHERE id = $4
             RETURNING id, name, email, is_active`,
            [name, email, is_active, id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (roleId) {
            await pool.query(
                `UPDATE user_roles
                 SET role_id = $1
                 WHERE user_id = $2`,
                [roleId, id]
            );
        }

        // AUDIT LOG
        await pool.query(
            `INSERT INTO audit_logs
                (user_id, action, description)
             VALUES ($1, $2, $3)`,
            [
                req.user.userId,
                "UPDATE_USER",
                `Updated user ${email}`
            ]
        );

        res.status(200).json({
            message: "User updated successfully",
            user: userResult.rows[0]
        });

    } catch (error) {
        console.error("Update user error:", error.message);

        res.status(500).json({
            message: "Failed to update user"
        });
    }
};


// =========================
// DELETE USER
// =========================

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await pool.query(
            `SELECT id, email
             FROM users
             WHERE id = $1`,
            [id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const deletedEmail = user.rows[0].email;

        if (deletedEmail === "superadmin@portal.com") {
            return res.status(403).json({
                message: "Super Admin cannot be deleted"
            });
        }

        await pool.query(
            "DELETE FROM user_roles WHERE user_id = $1",
            [id]
        );

        await pool.query(
            "DELETE FROM users WHERE id = $1",
            [id]
        );

        // AUDIT LOG
        await pool.query(
            `INSERT INTO audit_logs
                (user_id, action, description)
             VALUES ($1, $2, $3)`,
            [
                req.user.userId,
                "DELETE_USER",
                `Deleted user ${deletedEmail}`
            ]
        );

        res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error("Delete user error:", error.message);

        res.status(500).json({
            message: "Failed to delete user"
        });
    }
};


// =========================
// EXPORT
// =========================

module.exports = {
    getUsers,
    createUser,
    updateUser,
    deleteUser
};