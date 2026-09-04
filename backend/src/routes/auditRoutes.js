const express = require("express");

const {
    getAuditLogs
} = require("../controllers/auditController");

const authenticateToken = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/rbacMiddleware");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    requireRole("SUPER_ADMIN"),
    getAuditLogs
);

module.exports = router;