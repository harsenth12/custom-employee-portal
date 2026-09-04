const pool = require("../config/db");

const getAuditLogs = async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                id,
                user_id,
                action,
                description,
                created_at
            FROM audit_logs
            ORDER BY created_at DESC
            LIMIT 10
        `);

        res.status(200).json(result.rows);

    } catch (error) {

        console.error(
            "Audit logs error:",
            error.message
        );

        res.status(500).json({
            message: "Failed to fetch audit logs"
        });
    }
};

module.exports = {
    getAuditLogs
};