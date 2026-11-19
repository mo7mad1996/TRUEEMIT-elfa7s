const bcrypt = require("bcrypt");
const fetch = require("node-fetch");
const mongoose = require("mongoose");

const API_URL = "https://trueemit.dev/api/inspection-centers/by-branch";
const BRANCH_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

function mapInspectionCenter(item) {
	return {
		_id: item._id,
		name: item.name,
		branchName: item.branchName,
		dashboardUrl: item.dashboardUrl,
		expired: item.expired,
		expiryDate: item.expiryDate,
		logo: item.logo || "",
		phone: item.phone || "",
		cr: item.cr || "",
		address: item.address || "",
		website_url: item.website_url || "",
		tiktok: item.tiktok || "",
		twitter: item.twitter || "",
		notes: item.notes || "",
		subscriptionType: item.subscriptionType,
		types: item.subscriptionType ? [item.subscriptionType] : [],
	};
}

async function fetchInspectionCenter(branch, fetchImpl = fetch) {
	if (!branch) return { shop: null, status: "unconfigured" };
	if (!BRANCH_PATTERN.test(branch)) {
		console.error("SHOP_BRANCH must be a valid subdomain.");
		return { shop: null, status: "invalid_branch" };
	}

	try {
		const response = await fetchImpl(`${API_URL}/${encodeURIComponent(branch)}`, {
			timeout: 10000,
		});

		if (response.status === 404) return { shop: null, status: "not_found" };
		if (!response.ok) {
			throw new Error(`Inspection-center API returned HTTP ${response.status}`);
		}

		const result = await response.json();
		const item = result && result.item;
		if (!item || typeof item !== "object" || Array.isArray(item) || !item._id || !item.name) {
			throw new Error("Inspection-center API returned an invalid item");
		}

		return { shop: mapInspectionCenter(item), status: "ready" };
	} catch (error) {
		console.error(`Unable to load inspection center for "${branch}":`, error);
		return { shop: null, status: "unavailable" };
	}
}

async function createInitialManager() {
	const User = mongoose.model("Users");
	if (await User.exists({ job: "manager" })) return;

	if (await User.exists({ user_id: "admin" })) {
		throw new Error('Cannot create the initial manager: user_id "admin" is already in use.');
	}

	const password = process.env.INITIAL_ADMIN_PASSWORD;
	if (!password || password.length < 12) {
		throw new Error(
			"Set INITIAL_ADMIN_PASSWORD to at least 12 characters before creating the first manager.",
		);
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	await User.create({
		name: "مدير النظام",
		user_id: "admin",
		password: hashedPassword,
		job: "manager",
	});

	console.log("Created the initial manager account with user_id \"admin\".");
}

async function initialize(fetchImpl = fetch) {
	const branch = (process.env.SHOP_BRANCH || "").trim().toLowerCase();
	const result = await fetchInspectionCenter(branch, fetchImpl);
	global.inspectionCenter = result;

	if (result.status === "ready") await createInitialManager();

	return result;
}

module.exports = { createInitialManager, fetchInspectionCenter, initialize };
