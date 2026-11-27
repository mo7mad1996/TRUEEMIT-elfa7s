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
// {branch} is SHOP_BRANCH, sent by GET /api/trueemit/shop as `$shop.branch`.
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

export function uploadDir(branch, { id, kind = "image", logo = false } = {}) {
	const root = clean(branch) || "default";
	if (logo) return `${root}/logos`;

	const folder = KINDS.includes(kind) ? kind : "file";
	const car = clean(id);
	return car ? `${root}/${car}/${folder}` : `${root}/${folder}`;
}

// an axios-like error so callers can read err.response.status either way
function httpError(status, message) {
	const err = new Error(message);
	err.response = { status, data: { code: String(status), message } };
	return err;
}

export default (ctx, inject) => {
	const { $axios } = ctx;

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

	// the single-request upload, only valid up to 4.5 MB
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

		const shop = ctx.$shop || ctx.app.$shop;
		const dir = uploadDir(shop && shop.branch, where);

		// small files: one request through the api. bigger ones (videos) need
		// the presigned PUT, which only works from the browser once the r2
		// bucket has a CORS rule allowing PUT from the app's origin
		if (file.size <= DIRECT_LIMIT) return direct(file, dir);
		return presigned(file, dir);
	});
};
