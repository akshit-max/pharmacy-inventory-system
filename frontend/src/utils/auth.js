// Small helpers for the logged-in user (saved in localStorage after login)

export function getUser() {
    try {
        return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
        return null;
    }
}

export function isLoggedIn() {
    return Boolean(localStorage.getItem("token"));
}

// hasRole("Admin", "Pharmacist") -> true if the user has one of these roles
export function hasRole(...roles) {
    const user = getUser();
    return Boolean(user && roles.includes(user.role));
}

export function saveLogin(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
}

export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

// First page to open after login, based on role
export function homePathFor(user) {
    return user?.role === "Cashier" ? "/sales" : "/dashboard";
}

// Read a readable error message from an axios error
export function errorMessage(error, fallback) {
    return error?.response?.data?.message || fallback;
}
