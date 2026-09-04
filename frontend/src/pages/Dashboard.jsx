import { useEffect, useState } from "react";
import { removeToken, getToken } from "../utils/auth";
import api from "../services/api";
import ZohoEmployees from "../components/ZohoEmployees";

function Dashboard() {

    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        roleWiseUsers: []
    });

    const [auditLogs, setAuditLogs] = useState([]);

    const [loading, setLoading] = useState(true);
    const [auditLoading, setAuditLoading] = useState(true);
    const [error, setError] = useState("");
    const [showEmployeeDirectory, setShowEmployeeDirectory] = useState(false);
    const [authorizedServices, setAuthorizedServices] = useState([]);

    const user = JSON.parse(localStorage.getItem("user"));

    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {
        removeToken();
        localStorage.removeItem("user");
        window.location.reload();
    };

    // =========================
    // FETCH DASHBOARD STATS
    // =========================

    const fetchDashboardStats = async () => {
        try {
            const response = await api.get(
                "/dashboard/stats",
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            );

            setStats(response.data);
            setError("");

        } catch (error) {
            console.error(
                "DASHBOARD API ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load dashboard statistics"
            );

        } finally {
            setLoading(false);
        }
    };

    // =========================
    // FETCH AUDIT LOGS
    // =========================

    const fetchAuditLogs = async () => {
        try {
            const response = await api.get(
                "/audit",
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            );

            setAuditLogs(response.data);

        } catch (error) {
            console.error(
                "AUDIT LOG API ERROR:",
                error
            );

        } finally {
            setAuditLoading(false);
        }
    };

    // =========================
    // LOAD DATA
    // =========================

    useEffect(() => {

        // The async request updates state after the effect completes.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchDashboardStats();

        api.get("/zoho/services", {
            headers: { Authorization: `Bearer ${getToken()}` }
        }).then((response) => setAuthorizedServices(response.data)).catch(() => setAuthorizedServices([]));

        if (user?.role === "SUPER_ADMIN") {
            fetchAuditLogs();
        } else {
            setAuditLoading(false);
        }

        // The logged-in user is read once from the session during mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // =========================
    // OPEN ZOHO SERVICES
    // =========================

    const openZohoPeople = () => {
        document
            .getElementById("zoho-people-employees")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
    };

    const openZohoCRM = () => {
        window.open(getServiceUrl("CRM", "https://crm.zoho.com"), "_blank", "noopener,noreferrer");
    };

    const openZohoDesk = () => {
        window.open(getServiceUrl("DESK", "https://desk.zoho.com"), "_blank", "noopener,noreferrer");
    };

    const openZohoBooks = () => {
        window.open(getServiceUrl("BOOKS", "https://books.zoho.com"), "_blank", "noopener,noreferrer");
    };

    const hasService = (key) => authorizedServices.some((service) => service.key === key);
    const getServiceUrl = (key, fallback) => authorizedServices.find((service) => service.key === key)?.url || fallback;

    const openAdminSection = (section) => {
        window.location.href = `/admin#${section}`;
    };

    return (

        <div className="dashboard">

            {/* =========================
                SIDEBAR
            ========================= */}

            <aside className="sidebar">

                <div className="brand">
                    <span className="brand-mark">+</span>
                    <span className="brand-text">Employee Portal</span>
                </div>

                <p className="sidebar-label">Workspace</p>

                <nav>

                    <button className="nav-item active">
                        <span className="nav-icon">⌂</span><span className="nav-label">Dashboard</span>
                    </button>

                    {user?.role === "SUPER_ADMIN" && (
                        <button
                            className="nav-item"
                            onClick={() =>
                                window.location.href = "/admin"
                            }
                        >
                            <span className="nav-icon">◎</span><span className="nav-label">Users</span>
                        </button>
                    )}

                    {user?.role === "SUPER_ADMIN" && (
                        <button className="nav-item" onClick={() => openAdminSection("roles")}>
                            <span className="nav-icon">◇</span><span className="nav-label">Roles</span>
                        </button>
                    )}

                    {user?.role === "SUPER_ADMIN" && (
                        <button className="nav-item" onClick={() => openAdminSection("permissions")}>
                            <span className="nav-icon">⊞</span><span className="nav-label">Permissions</span>
                        </button>
                    )}

                    {user?.role === "SUPER_ADMIN" && (
                        <button className="nav-item" onClick={() => document.getElementById("audit-logs")?.scrollIntoView({ behavior: "smooth" })}>
                            <span className="nav-icon">≡</span><span className="nav-label">Audit Logs</span>
                        </button>
                    )}

                    {user?.role === "SUPER_ADMIN" && (
                        <button className="nav-item" onClick={() => openAdminSection("settings")}>
                            <span className="nav-icon">⚙</span><span className="nav-label">Settings</span>
                        </button>
                    )}

                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user-avatar">{user?.name?.charAt(0).toUpperCase() || "U"}</div>
                    <div className="sidebar-user-copy">
                        <strong>{user?.name || "Portal user"}</strong>
                        <span>{user?.role || "Employee"}</span>
                    </div>
                    <span className="sidebar-footer-dot" aria-label="Online" />
                </div>

            </aside>


            {/* =========================
                MAIN CONTENT
            ========================= */}

            <main className="main-content">

                {/* =========================
                    TOP BAR
                ========================= */}

                <header className="topbar">

                    <div>
                        <p className="topbar-breadcrumb">Portal / Overview</p>
                        <h2>
                            Dashboard
                        </h2>
                    </div>

                    <div className="admin-profile">

                        <span className="system-status"><span className="status-dot" />All systems operational</span>

                        <span>
                            {user?.name || "User"}
                        </span>

                        <div className="avatar">
                            {user?.name
                                ? user.name
                                    .split(" ")
                                    .map(word => word[0])
                                    .join("")
                                    .substring(0, 2)
                                    .toUpperCase()
                                : "U"}
                        </div>

                        <span className="role-pill">{user?.role || "USER"}</span>

                        <button className="logout-button" onClick={handleLogout}>
                            Logout
                        </button>

                    </div>

                </header>


                {/* =========================
                    CONTENT
                ========================= */}

                <section className="content">

                    {/* =========================
                        WELCOME
                    ========================= */}

                    <div className="welcome">
                        <div>
                        <p className="kicker">Workspace overview</p>

                        <h1>
                            Welcome back, {user?.name || "User"}
                        </h1>

                        <p>
                            Manage your employee portal
                            from one place.
                        </p>
                        </div>

                        <div className="welcome-meta">
                            <span className="meta-label">Access level</span>
                            <strong>{user?.role || "Employee"}</strong>
                            <span className="meta-divider" />
                            <span className="meta-label">Services available</span>
                            <strong>{user?.role === "SUPER_ADMIN" ? 4 : 1}</strong>
                        </div>

                    </div>


                    {/* =========================
                        API ERROR
                    ========================= */}

                    {error && (
                        <p style={{ color: "red" }}>
                            {error}
                        </p>
                    )}


                    {/* =========================
                        MAIN STATS
                    ========================= */}

                    <div className="stats">

                        <div className="stat-card">

                            <span aria-hidden="true">01</span>

                            <div>

                                <p>
                                    Total Users
                                </p>

                                <h2>
                                    {loading
                                        ? "..."
                                        : stats.totalUsers}
                                </h2>

                            </div>

                        </div>


                        <div className="stat-card">

                            <span aria-hidden="true">02</span>

                            <div>

                                <p>
                                    Active Users
                                </p>

                                <h2>
                                    {loading
                                        ? "..."
                                        : stats.activeUsers}
                                </h2>

                            </div>

                        </div>


                        <div className="stat-card">

                            <span aria-hidden="true">03</span>

                            <div>

                                <p>
                                    Inactive Users
                                </p>

                                <h2>
                                    {loading
                                        ? "..."
                                        : stats.inactiveUsers}
                                </h2>

                            </div>

                        </div>


                        <div className="stat-card">

                            <span aria-hidden="true">04</span>

                            <div>

                                <p>
                                    Total Roles
                                </p>

                                <h2>
                                    {loading
                                        ? "..."
                                        : stats.roleWiseUsers.length}
                                </h2>

                            </div>

                        </div>

                    </div>


                    {/* =========================
                        ROLE-WISE USERS
                    ========================= */}

                    <div className="section compact-section">
                        <div className="section-heading">
                            <div><p className="kicker">Distribution</p><h2>Users by role</h2></div>
                        </div>
                        <div className="role-summary">
                            {loading ? <span className="role-summary-loading">Loading role distribution...</span> : stats.roleWiseUsers.map((item) => (
                                <div className="role-summary-item" key={item.role}>
                                    <span>{item.role}</span>
                                    <strong>{Number(item.count)}</strong>
                                </div>
                            ))}
                        </div>
                    </div>


                    {/* =========================
                        RECENT ACTIVITY
                    ========================= */}

                    {user?.role === "SUPER_ADMIN" && (

                        <div className="section" id="audit-logs">

                            <h2>
                                Recent Activity
                            </h2>

                            <div className="activity-list">

                                {auditLoading ? (

                                    <div className="empty-state">
                                        Loading activity...
                                    </div>

                                ) : auditLogs.length === 0 ? (

                                    <div className="empty-state">
                                        No recent activity
                                    </div>

                                ) : (

                                    auditLogs.slice(0, 4).map((log) => (

                                        <div key={log.id} className="activity-item">

                                            <strong>
                                                {log.action}
                                            </strong>

                                            <p>
                                                {log.description}
                                            </p>

                                            <small>
                                                {new Date(
                                                    log.created_at
                                                ).toLocaleString()}
                                            </small>

                                        </div>

                                    ))

                                )}

                            </div>

                        </div>

                    )}
                    {/* =========================
                        ZOHO PEOPLE EMPLOYEES
                        ========================= */}

                    {(user?.role === "SUPER_ADMIN" ||
                        user?.role === "HR") && (
                        <div className="directory-shell" id="zoho-people-employees">
                            <button className="directory-toggle" type="button" onClick={() => setShowEmployeeDirectory((visible) => !visible)}>
                                <span><span className="kicker">People directory</span><strong>Zoho People Employees</strong></span>
                                <span>{showEmployeeDirectory ? "Hide directory" : "View directory"} <span aria-hidden="true">{showEmployeeDirectory ? "↑" : "↓"}</span></span>
                            </button>
                            {showEmployeeDirectory && <ZohoEmployees />}
                        </div>
                    )}

                    {/* =========================
                        ZOHO SERVICES
                    ========================= */}

                    <div className="section">

                        <div className="section-heading">
                            <div>
                                <p className="kicker">Authorized tools</p>
                                <h2>Zoho Services</h2>
                            </div>
                            <span className="section-note">{authorizedServices.length} service{authorizedServices.length === 1 ? "" : "s"} enabled</span>
                        </div>

                        <div className="zoho-grid">


                            {/* =========================
                                ZOHO PEOPLE
                            ========================= */}

                            {hasService("PEOPLE") && (

                                <div className="zoho-card">

                                    <div className="zoho-icon">
                                        HR
                                    </div>

                                    <h3>
                                        Zoho People
                                    </h3>

                                    <p>
                                        HR Management
                                    </p>

                                        <button
                                        onClick={openZohoPeople}
                                    >
                                        Open service <span aria-hidden="true">↗</span>
                                    </button>

                                </div>

                            )}


                            {/* =========================
                                ZOHO CRM
                            ========================= */}

                            {hasService("CRM") && (

                                <div className="zoho-card">

                                    <div className="zoho-icon">
                                        CRM
                                    </div>

                                    <h3>
                                        Zoho CRM
                                    </h3>

                                    <p>
                                        Sales & Customers
                                    </p>

                                    <button
                                        onClick={openZohoCRM}
                                    >
                                        Open service <span aria-hidden="true">↗</span>
                                    </button>

                                </div>

                            )}


                            {/* =========================
                                ZOHO DESK
                            ========================= */}

                            {hasService("DESK") && (

                                <div className="zoho-card">

                                    <div className="zoho-icon">
                                        DESK
                                    </div>

                                    <h3>
                                        Zoho Desk
                                    </h3>

                                    <p>
                                        Support & Tickets
                                    </p>

                                    <button
                                        onClick={openZohoDesk}
                                    >
                                        Open service <span aria-hidden="true">↗</span>
                                    </button>

                                </div>

                            )}


                            {/* =========================
                                ZOHO BOOKS
                            ========================= */}

                            {hasService("BOOKS") && (

                                <div className="zoho-card">

                                    <div className="zoho-icon">
                                        BOOKS
                                    </div>

                                    <h3>
                                        Zoho Books
                                    </h3>

                                    <p>
                                        Finance & Accounting
                                    </p>

                                    <button
                                        onClick={openZohoBooks}
                                    >
                                        Open service <span aria-hidden="true">↗</span>
                                    </button>

                                </div>

                            )}

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Dashboard;