const express = require("express");

const {
    getUsers,
    createUser,
    updateUser,
    deleteUser
} = require("../controllers/userController");

const authenticateToken = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/rbacMiddleware");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    requireRole("SUPER_ADMIN"),
    getUsers
);

router.post(
    "/",
    authenticateToken,
    requireRole("SUPER_ADMIN"),
    createUser
);

router.put(
    "/:id",
    authenticateToken,
    requireRole("SUPER_ADMIN"),
    updateUser
);

router.delete(
    "/:id",
    authenticateToken,
    requireRole("SUPER_ADMIN"),
    deleteUser
);

module.exports = router;