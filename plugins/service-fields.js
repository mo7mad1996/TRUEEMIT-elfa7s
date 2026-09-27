import Vue from "vue";

/**
 * The services (نوع الخدمة) and which report fields belong to each one.
 *
 * The engineer form and the printed report both read these rules, so a field
 * is only asked for when it really shows in the final report.
 */

export const SERVICES = Object.freeze({
	VIP: "VIP",
	FULL: "شامل",
	ENGINES: "محركات",
	BODY: "بودي",
	ENGINE: "ماكينه",
	GEAR: "قير",
	ENGINE_GEAR: "ماكينه وقير",
	CHASSIS: "شاص",
	AIRBAG: "ارباج",
	ENGINE_GEAR_CHASSIS_AIRBAG: "ماكينة قير شاص ارباج",
	MAINTENANCE: "صيانة",
	COMPUTER: "كمبيوتر",
	// الفحص الأساسي بدون السلندرات
	BASIC: "فحص أساسي",
	// نفس الفحص الأساسي مع السلندرات
	BASIC_FULL: "أساسي",
});

// the options of the service select, in display order
export const SERVICE_LIST = Object.values(SERVICES);

const { VIP, ENGINES, MAINTENANCE, BASIC, BASIC_FULL } = SERVICES;

const BASICS = [BASIC, BASIC_FULL];

const isExclusive = (job) => job == "exclusive";

// field => (service, job) => visible
const rules = {
	// ---------- header (exclusive only) ----------
	// السلندرات
	engine: (s, job) => isExclusive(job) && s != BASIC,
	// نوع الدفع + سعة المحرك
	drive: (s, job) => isExclusive(job) && BASICS.includes(s),
	engine_capacity: (s, job) => isExclusive(job) && BASICS.includes(s),
	// نوع القير + نوع الوقود + الموديل
	gear: (_, job) => isExclusive(job),
	fuel: (_, job) => isExclusive(job),
	model: (_, job) => isExclusive(job),

	// ---------- page 1 ----------
	// فحص البودي + الشاصى
	body: (s) => ![ENGINES, MAINTENANCE].includes(s),

	// ---------- page 2 ----------
	// فحص الكمبيوتر — مع الفحص الأساسي يُرفق كملف PDF فقط
	computer: (s) => s != MAINTENANCE && !BASICS.includes(s),
	computer_pdf: (s) => s != MAINTENANCE,
	// فحص الاكسسورات
	accessories: (s) => [VIP, ENGINES].includes(s),
	// الفحص الميداني + الميكانيكا
	ground: (_, job) => !isExclusive(job),
	mechanical: (_, job) => !isExclusive(job),
};

// the report fields printed on page 2
export const PAGE2_FIELDS = ["computer", "computer_pdf", "accessories", "ground", "mechanical"];

Vue.prototype.$services = SERVICES;

Vue.mixin({
	methods: {
		// is `field` part of the report for the service of `car`
		hasField(field, car = this.car) {
			const rule = rules[field];
			return rule ? rule(car?.service, this.viewJob) : true;
		},

		// is the service of `car` one of `services`
		isService(services, car = this.car) {
			return [].concat(services).includes(car?.service);
		},
	},
});
