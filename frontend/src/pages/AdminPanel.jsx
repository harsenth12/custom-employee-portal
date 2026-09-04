import { useEffect, useState } from "react";
import api from "../services/api";
import { getToken } from "../utils/auth";
import CreateUser from "../components/CreateUser";
import EditUser from "../components/EditUser";
import { removeToken } from "../utils/auth";
import RoleManager from "../components/RoleManager";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../store/adminSlice";

function AdminPanel() {

    const [editingUser, setEditingUser] = useState(null);
    const dispatch = useDispatch();
    const { users, error } = useSelector((state) => state.admin);

    const refreshUsers = () => {
        dispatch(fetchUsers());
    };

    useEffect(() => {
        dispatch(fetchUsers());
        // The admin data is loaded once when the view opens.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLogout = () => {
        removeToken();
        localStorage.removeItem("user");
        window.location.href = "/";
    };

    return (
        <div className="dashboard">
            <aside className="sidebar">
                <div className="brand"><span className="brand-mark">+</span><span className="brand-text">Employee Portal</span></div>
                <p className="sidebar-label">Workspace</p>
                <nav>
                    <button className="nav-item" onClick={() => { window.location.href = "/dashboard"; }}><span className="nav-icon">⌂</span><span className="nav-label">Dashboard</span></button>
                    <button className="nav-item active"><span className="nav-icon">◎</span><span className="nav-label">Users</span></button>
                </nav>
                <div className="sidebar-footer">
                    <div className="sidebar-user-avatar">SA</div>
                    <div className="sidebar-user-copy"><strong>Super Admin</strong><span>Full access</span></div>
                    <span className="sidebar-footer-dot" aria-label="Online" />
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <h2>People & access</h2>
                    <div className="admin-profile"><span>Super Admin</span><div className="avatar">SA</div><button className="logout-button" onClick={handleLogout}>Log out</button></div>
                </header>
                <section className="content">

            <p className="kicker">Administration</p>
            <h1>Manage users</h1>

            <p className="section-note">Create accounts, assign service roles, and control access status.</p>

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            {/* Create User */}
            <CreateUser onUserCreated={refreshUsers} />

            <RoleManager />

            <div className="section" id="settings">
                <p className="kicker">Configuration</p>
                <h2>Settings</h2>
                <p className="section-note">Session duration and Zoho OAuth settings are managed through the backend environment configuration.</p>
            </div>

            {/* Edit User */}
            {editingUser && (
                <EditUser
                    user={editingUser}

                    onUpdated={() => {
                        setEditingUser(null);
                        dispatch(fetchUsers());
                    }}

                    onCancel={() => {
                        setEditingUser(null);
                    }}
                />
            )}

            {/* Users Table */}
            <h2 className="section" style={{ marginTop: "40px" }}>
                Existing Users
            </h2>

            <div style={{ overflowX: "auto", marginTop: "20px" }}>
            <table className="data-table">

                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>

                    {users.map((user) => (
                        <tr key={user.id}>

                            <td>{user.id}</td>

                            <td>{user.name}</td>

                            <td>{user.email}</td>

                            <td>{user.role}</td>

                            <td className={user.is_active ? "status" : "status inactive"}>
                                {user.is_active
                                    ? "Active"
                                    : "Inactive"}
                            </td>

                            <td>

                                {/* EDIT */}
                                <button
                                    className="table-action edit-action"
                                    onClick={() => {
                                        setEditingUser(user);
                                    }}
                                >
                                    Edit
                                </button>

                                {/* DELETE */}
                                <button
                                    className="table-action delete-action"
                                    onClick={async () => {

                                        if (
                                            !window.confirm(
                                                `Delete ${user.name}?`
                                            )
                                        ) {
                                            return;
                                        }

                                        try {

                                            await api.delete(
                                                `/users/${user.id}`,
                                                {
                                                    headers: {
                                                        Authorization:
                                                            `Bearer ${getToken()}`
                                                    }
                                                }
                                            );

                                            dispatch(fetchUsers());

                                        } catch (error) {

                                            alert(
                                                error.response?.data?.message ||
                                                "Failed to delete user"
                                            );
                                        }
                                    }}
                                >
                                    Delete
                                </button>

                            </td>

                        </tr>
                    ))}

                </tbody>

            </table>
            </div>

                </section>
            </main>
        </div>
    );
}

export default AdminPanel;