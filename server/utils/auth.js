const JWT = require("jsonwebtoken");
const mongoose = require("mongoose");

/**
 * Resolve the logged in user from the `authorization` header.
 * The nuxt auth strategy sends the raw JWT (no `Bearer ` prefix).
 *
 * @returns {Promise<object|null>} the user document, or null when not signed in
 */
async function getUser(req) {
	const token = req.headers.authorization;
	if (!token) return null;

	try {
		const { id } = JWT.verify(token.replace(/^Bearer\s+/i, ""), "secret");
		return await mongoose.model("Users").findById(id).select(["name", "user_id", "job"]);
	} catch (err) {
		return null;
	}
}

/**
 * Express middleware — puts the signed in user on `req.auth_user`.
 * Never rejects, so public routes keep working.
 */
async function attachUser(req, res, next) {
	req.auth_user = await getUser(req);
	next();
}

/**
 * Express middleware factory — only lets the given jobs through.
 *
 * @param  {...string} jobs allowed `user.job` values
 */
function allow(...jobs) {
	return (req, res, next) => {
		if (!req.auth_user) return res.status(401).json({ error: "Not Authorized" });
		if (!jobs.includes(req.auth_user.job)) return res.status(403).json({ error: "Forbidden" });

		next();
	};
}

module.exports = { getUser, attachUser, allow };
