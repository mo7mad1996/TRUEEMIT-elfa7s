// every file goes to the external trueemit api (cloudflare r2) so the stored
// urls are reachable from outside the shop network (needed for the report sync).
// the api stores it under `cars/files/<dir>/`, and dir is built here so all
// uploads follow one layout:
//
//   {branch}/{car-id}/image   car images, note images, section images
//   {branch}/{car-id}/video   car videos
//   {branch}/{car-id}/file    the computer scan pdf
//   {branch}/logos            shop / exclusive user logos
//
// docs: https://api.trueemit.dev/docs/management#/Files
export const UPLOAD_URL = "https://api.trueemit.dev/cars/images";
export const PRESIGN_URL = "https://api.trueemit.dev/cars/images/upload-url";
export const KINDS = ["image", "video", "file"];

// POST /cars/images goes through vercel and is capped at 4.5 MB;
// the presigned direct-to-r2 upload takes up to 30 MB
export const DIRECT_LIMIT = 4.5 * 1024 * 1024;
export const MAX_SIZE = 30 * 1024 * 1024;

// keep each path segment a plain folder name (no "/" or ".." from an id)
const clean = (v) => String(v || "").replace(/[^\w-]/g, "");

export function uploadDir({ id, kind = "image", logo = false } = {}) {
	const branch = clean(process.env.BRANCH) || "default";
	if (logo) return `${branch}/logos`;

	const folder = KINDS.includes(kind) ? kind : "file";
	const car = clean(id);
	return car ? `${branch}/${car}/${folder}` : `${branch}/${folder}`;
}

// an axios-like error so callers can read err.response.status either way
function httpError(status, message) {
	const err = new Error(message);
	err.response = { status, data: { code: String(status), message } };
	return err;
}

export default ({ $axios }, inject) => {
	// 1) ask the api for a presigned url, 2) PUT the raw file straight to r2
	async function presigned(file, dir) {
		const { uploadUrl, method, headers, url } = await $axios.$post(
			PRESIGN_URL,
			{ filename: file.name, size: file.size, contentType: file.type || undefined },
			{ params: { dir } },
		);

		// plain fetch, not $axios: the signed request must not carry our
		// Authorization header or the axios baseURL
		const res = await fetch(uploadUrl, {
			method: method || "PUT",
			headers: headers || {},
			body: file,
		});
		if (!res.ok) throw httpError(res.status, `direct upload failed (${res.status})`);

		return { url };
	}

	// the old single-request upload, only valid up to 4.5 MB
	function direct(file, dir) {
		const formData = new FormData();
		// file.name, not file.filename (undefined) — the api builds the
		// blob path from it, so this is what keeps the .mp4 / .jpg extension
		formData.append("file", file, file.name);

		return $axios.$post(UPLOAD_URL, formData, {
			params: { dir },
			headers: { "Content-Type": "multipart/form-data" },
		});
	}

	/**
	 * upload one file, resolves with `{ url }`.
	 * @param {File} file
	 * @param {{ id?: string, kind?: "image"|"video"|"file", logo?: boolean }} where
	 */
	inject("upload", async (file, where = {}) => {
		if (file.size > MAX_SIZE) throw httpError(413, "Request Entity Too Large");

		const dir = uploadDir(where);
		try {
			return await presigned(file, dir);
		} catch (err) {
			// small files can still go through the regular endpoint
			if (file.size > DIRECT_LIMIT) throw err;
			console.warn("presigned upload failed, retrying directly:", err);
			return direct(file, dir);
		}
	});
};
