import { useEffect, useState } from "react";
import api from "../services/api";
import { getToken } from "../utils/auth";

function ZohoEmployees() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getValue = (employee, ...keys) => {
        const key = keys.find((candidate) => employee?.[candidate] !== undefined && employee[candidate] !== null);
        return key ? employee[key] : "-";
    };

    const normalizeEmployees = (payload) => {
        const result = payload?.response?.result || payload?.result || [];
        const collectRecords = (value) => {
            if (Array.isArray(value)) return value.flatMap(collectRecords);
            if (!value || typeof value !== "object") return [];
            if (value.EmployeeID || value.EmailID || value.FirstName || value.LastName) return [value];
            return Object.values(value).flatMap(collectRecords);
        };
        const records = collectRecords(result);

        return records.map((employee) => ({
            id: getValue(employee, "EmployeeID", "Employee Id", "Employee ID", "employeeId"),
            name: getValue(employee, "FirstName", "First Name", "firstName") !== "-"
                ? `${getValue(employee, "FirstName", "First Name", "firstName")} ${getValue(employee, "LastName", "Last Name", "lastName") === "-" ? "" : getValue(employee, "LastName", "Last Name", "lastName")}`.trim()
                : getValue(employee, "Name", "name"),
            email: getValue(employee, "EmailID", "Email ID", "Email", "email"),
            department: getValue(employee, "Department", "department"),
            designation: getValue(employee, "Designation", "designation"),
            status: getValue(employee, "Employeestatus", "Employee Status", "Status", "status")
        }));
    };

    const fetchEmployees = async () => {
        try {
            const response = await api.get("/zoho/employees", {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });

            setEmployees(normalizeEmployees(response.data));
            setError("");
        } catch (error) {
            console.error("ZOHO EMPLOYEES ERROR:", error);
            setError(
                error.response?.data?.message ||
                "Failed to fetch Zoho employees"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // The async request updates state after the effect completes.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchEmployees();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const connectZoho = () => {
        window.location.href = "http://localhost:5000/api/zoho/login";
    };

    return (
        <div className="section">
            <h2>Zoho People Employees</h2>

            {loading && (
                <div style={boxStyle}>
                    Loading employees...
                </div>
            )}

            {error && (
                <div style={{ ...boxStyle, color: "#b33e35" }}>
                    {error}
                    {error.includes("not connected") && (
                        <div>
                            <button className="primary-button" type="button" onClick={connectZoho}>Connect Zoho People</button>
                        </div>
                    )}
                </div>
            )}

            {!loading && !error && (
                <div style={{ overflowX: "auto", marginTop: "20px" }}>
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            minWidth: "900px"
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={thStyle}>Employee ID</th>
                                <th style={thStyle}>Name</th>
                                <th style={thStyle}>Email</th>
                                <th style={thStyle}>Department</th>
                                <th style={thStyle}>Designation</th>
                                <th style={thStyle}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((employee, index) => (
                                <tr key={employee.id !== "-" ? employee.id : index}>
                                    <td style={tdStyle}>{employee.id}</td>
                                    <td style={tdStyle}>{employee.name}</td>
                                    <td style={tdStyle}>{employee.email}</td>
                                    <td style={tdStyle}>{employee.department}</td>
                                    <td style={tdStyle}>{employee.designation}</td>
                                    <td style={tdStyle}>{employee.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {employees.length === 0 && <p>No employees found.</p>}
                </div>
            )}
        </div>
    );
}

const boxStyle = {
    padding: "20px",
    marginTop: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px"
};

const thStyle = {
    textAlign: "left",
    padding: "12px",
    borderBottom: "2px solid #ddd",
    background: "#f5f5f5"
};

const tdStyle = {
    padding: "12px",
    borderBottom: "1px solid #ddd"
};

export default ZohoEmployees;
