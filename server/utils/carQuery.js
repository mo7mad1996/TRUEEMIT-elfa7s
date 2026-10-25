// Shared query helpers for the car list endpoints (/cars and /cars-exclusive).
// They turn the request query into a mongoose filter and pagination numbers so
// the two routes stay in sync and the heavy lifting happens in the database
// instead of shipping the whole collection to the client.

// escape a user string so it is matched literally inside a RegExp
function escapeRegex(value) {
	return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// the fields a free-text search looks through
const SEARCH_FIELDS = ["car_id", "vin_no", "type", "model", "service", "representative"];

/**
 * Build a mongoose filter from the list query params. Every supported param is
 * optional; an empty query returns `{}` (match everything).
 *
 * @param {object} query req.query
 *   - search  free text matched (case-insensitive) against {@link SEARCH_FIELDS}.
 *             May be repeated (`search=a&search=b`) — every term must match
 *             (AND), each across the fields (OR), mirroring the old client-side
 *             multi-box search.
 *   - status  "paid" | "deferred" (آجل غير مسدّد)
 *   - payment payment method: كاش | شبكة | أجل
 *   - service exact service name
 *   - start   range start (timestamp ms or date string) on `date`
 *   - end     range end
 */
function buildCarFilter(query = {}) {
	const and = [];
	const { search, status, payment, service, start, end } = query;

	// `search` may arrive as a single string or as several (one per search box)
	[]
		.concat(search || [])
		.map((term) => String(term).trim())
		.filter(Boolean)
		.forEach((term) => {
			const rx = new RegExp(escapeRegex(term), "i");
			and.push({ $or: SEARCH_FIELDS.map((field) => ({ [field]: rx })) });
		});

	if (payment) and.push({ payment });
	if (service) and.push({ service });

	// آجل غير مسدّد vs. مدفوع (كاش/شبكة أو تم سداد الآجل)
	if (status === "deferred") and.push({ payment: "أجل", is_payed: { $ne: true } });
	else if (status === "paid")
		and.push({ $or: [{ payment: { $ne: "أجل" } }, { is_payed: true }] });

	const date = {};
	const toDate = (v) => new Date(isNaN(+v) ? v : +v);
	if (start) {
		const d = toDate(start);
		if (!isNaN(+d)) date.$gte = d;
	}
	if (end) {
		const d = toDate(end);
		if (!isNaN(+d)) date.$lte = d;
	}
	if (Object.keys(date).length) and.push({ date });

	return and.length ? { $and: and } : {};
}

/**
 * Parse/clamp the pagination params.
 *
 * @returns {{ page: number, limit: number, skip: number }}
 */
function parsePaging(query = {}, { defLimit = 20, maxLimit = 100 } = {}) {
	let page = parseInt(query.page, 10);
	if (!Number.isFinite(page) || page < 1) page = 1;

	// `limit=all` returns the whole (filtered) collection in one go. The car
	// list pages now page on the server, but the escape hatch stays available.
	if (String(query.limit).toLowerCase() === "all") {
		return { page: 1, limit: 0, skip: 0, all: true };
	}

	let limit = parseInt(query.limit, 10);
	if (!Number.isFinite(limit) || limit < 1) limit = defLimit;
	if (limit > maxLimit) limit = maxLimit;

	return { page, limit, skip: (page - 1) * limit, all: false };
}

module.exports = { buildCarFilter, parsePaging, SEARCH_FIELDS };
