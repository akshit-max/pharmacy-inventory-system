const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    try {
        // Bearer token from header
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: Missing or invalid token format" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: Token missing" });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not configured.");
        }
        const decoded = jwt.verify(token, secret);
        
        req.user = decoded; // { id, role, name }
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Token expired or invalid" });
    }
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: "Unauthorized: User not authenticated" });
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: `Forbidden: Requires one of [${allowedRoles.join(", ")}] role` });
        }
        
        next();
    };
};

module.exports = { verifyToken, authorizeRoles };
