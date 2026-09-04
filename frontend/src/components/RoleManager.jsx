import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createRole, fetchPermissions, fetchRoles, updateRolePermissions } from "../store/adminSlice";

function RoleManager() {
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const dispatch = useDispatch();
    const { roles, permissions } = useSelector((state) => state.admin);

    const selectRole = (role) => {
        setSelectedRole(role);
        setSelectedPermissionIds(role.permissions?.map((permission) => permission.id) || []);
    };

    useEffect(() => {
        dispatch(fetchRoles());
        dispatch(fetchPermissions());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const savePermissions = async () => {
        if (!selectedRole) return;
        try {
            await dispatch(updateRolePermissions({ roleId: selectedRole.id, permissionIds: selectedPermissionIds })).unwrap();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Failed to update permissions");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        try {
            await dispatch(createRole({ name, description })).unwrap();
            setName("");
            setDescription("");
            dispatch(fetchRoles());
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Failed to create role");
        }
    };

    return (
        <div className="section" id="roles">
            <div className="section-heading">
                <div><p className="kicker">Access model</p><h2>Roles</h2></div>
                <p className="section-note">{roles.length} configured roles</p>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: "10px", marginBottom: "18px" }}>
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Role name" required />
                <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" />
                <button className="primary-button" type="submit">Add role</button>
            </form>
            {error && <p className="error">{error}</p>}
            <div className="activity-list">
                {roles.map((role) => (
                    <button className="activity-item role-select" type="button" key={role.id} onClick={() => selectRole(role)}>
                        <strong>{role.name}</strong>
                        <p>{role.description || "No description"}</p>
                        <small>{role.user_count} assigned users</small>
                    </button>
                ))}
            </div>
            {selectedRole && (
                <div className="permission-editor" id="permissions">
                    <p className="kicker">Role permissions</p>
                    <h3>{selectedRole.name}</h3>
                    {permissions.map((permission) => (
                        <label key={permission.id} className="permission-option">
                            <input
                                type="checkbox"
                                checked={selectedPermissionIds.includes(permission.id)}
                                onChange={(event) => setSelectedPermissionIds((current) => event.target.checked
                                    ? [...current, permission.id]
                                    : current.filter((id) => id !== permission.id))}
                            />
                            {permission.name}
                        </label>
                    ))}
                    <button className="primary-button" type="button" onClick={savePermissions}>Save permissions</button>
                </div>
            )}
        </div>
    );
}

export default RoleManager;
