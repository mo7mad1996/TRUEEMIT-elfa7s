// Pure helpers shared by the socket server (server/IO/index.js) and the client
// layout (layouts/default.vue) so car drafts are kept in sync with tiny
// { op, id, path, value } patches instead of broadcasting the whole draft list
// on every keystroke. The client imports this same file so the diff/apply rules
// can never drift between the two sides.
//
// A patch is one of:
//   { op: "set",    id, path, value }  one field of a car changed
//   { op: "add",    car }              a new draft car appeared
//   { op: "remove", id }               a draft car was dropped
//
// `path` is a dot path inside the car ("car_id", "body.hood",
// "images.0.description", ...). An array is diffed index-by-index while its
// length is unchanged; the first time its length changes the whole array is
// sent as a single value (adding / removing an image, a section, an item, ...).

// small, json-serialisable plain data — a structured clone is enough
function clone(value) {
	return value == null ? value : JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

// collect the leaf / subtree changes between two versions of one car
function diffValue(prev, next, path, out) {
	if (prev === next) return;

	if (Array.isArray(prev) && Array.isArray(next) && prev.length === next.length) {
		for (let i = 0; i < next.length; i++) {
			diffValue(prev[i], next[i], path ? `${path}.${i}` : String(i), out);
		}
		return;
	}

	if (isPlainObject(prev) && isPlainObject(next)) {
		const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
		for (const key of keys) {
			diffValue(prev[key], next[key], path ? `${path}.${key}` : key, out);
		}
		return;
	}

	// primitive, type change, or an array whose length changed -> replace it whole
	if (JSON.stringify(prev) !== JSON.stringify(next)) {
		out.push({ path, value: clone(next) });
	}
}

/**
 * Compare the previous and current draft lists and return the minimal set of
 * patches that turns the first into the second. Cars are matched by `_id`, so
 * reordering the list produces no patches.
 *
 * @param {Array} prev baseline list (what the other side already has)
 * @param {Array} next current list
 * @returns {Array} patches
 */
function diffCars(prev = [], next = []) {
	const patches = [];
	const prevById = new Map(prev.map((car) => [car._id, car]));
	const nextById = new Map(next.map((car) => [car._id, car]));

	// removed cars
	for (const car of prev) {
		if (!nextById.has(car._id)) patches.push({ op: "remove", id: car._id });
	}

	for (const car of next) {
		const before = prevById.get(car._id);

		// a brand new draft
		if (!before) {
			patches.push({ op: "add", car: clone(car) });
			continue;
		}

		// cheap prune: skip cars that did not change at all
		if (JSON.stringify(before) === JSON.stringify(car)) continue;

		const changes = [];
		diffValue(before, car, "", changes);
		for (const change of changes) {
			patches.push({ op: "set", id: car._id, path: change.path, value: change.value });
		}
	}

	return patches;
}

// write `value` at a dot `path`, creating missing intermediate objects.
// `set(obj, key, value)` does the assignment — plain on the server, Vue.$set on
// the client so new keys / array indexes stay reactive.
function setByPath(root, path, value, set) {
	const keys = path.split(".");
	let node = root;

	for (let i = 0; i < keys.length - 1; i++) {
		const key = keys[i];
		if (node[key] == null || typeof node[key] !== "object") set(node, key, {});
		node = node[key];
	}

	set(node, keys[keys.length - 1], clone(value));
}

/**
 * Apply patches to a draft list in place.
 *
 * @param {Array} list the list to mutate (server copy, or the reactive one)
 * @param {Array} patches patches from {@link diffCars}
 * @param {Function} [set] assignment fn; defaults to a plain `obj[key] = value`
 * @returns {Array} the same list
 */
function applyPatches(list, patches = [], set) {
	const assign = set || ((obj, key, value) => (obj[key] = value));

	for (const patch of patches) {
		if (patch.op === "remove") {
			const index = list.findIndex((car) => car._id === patch.id);
			if (index !== -1) list.splice(index, 1);
			continue;
		}

		if (patch.op === "add") {
			if (!list.some((car) => car._id === patch.car._id)) list.push(clone(patch.car));
			continue;
		}

		// op: "set"
		const car = list.find((c) => c._id === patch.id);
		if (car) setByPath(car, patch.path, patch.value, assign);
	}

	return list;
}

module.exports = { clone, diffCars, applyPatches };
