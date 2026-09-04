const axios = require("axios");

let zohoAccessToken = null;
let zohoRefreshToken = process.env.ZOHO_REFRESH_TOKEN || null;

const serviceCatalog = {
    HR: {
        key: "PEOPLE",
        name: "Zoho People",
        purpose: "HR management",
        url: "https://people.zoho.in"
    },
    SALES: {
        key: "CRM",
        name: "Zoho CRM",
        purpose: "Sales and customers",
        url: "https://crm.zoho.com"
    },
    SUPPORT: {
        key: "DESK",
        name: "Zoho Desk",
        purpose: "Support and tickets",
        url: "https://desk.zoho.com"
    },
    FINANCE: {
        key: "BOOKS",
        name: "Zoho Books",
        purpose: "Finance and accounting",
        url: "https://books.zoho.com"
    }
};

const getZohoServicesForRole = (role) => {
    if (role === "SUPER_ADMIN") return Object.values(serviceCatalog);
    return serviceCatalog[role] ? [serviceCatalog[role]] : [];
};

const exchangeAuthorizationCode = async (code) => {
    const response = await axios.post("https://accounts.zoho.in/oauth/v2/token", null, {
        params: {
            code,
            client_id: process.env.ZOHO_CLIENT_ID,
            client_secret: process.env.ZOHO_CLIENT_SECRET,
            redirect_uri: process.env.ZOHO_REDIRECT_URI,
            grant_type: "authorization_code"
        }
    });
    zohoAccessToken = response.data.access_token;
    if (response.data.refresh_token) zohoRefreshToken = response.data.refresh_token;
    return response.data;
};

const refreshZohoAccessToken = async () => {
    if (!zohoRefreshToken) throw new Error("Zoho refresh token not available");
    const response = await axios.post("https://accounts.zoho.in/oauth/v2/token", null, {
        params: {
            refresh_token: zohoRefreshToken,
            client_id: process.env.ZOHO_CLIENT_ID,
            client_secret: process.env.ZOHO_CLIENT_SECRET,
            grant_type: "refresh_token"
        }
    });
    zohoAccessToken = response.data.access_token;
    return zohoAccessToken;
};

const getZohoAccessToken = async () => zohoAccessToken || refreshZohoAccessToken();

const getPeopleEmployees = async () => {
    let accessToken = await getZohoAccessToken();
    try {
        const response = await axios.get("https://people.zoho.in/api/forms/employee/getRecords", {
            headers: { Authorization: `Zoho-oauthtoken ${accessToken}` }
        });
        return response.data;
    } catch (error) {
        if (error.response?.data?.response?.errors?.code !== 7213) throw error;
        accessToken = await refreshZohoAccessToken();
        const response = await axios.get("https://people.zoho.in/api/forms/employee/getRecords", {
            headers: { Authorization: `Zoho-oauthtoken ${accessToken}` }
        });
        return response.data;
    }
};

module.exports = {
    exchangeAuthorizationCode,
    getPeopleEmployees,
    getZohoServicesForRole
};
