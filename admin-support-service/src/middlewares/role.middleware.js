class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Creates a middleware that checks if the authenticated user has one of the allowed roles.
 * @param {string[]} allowedRoles - An array of role strings (e.g., ['admin', 'support']).
 * @returns {function} Express middleware function.
 */
export const requireRole = (allowedRoles) => {
    return asyncHandler(async (req, res, next) => {
        const userRole = req.user?.role;

        if (!userRole || !allowedRoles.includes(userRole)) {
            throw new ApiError(403, "Access Denied: You do not have the required permissions for this action.");
        }
        
        next();
    });
};
