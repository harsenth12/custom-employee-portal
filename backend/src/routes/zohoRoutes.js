const express = require("express");
const authenticateToken = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/rbacMiddleware");
const {
    exchangeAuthorizationCode,
    getPeopleEmployees,
    getZohoServicesForRole
} = require("../services/zohoService");

const router = express.Router();

// =========================
// ZOHO LOGIN
// =========================

router.get("/login", (req, res) => {

    const authUrl =
        `https://accounts.zoho.in/oauth/v2/auth` +
        `?scope=ZOHOPEOPLE.forms.READ` +
        `&client_id=${process.env.ZOHO_CLIENT_ID}` +
        `&response_type=code` +
        `&access_type=offline` +
        `&prompt=consent` +
        `&redirect_uri=${encodeURIComponent(
            process.env.ZOHO_REDIRECT_URI
        )}`;

    res.redirect(authUrl);
});


// =========================
// ZOHO CALLBACK
// =========================

router.get("/callback", async (req, res) => {

    try {

        const { code } = req.query;

        if (!code) {
            return res.status(400).json({
                message: "Zoho authorization code missing"
            });
        }

        const tokenResponse = await exchangeAuthorizationCode(code);

        if (tokenResponse.refresh_token) {
            console.log("✅ REFRESH TOKEN RECEIVED");
        } else {
            console.log("⚠️ Refresh token not received");
        }

        console.log("✅ ZOHO ACCESS TOKEN RECEIVED");

        res.json({
            message: "Zoho authentication successful"
        });

    } catch (error) {

        console.error(
            "ZOHO CALLBACK ERROR:",
            error.response?.data || error.message
        );

        res.status(500).json({
            message: "Zoho authentication failed"
        });
    }
});


// =========================
// AUTHORIZED SERVICES
// =========================

router.get("/services", authenticateToken, (req, res) => {
    res.json(getZohoServicesForRole(req.user.role));
});


// =========================
// GET ZOHO EMPLOYEES
// =========================

router.get(
    "/employees",
    authenticateToken,
    requireRole("SUPER_ADMIN", "HR"),
    async (req, res) => {

    try {

        const employeeData = await getPeopleEmployees();
        res.status(200).json(employeeData);

    } catch (error) {

        console.error(
            "ZOHO EMPLOYEE API ERROR:",
            error.response?.data || error.message
        );

        const missingToken = error.message === "Zoho refresh token not available";
        res.status(missingToken ? 503 : 502).json({
            message: missingToken
                ? "Zoho is not connected. Select Connect Zoho People to authorize the portal."
                : "Zoho People is temporarily unavailable",
            code: missingToken ? "ZOHO_NOT_CONNECTED" : "ZOHO_API_ERROR"
        });
    }
    }
);


module.exports = router;