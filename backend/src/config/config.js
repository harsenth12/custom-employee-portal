const dotenv = require("dotenv");

dotenv.config();

const config = {
    port: process.env.PORT || 5000,

    database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    },

    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h"
};

module.exports = config;