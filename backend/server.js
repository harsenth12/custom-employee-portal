require("dotenv").config();

const express = require("express");
const cors = require("cors");

const pool = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const auditRoutes = require("./src/routes/auditRoutes");
const zohoRoutes = require("./src/routes/zohoRoutes");
const roleRoutes = require("./src/routes/roleRoutes");

const app = express();
app.set("trust proxy", 1);

app.use((req, res, next) => {
    if (process.env.NODE_ENV === "production" && req.get("x-forwarded-proto") !== "https") {
        return res.redirect(`https://${req.get("host")}${req.originalUrl}`);
    }
    next();
});

// Middleware FIRST
app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);

// User routes
app.use("/api/users", userRoutes);

// Dashboard routes
app.use("/api/dashboard", dashboardRoutes);

// Audit routes
app.use("/api/audit", auditRoutes);

// Zoho routes
app.use("/api/zoho", zohoRoutes);
app.use("/api/roles", roleRoutes);

// Home
app.get("/", (req, res) => {
    res.json({
        message: "Custom Employee Portal API is running"
    });
});

// Database test
app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Database connected successfully",
            time: result.rows[0].now
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Database connection failed",
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});