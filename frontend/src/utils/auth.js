export const saveToken = (token) => {
    localStorage.setItem("token", token);
};

export const getToken = () => {
    return localStorage.getItem("token");
};

export const removeToken = () => {
    localStorage.removeItem("token");
};

export const isLoggedIn = () => {
    return !!getToken() && !isTokenExpired();
};

export const isTokenExpired = () => {
    const token = getToken();
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return !payload.exp || payload.exp * 1000 <= Date.now();
    } catch {
        return true;
    }
};