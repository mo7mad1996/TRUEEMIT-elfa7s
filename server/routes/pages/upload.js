const formidable = require("formidable");
const fs = require("fs");
const path = require("path");

// local file storage — this replaces the old external trueemit-api uploads.
// files are saved under server/upload/ (part of the project itself) and are
// served statically from the site root by 06_global_dirs.js.
const uploadDir = path.join(__dirname, "../..", "upload");

/**
 * create a sub dir under the upload dir, then run the callback
 */
function createDir(dir, cb = () => {}) {
	fs.mkdir(path.join(uploadDir, dir), { recursive: true }, cb);
}

/**
 * Save an uploaded file.
 *
 * @inputs multipart form-data { file, path?: string }
 * @returns json { url: string, file: string }
 */
function appendImage(req, res) {
	const form = formidable({ uploadDir, keepExtensions: true });

	form.parse(req, (err, fields, files) => {
		if (err || !files || !files.file) {
			console.error("upload failed:", err);
			return res.status(400).json({ error: "upload failed" });
		}

		const current = files.file.newFilename;
		const dir = fields.path || "";
		const target = path.posix.join(dir, current);

		createDir(dir, () =>
			fs.rename(
				path.join(uploadDir, current),
				path.join(uploadDir, target),
				(renameErr) => {
					if (renameErr) {
						console.error("could not move the uploaded file:", renameErr);
						return res.status(500).json({ error: "could not save the file" });
					}

					// a root-relative path, not an absolute url — the browser
					// resolves it against the current origin, and the pdf render
					// resolves it against the <base href> it injects, so no host
					// name is baked into what we store. `url` keeps the key the
					// old external api used; `file` is the same path.
					res.json({ url: "/" + target, file: "/" + target });
				},
			),
		);
	});
}

/**
 * Delete a previously uploaded file.
 *
 * @inputs req.body { url: string } — either the full url or a bare path
 * @returns json { success: true } OR { error: string }
 */
function removeImage(req, res) {
	const { url } = req.body;
	if (!url) return res.status(400).json({ error: "url is required" });

	// accept both a full url (what the frontend stores) and a bare path
	let relative;
	try {
		relative = new URL(url).pathname;
	} catch (e) {
		relative = url;
	}
	relative = decodeURIComponent(relative).replace(/^\/+/, "");

	// never let the path escape the upload dir
	const base = path.resolve(uploadDir);
	const filePath = path.resolve(base, relative);
	if (filePath !== base && !filePath.startsWith(base + path.sep)) {
		return res.status(400).json({ error: "invalid path" });
	}

	fs.unlink(filePath, (unlinkErr) => {
		if (unlinkErr) {
			console.error("Failed to delete file:", unlinkErr);
			return res.status(500).json({ error: "Failed to delete file" });
		}
		res.json({ success: true });
	});
}

module.exports = (router) => {
	router.post("/", appendImage);
	router.delete("/", removeImage);

	return router;
};
