const bcrypt = require("bcrypt");
const fetch = require("node-fetch");
const mongoose = require("mongoose");

const API_URL = "https://trueemit.dev/api/inspection-centers/by-branch";
const BRANCH_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
const EDITABLE_FIELDS = [
  "name",
  "logo",
  "phone",
  "cr",
  "address",
  "website_url",
  "tiktok",
  "twitter",
];

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

function getInspectionCenterStatus(shop) {
  const expirationTimestamp = shop.expired;
  const expired =
    typeof expirationTimestamp === "number" &&
    Number.isFinite(expirationTimestamp) &&
    expirationTimestamp <= Date.now();

  return expired ? "expired" : "ready";
}

async function fetchInspectionCenter(branch, fetchImpl = fetch) {
  if (!branch) return { shop: null, status: "unconfigured" };
  if (!BRANCH_PATTERN.test(branch)) {
    console.error("يجب أن يكون SHOP_BRANCH نطاقًا فرعيًا صالحًا.");
    return { shop: null, status: "invalid_branch" };
  }

  try {
    const response = await fetchImpl(
      `${API_URL}/${encodeURIComponent(branch)}`,
      {
        timeout: 10000,
      },
    );

    if (response.status === 404) return { shop: null, status: "not_found" };
    if (!response.ok) {
      throw new Error(`أعاد واجهة برمجة مراكز الفحص استجابة HTTP ${response.status}`);
    }

    const result = await response.json();
    const item = result && result.item;
    if (
      !item ||
      typeof item !== "object" ||
      Array.isArray(item) ||
      !item._id ||
      !item.name
    ) {
      throw new Error("أعادت واجهة برمجة مراكز الفحص عنصرًا غير صالح");
    }

    const shop = mapInspectionCenter(item);
    return { shop, status: getInspectionCenterStatus(shop) };
  } catch (error) {
    console.error(`تعذر تحميل مركز الفحص للفرع "${branch}":`, error);
    return { shop: null, status: "unavailable" };
  }
}

async function updateInspectionCenter(fields, fetchImpl = fetch) {
  const branch = (process.env.SHOP_BRANCH || "").trim().toLowerCase();
  if (!BRANCH_PATTERN.test(branch)) {
    const error = new Error("يجب أن يكون SHOP_BRANCH نطاقًا فرعيًا صالحًا.");
    error.status = 503;
    throw error;
  }
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
    throw new TypeError("يجب أن يكون تحديث مركز الفحص كائنًا (object).");
  }

  const updates = {};
  for (const field of EDITABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(fields, field)) {
      if (typeof fields[field] !== "string") {
        throw new TypeError(
          `يجب أن يكون الحقل "${field}" في مركز الفحص نصًا (string).`,
        );
      }
      updates[field] = fields[field];
    }
  }
  if (!Object.keys(updates).length) {
    throw new TypeError(
      "يجب توفير حقل واحد على الأقل قابل للتعديل في مركز الفحص.",
    );
  }
  if (
    Object.prototype.hasOwnProperty.call(updates, "name") &&
    !updates.name.trim()
  ) {
    throw new TypeError("لا يمكن أن يكون اسم مركز الفحص فارغًا.");
  }

  const { shop: current } = await fetchInspectionCenter(branch, fetchImpl);
  if (!current) {
    const error = new Error("مركز الفحص غير متاح حاليًا.");
    error.status = 503;
    throw error;
  }

  const response = await fetchImpl(`${API_URL}/${encodeURIComponent(branch)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
    timeout: 10000,
  });

  if (!response.ok) {
    throw new Error(`أعاد واجهة برمجة مراكز الفحص استجابة HTTP ${response.status}`);
  }

  return mapInspectionCenter({ ...current, ...updates });
}

async function createInitialManager() {
  const User = mongoose.model("Users");
  if (await User.exists({ job: "manager" })) return;

  if (await User.exists({ user_id: "admin" })) {
    throw new Error(
      'لا يمكن إنشاء حساب المدير الأولي: معرّف المستخدم "admin" مستخدم بالفعل.',
    );
  }

  const password = process.env.INITIAL_ADMIN_PASSWORD;
  if (!password) {
    throw new Error("يجب تعيين INITIAL_ADMIN_PASSWORD لإنشاء أول مدير.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    name: "مدير النظام",
    user_id: "admin",
    password: hashedPassword,
    job: "manager",
  });

  console.log('تم إنشاء حساب المدير الأولي بمعرّف المستخدم "admin".');
}

// Fetches the branch from the API on every call and keeps nothing in memory, so
// a renewed subscription or a newly added branch takes effect immediately.
async function getInspectionCenter(fetchImpl = fetch) {
  const branch = (process.env.SHOP_BRANCH || "").trim().toLowerCase();
  return fetchInspectionCenter(branch, fetchImpl);
}

async function initialize(fetchImpl = fetch) {
  const branch = (process.env.SHOP_BRANCH || "").trim().toLowerCase();
  const result = await fetchInspectionCenter(branch, fetchImpl);

  if (result.status === "ready") await createInitialManager();

  return result;
}

module.exports = {
  createInitialManager,
  fetchInspectionCenter,
  getInspectionCenter,
  initialize,
  updateInspectionCenter,
};
