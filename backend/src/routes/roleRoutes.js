const express = require("express");
const { getRoles, getPermissions, createRole, updateRolePermissions } = require("../controllers/roleController");
const authenticateToken = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/rbacMiddleware");

const router = express.Router();
router.use(authenticateToken, requireRole("SUPER_ADMIN"));
router.get("/", getRoles);
router.get("/permissions", getPermissions);
router.post("/", createRole);
router.put("/:id/permissions", updateRolePermissions);

module.exports = router;