import { useEffect, useState } from "react";
import api from "../services/api";
import { getToken } from "../utils/auth";

function EditUser({ user, onUpdated, onCancel }) {

    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [roleId, setRoleId] = useState("");
    const [isActive, setIsActive] = useState(user.is_active);
    const [error, setError] = useState("");

    useEffect(() => {

        if (user.role === "SUPER_ADMIN") {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setRoleId("1");
        } else if (user.role === "HR") {
            setRoleId("2");
        } else if (user.role === "SALES") {
            setRoleId("3");
        } else if (user.role === "SUPPORT") {
            setRoleId("4");
        } else if (user.role === "FINANCE") {
            setRoleId("5");
        }

    }, [user]);

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {

            await api.put(
                `/users/${user.id}`,
                {
                    name,
                    email,
                    is_active: isActive,
                    roleId: Number(roleId)
                },
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            );

            onUpdated();

        } catch (error) {

            console.error("UPDATE USER ERROR:", error);

            setError(
                error.response?.data?.message ||
                "Failed to update user"
            );
        }
    };

    return (
        <div
            style={{
                padding: "20px",
                marginTop: "20px",
                border: "1px solid #ddd",
                borderRadius: "8px"
            }}
        >

            <h2>Edit User</h2>

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            <form onSubmit={handleUpdate}>

                <div>
                    <label>Name</label>
                    <br />

                    <input
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
                        required
                    >
                        <option value="1">SUPER_ADMIN</option>
                        <option value="2">HR</option>
                        <option value="3">SALES</option>
                        <option value="4">SUPPORT</option>
                        <option value="5">FINANCE</option>
                    </select>
                </div>

                <br />

                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) =>
                                setIsActive(e.target.checked)
                            }
                        />

                        {" "}Active
                    </label>
                </div>

                <br />

                <button className="primary-button" type="submit">
                    Save Changes
                </button>

                <button
                    className="secondary-button"
                    type="button"
                    onClick={onCancel}
                >
                    Cancel
                </button>

            </form>

        </div>
    );
}

export default EditUser;