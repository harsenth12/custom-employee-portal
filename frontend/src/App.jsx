import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import { isLoggedIn } from "./utils/auth";

function App() {

    const token = isLoggedIn();
    const user = JSON.parse(localStorage.getItem("user") || "null");

    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={
                        token
                            ? <Navigate to="/dashboard" />
                            : <Login />
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        token
                            ? <Dashboard />
                            : <Navigate to="/" />
                    }
                />

                <Route
                    path="/admin"
                    element={
                        token && user?.role === "SUPER_ADMIN"
                            ? <AdminPanel />
                            : <Navigate to={token ? "/dashboard" : "/"} />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;