import { useState } from "react";
import api from "../services/api";
import { saveToken } from "../utils/auth";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");

        try {
            const response = await api.post("/auth/login", {
                email,
                password
            });

            // Save JWT token
            saveToken(response.data.token);

            // Save logged-in user details and role
            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            window.location.assign("/dashboard");

            console.log("Login successful");
            console.log(response.data.user);
            console.log("JWT Token:", response.data.token);

        } catch (error) {
            console.error("LOGIN ERROR:", error);
            console.log("STATUS:", error.response?.status);
            console.log("DATA:", error.response?.data);

            setError(
                error.response?.data?.message ||
                `Login failed: ${error.message}`
            );
        }
    };

    return (
        <div className="login-container">

            <div className="login-card">

                <span className="eyebrow">Secure workspace</span>
                <h1>Custom Employee Portal</h1>

                <p>Sign in to continue</p>

                <form onSubmit={handleLogin}>

                    <label>Email</label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />

                    <label>Password</label>

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />

                    {error && (
                        <p className="error">
                            {error}
                        </p>
                    )}

                    <button type="submit">
                        Login
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Login;