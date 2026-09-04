const pool = require("../config/db");

const getRoles = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.id, r.name, r.description, COUNT(ur.user_id)::int AS user_count,
                   COALESCE(json_agg(json_build_object('id', p.id, 'name', p.name))
                   FILTER (WHERE p.id IS NOT NULL), '[]') AS permissions
            FROM roles r
            LEFT JOIN user_roles ur ON ur.role_id = r.id
            LEFT JOIN role_permissions rp ON rp.role_id = r.id
            LEFT JOIN permissions p ON p.id = rp.permission_id
            GROUP BY r.id
            ORDER BY r.id
        `);
        res.json(result.rows);
    } catch (error) {
        console.error("Get roles error:", error.message);
        res.status(500).json({ message: "Failed to fetch roles" });
    }
};

const getPermissions = async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name, description FROM permissions ORDER BY id");
        res.json(result.rows);
    } catch (error) {
        console.error("Get permissions error:", error.message);
        res.status(500).json({ message: "Failed to fetch permissions" });
    }
};

const createRole = async (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Role name is required" });
    try {
        const result = await pool.query(
            "INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING id, name, description",
            [name.trim().toUpperCase(), description || null]
        );
        await pool.query(
            "INSERT INTO audit_logs (user_id, action, description, ip_address) VALUES ($1, $2, $3, $4)",
            [req.user.userId, "CREATE_ROLE", `Created role ${result.rows[0].name}`, req.ip]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === "23505") return res.status(409).json({ message: "Role already exists" });
        console.error("Create role error:", error.message);
        res.status(500).json({ message: "Failed to create role" });
    }
};

const updateRolePermissions = async (req, res) => {
    const { id } = req.params;
    const permissionIds = Array.isArray(req.body.permissionIds) ? req.body.permissionIds : [];
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query("DELETE FROM role_permissions WHERE role_id = $1", [id]);
        for (const permissionId of permissionIds) {
            await client.query(
                "INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)",
                [id, permissionId]
            );
        }
        await client.query(
            "INSERT INTO audit_logs (user_id, action, description, ip_address) VALUES ($1, $2, $3, $4)",
            [req.user.userId, "UPDATE_ROLE_PERMISSIONS", `Updated permissions for role ${id}`, req.ip]
        );
        await client.query("COMMIT");
        res.json({ message: "Role permissions updated" });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Update role permissions error:", error.message);
        res.status(500).json({ message: "Failed to update role permissions" });
    } finally {
        client.release();
    }
};

module.exports = { getRoles, getPermissions, createRole, updateRolePermissions };