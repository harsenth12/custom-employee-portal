const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool = require("../config/db");
const config = require("../config/config");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find user + role
        const result = await pool.query(
            `SELECT 
                u.id,
                u.name,
                u.email,
                u.password,
                u.is_active,
                r.name AS role
             FROM users u
             LEFT JOIN user_roles ur ON u.id = ur.user_id
             LEFT JOIN roles r ON ur.role_id = r.id
             WHERE u.email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        // Check active status
        if (!user.is_active) {
            return res.status(403).json({
                message: "Account is inactive"
            });
        }

        // Check password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Create JWT
         const token = jwt.sign(
    {
         userId: user.id,
           email: user.email,
        role: user.role
    },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
        );

        await pool.query(
            `INSERT INTO audit_logs (user_id, action, description, ip_address)
             VALUES ($1, $2, $3, $4)`,
            [user.id, "LOGIN", `Successful login for ${user.email}`, req.ip]
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    login
};