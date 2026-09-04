const pool = require("../config/db");

const getDashboardStats = async (req, res) => {
    try {

        // Total users
        const totalResult = await pool.query(
            "SELECT COUNT(*) FROM users"
        );

        // Active users
        const activeResult = await pool.query(
            "SELECT COUNT(*) FROM users WHERE is_active = true"
        );

        // Inactive users
        const inactiveResult = await pool.query(
            "SELECT COUNT(*) FROM users WHERE is_active = false"
        );

        // Role-wise users
        const roleResult = await pool.query(`
            SELECT
                r.name AS role,
                COUNT(ur.user_id) AS count
            FROM roles r
            LEFT JOIN user_roles ur
                ON r.id = ur.role_id
            GROUP BY r.id, r.name
            ORDER BY r.id
        `);

        res.status(200).json({
            totalUsers: Number(totalResult.rows[0].count),
            activeUsers: Number(activeResult.rows[0].count),
            inactiveUsers: Number(inactiveResult.rows[0].count),
            roleWiseUsers: roleResult.rows
        });

    } catch (error) {

        console.error(
            "Dashboard stats error:",
            error.message
        );

        res.status(500).json({
            message: "Failed to fetch dashboard statistics"
        });
    }
};

module.exports = {
    getDashboardStats
};