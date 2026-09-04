import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../services/api";
import { getToken } from "../utils/auth";

const authConfig = () => ({
    headers: { Authorization: `Bearer ${getToken()}` }
});

export const fetchUsers = createAsyncThunk("admin/fetchUsers", async () => {
    const response = await api.get("/users", authConfig());
    return response.data;
});

export const createUser = createAsyncThunk("admin/createUser", async (user) => {
    const response = await api.post("/users", user, authConfig());
    return response.data.user;
});

export const fetchRoles = createAsyncThunk("admin/fetchRoles", async () => {
    const response = await api.get("/roles", authConfig());
    return response.data;
});

export const fetchPermissions = createAsyncThunk("admin/fetchPermissions", async () => {
    const response = await api.get("/roles/permissions", authConfig());
    return response.data;
});

export const createRole = createAsyncThunk("admin/createRole", async (role) => {
    const response = await api.post("/roles", role, authConfig());
    return response.data;
});

export const updateRolePermissions = createAsyncThunk(
    "admin/updateRolePermissions",
    async ({ roleId, permissionIds }) => {
        await api.put(`/roles/${roleId}/permissions`, { permissionIds }, authConfig());
        return { roleId, permissionIds };
    }
);

const adminSlice = createSlice({
    name: "admin",
    initialState: { users: [], roles: [], permissions: [], loading: false, error: "", success: "" },
    reducers: { clearAdminMessage: (state) => { state.error = ""; state.success = ""; } },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => { state.loading = true; state.error = ""; })
            .addCase(fetchUsers.fulfilled, (state, action) => { state.loading = false; state.users = action.payload; })
            .addCase(fetchUsers.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Failed to load users"; })
            .addCase(createUser.pending, (state) => { state.loading = true; state.error = ""; state.success = ""; })
            .addCase(createUser.fulfilled, (state, action) => { state.loading = false; state.users.push(action.payload); state.success = "User created successfully"; })
            .addCase(createUser.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Failed to create user"; })
            .addCase(fetchRoles.fulfilled, (state, action) => { state.roles = action.payload; })
            .addCase(fetchPermissions.fulfilled, (state, action) => { state.permissions = action.payload; })
            .addCase(createRole.fulfilled, (state, action) => { state.roles.push(action.payload); state.success = "Role created successfully"; })
            .addCase(createRole.rejected, (state, action) => { state.error = action.error.message || "Failed to create role"; })
            .addCase(updateRolePermissions.fulfilled, (state, action) => {
                const role = state.roles.find((item) => item.id === action.payload.roleId);
                if (role) role.permissions = state.permissions.filter((permission) => action.payload.permissionIds.includes(permission.id));
                state.success = "Permissions updated successfully";
            })
            .addCase(updateRolePermissions.rejected, (state, action) => { state.error = action.error.message || "Failed to update permissions"; });
    }
});

export const { clearAdminMessage } = adminSlice.actions;
export default adminSlice.reducer;
