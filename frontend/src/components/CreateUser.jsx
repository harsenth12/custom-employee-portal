import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createUser as createUserAction } from "../store/adminSlice";

function CreateUser({ onUserCreated }) {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [roleId, setRoleId] = useState("2");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const dispatch = useDispatch();
    const saving = useSelector((state) => state.admin.loading);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        try {
            await dispatch(createUserAction({
                    name,
                    email,
                    password,
                    roleId: Number(roleId)
                })).unwrap();

            setMessage("User created successfully");

            setName("");
            setEmail("");
            setPassword("");

            if (onUserCreated) {
                onUserCreated();
            }

        } catch (error) {

            console.error("CREATE USER ERROR:", error);

            setError(
                error.response?.data?.message ||
                "Failed to create user"
            );
        }
    };

    return (
        <div style={{ marginTop: "30px" }}>

            <h2>Create Employee</h2>

            <form className="admin-form" onSubmit={handleSubmit}>

                <div>
                    <label>Name</label>
                    <br />

                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <br />

                <div>
                    <label>Email</label>
                    <br />

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />
                </div>

                <br />

                <div>
                    <label>Password</label>
                    <br />

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                    />
                </div>

                <br />

                <div>
                    <label>Role</label>
                    <br />

                    <select
                        value={roleId}
                        onChange={(e) => setRoleId(e.target.value)}
                    >
                        <option value="2">HR</option>
                        <option value="3">SALES</option>
                        <option value="4">SUPPORT</option>
                        <option value="5">FINANCE</option>
                    </select>
                </div>

                <br />

                <button className="primary-button" type="submit" disabled={saving}>
                    {saving ? "Creating..." : "Create User"}
                </button>

            </form>

            {message && (
                <p style={{ color: "green" }}>
                    {message}
                </p>
            )}

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

        </div>
    );
}

export default CreateUser;