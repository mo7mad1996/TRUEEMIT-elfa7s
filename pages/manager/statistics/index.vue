<template>
	<div class="container stats">
		<header class="stats-head">
			<div class="title-block">
				<span class="eyebrow">لوحة التحليلات</span>
				<h3>الإحصائيات</h3>
			</div>
		</header>

		<!-- toolbar: the period/view selector (was the tab row) is now a dropdown,
         sitting with the report-wide filters in one flat card -->
		<div class="toolbar">
			<!-- view dropdown: periods (count-aware) + custom + exclusive -->
			<div class="field view-field" v-click-outside="() => (menu = false)">
				<span class="field-label">الفترة</span>

				<button
					type="button"
					class="view-trigger"
					:class="{ open: menu }"
					aria-haspopup="listbox"
					:aria-expanded="menu ? 'true' : 'false'"
					@click="menu = !menu"
				>
					<font-awesome-icon :icon="currentView.icon" class="lead" aria-hidden="true" />
					<span class="view-label">{{ currentView.label }}</span>
					<font-awesome-icon :icon="['fas', 'chevron-down']" class="caret" aria-hidden="true" />
				</button>

				<ul v-if="menu" class="view-menu" role="listbox">
					<li
						v-for="opt in viewOptions"
						:key="opt.key"
						:class="['view-option', { active: tab === opt.key }]"
						role="option"
						:aria-selected="tab === opt.key ? 'true' : 'false'"
						@click="select(opt.key)"
					>
						<span class="opt-text">
							<span class="opt-label">{{ opt.label }}</span>
							<span class="opt-sub">{{ opt.sub }}</span>
						</span>
						<span v-if="opt.count !== null" class="badge">{{ opt.count }}</span>
					</li>
				</ul>
			</div>

			<!-- report-wide filters -->
			<label class="field">
				<span class="field-label">الخدمة</span>
				<select v-model="service">
					<option value="">كل الخدمات</option>
					<option v-for="s in services" :key="s" :value="s">{{ s }}</option>
				</select>
			</label>

			<label class="field">
				<span class="field-label">طريقة الدفع</span>
				<select v-model="payment">
					<option value="">كل الطرق</option>
					<option v-for="p in payments" :key="p" :value="p">{{ p }}</option>
				</select>
			</label>

			<button
				v-if="service || payment"
				class="btn btn-outline reset"
				@click="service = payment = ''"
			>
				خذف الفلاتر
				<font-awesome-icon :icon="['fas', 'xmark']" />
			</button>
		</div>

		<!-- active report -->
		<section class="panel">
			<template v-if="activePeriod">
				<h4>
					{{ activePeriod.title }} بعدد
					<span class="count">{{ activeCars.length }}</span>
					سياره.
				</h4>
				<Charts
					:key="activePeriod.key + service + payment"
					:data="activeCars"
					:x="activeBuckets.x"
					:y="activeBuckets.y"
					:time="activePeriod.days"
				/>
			</template>

			<template v-else-if="tab === 'custom'">
				<h4>تقرير خاص</h4>
				<Special :service="service" :payment="payment" />
			</template>

			<template v-else>
				<h3 class="section-title">إحصائيات الشركات الخاصه</h3>
				<ExclusiveStats :owners="owners" :cars="exclusive" :service="service" :payment="payment" />
			</template>
		</section>
	</div>
</template>

<script>
import Charts from "@/components/manager/charts";
import Special from "@/components/manager/Special";
import ExclusiveStats from "@/components/manager/ExclusiveStats";

const periods = [1, 3, 7, 30, 365];
const one_hour = 1000 * 60 * 60;
const one_day = one_hour * 24;

export default {
	async asyncData({ $axios }) {
		const [last1, last3, last7, last30, last_year] = await Promise.all(
			periods.map((d) => $axios.$get(`/cars/last/${d}`)),
		);

		// the exclusive report — the owner of each car comes with it so the
		// numbers can be split per company on the client
		const owners = await $axios.$get("/cars-exclusive/owners");
		const exclusive_cars = await Promise.all(
			periods.map((d) => $axios.$get(`/cars-exclusive/last/${d}`)),
		);

		const exclusive = Object.fromEntries(periods.map((d, n) => [d, exclusive_cars[n]]));

		return { last1, last3, last7, last30, last_year, owners, exclusive };
	},
	middleware: "manager",
	head: () => ({ title: "الإحصائيات" }),
	components: { Charts, Special, ExclusiveStats },
	data() {
		return {
			tab: "day",
			// view dropdown open state
			menu: false,
			service: "",
			payment: "",
			payments: ["كاش", "شبكة", "أجل"],
			// mirror of the services in components/engineer/header.vue
			services: [
				"VIP",
				"شامل",
				"محركات",
				"بودي",
				"ماكينه",
				"قير",
				"ماكينه وقير",
				"شاص",
				"ارباج",
				"ماكينة قير شاص ارباج",
				"صيانة",
				"كمبيوتر",
				"فحص أساسي",
			],
			periods: [
				{ key: "day", days: 1, ar: "اليوم", title: "هذا اليوم" },
				{ key: "3", days: 3, ar: "٣ أيام", title: "اخر 3 ايام" },
				{ key: "7", days: 7, ar: "٧ أيام", title: "اخر 7 ايام" },
				{ key: "30", days: 30, ar: "٣٠ يوم", title: "اخر 30 يوم" },
				{ key: "365", days: 365, ar: "سنة", title: "اخر 365 يوم" },
			],
		};
	},
	computed: {
		// raw cars of each period, keyed by the period length in days
		raw() {
			return {
				1: this.last1,
				3: this.last3,
				7: this.last7,
				30: this.last30,
				365: this.last_year,
			};
		},
		activePeriod() {
			return this.periods.find((p) => p.key === this.tab) || null;
		},
		// every choice the old tab row offered, now feeding the dropdown — periods
		// keep their (filter-aware) count as a badge; custom/exclusive have none
		viewOptions() {
			return [
				...this.periods.map((p) => ({
					key: p.key,
					label: p.ar,
					sub: p.title,
					icon: ["fas", "clock"],
					count: this.count(p.days),
				})),
				{
					key: "custom",
					label: "تقرير خاص",
					sub: "نطاق تاريخ مخصص",
					icon: ["fas", "calendar-day"],
					count: null,
				},
				{
					key: "exclusive",
					label: "الشركات الخاصة",
					sub: "إحصائيات الشركات",
					icon: ["fas", "building"],
					count: null,
				},
			];
		},
		currentView() {
			return this.viewOptions.find((o) => o.key === this.tab) || this.viewOptions[0];
		},
		activeCars() {
			if (!this.activePeriod) return [];
			return this.applyFilters(this.raw[this.activePeriod.days] || []);
		},
		activeBuckets() {
			return this.activePeriod
				? this.buckets(this.activeCars, this.activePeriod.days)
				: { x: [], y: [] };
		},
	},
	methods: {
		// pick a view from the dropdown and close it
		select(key) {
			this.tab = key;
			this.menu = false;
		},
		applyFilters(cars) {
			return cars.filter(
				(c) =>
					(!this.service || c.service === this.service) &&
					(!this.payment || c.payment === this.payment),
			);
		},
		// filtered count for a period card
		count(days) {
			return this.applyFilters(this.raw[days] || []).length;
		},
		// split the cars over chart buckets — hours for today, days up to a
		// month, months for the year (same logic used in ExclusiveStats)
		buckets(cars, days) {
			const x = [];
			const y = [];
			const times = cars.map((el) => Date.parse(el.date));

			const hourly = days == 1;
			const step = days == 365 ? one_day * 30 : hourly ? one_hour : one_day;
			const t = hourly ? new Date() : new Date(new Date().setHours(24, 0, 0, 0));
			const steps = days == 365 ? 12 : hourly ? t.getHours() : days;

			let n = t;
			for (let i = hourly ? 0 : 1; i <= steps; i++) {
				const v = t - i * step;
				x.push(times.filter((el) => el > v && el < n).length);
				y.push(v);
				n = v;
			}

			return { x, y };
		},
	},
};
</script>

<style lang="scss" scoped>
/*
 * Seline Analytics style — "quiet analyst's desk on warm paper" (see DESIGN.md).
 * Warm-stone canvas, flat white cards held by 1px stone hairlines, and a single
 * cyan accent used sparingly. Light theme only, by design.
 */
.stats {
	// design tokens, scoped to this page
	--canvas: #fafaf9;
	--card: #ffffff;
	--border: #e8e6e5;
	--muted: #d6d3d1;
	--ash: #a8a29e;
	--warm: #78716c;
	--ink: #0c0a09;
	--soot: #1c1917;
	--wash: #c1e1f7;
	--cyan: #3ba6f1;
	--cyan-edge: #3398e1;
	--shadow-card: rgba(0, 0, 0, 0.05) 0px 4px 16px 0px;
	--r-card: 10px;
	--r-pill: 9999px;
	--r-input: 6px;

	position: relative;
	padding-block: 2em 4em;
	display: flex;
	flex-direction: column;
	gap: 2.5em;
	color: var(--warm);

	// full-bleed warm-stone canvas behind the whole page (hides the global bg
	// image only while this page is mounted); content and header sit above it
	&::before {
		content: "";
		position: fixed;
		inset: 0;
		z-index: -1;
		background: var(--canvas);
	}
}

.stats-head {
	.title-block {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.eyebrow {
		font-size: 0.72em;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ash);
	}

	h3 {
		margin: 0;
		font-weight: 500;
		font-size: 2em;
		line-height: 1.2;
		letter-spacing: -0.02em;
		color: var(--ink);
	}
}

/* filter bar — one flat card holding the view dropdown + report filters */
.toolbar {
	display: flex;
	align-items: flex-end;
	gap: 16px;
	flex-wrap: wrap;
	padding: 16px 18px;
	background: var(--card);
	border: 1px solid var(--border);
	border-radius: var(--r-card);
	box-shadow: var(--shadow-card);
}

.field {
	display: flex;
	flex-direction: column;
	gap: 6px;
	position: relative;

	.field-label {
		font-size: 0.72em;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--ash);
	}

	select {
		padding: 9px 12px;
		border: 1px solid var(--muted);
		border-radius: var(--r-input);
		background: var(--card);
		color: var(--ink);
		font: inherit;
		min-width: 150px;
		transition: border-color 0.2s, box-shadow 0.2s;

		&:focus {
			outline: none;
			border-color: var(--cyan);
			box-shadow: 0 0 0 2px rgba(59, 166, 241, 0.35);
		}
	}
}

/* the view dropdown (replaces the old tab row) */
.view-field {
	.view-trigger {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 210px;
		padding: 7px 12px;
		border: 1px solid var(--muted);
		border-radius: var(--r-input);
		background: var(--card);
		color: var(--ink);
		cursor: pointer;
		font: inherit;
		transition: border-color 0.2s, box-shadow 0.2s;

		.lead {
			color: var(--cyan);
		}

		.view-label {
			flex: 1;
			text-align: right;
		}

		.caret {
			color: var(--ash);
			font-size: 0.8em;
			transition: transform 0.2s;
		}

		&:hover {
			border-color: var(--cyan-edge);
		}

		&.open {
			border-color: var(--cyan);
			box-shadow: 0 0 0 2px rgba(59, 166, 241, 0.35);

			.caret {
				transform: rotate(180deg);
			}
		}

		&:focus-visible {
			outline: 2px solid var(--cyan);
			outline-offset: 2px;
		}
	}

	.view-menu {
		position: absolute;
		top: calc(100% + 6px);
		inset-inline-start: 0;
		z-index: 20;
		width: max-content;
		min-width: 100%;
		margin: 0;
		padding: 6px;
		list-style: none;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--r-card);
		box-shadow: rgba(17, 12, 46, 0.12) 0px 12px 32px 0px;
		max-height: 320px;
		overflow: auto;
	}

	.view-option {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 9px 10px;
		border-radius: var(--r-input);
		cursor: pointer;
		transition: background 0.15s;

		.lead {
			color: var(--ash);
			width: 1em;
		}

		.opt-text {
			display: flex;
			flex-direction: column;
			line-height: 1.2;
		}
		.opt-label {
			color: var(--ink);
		}
		.opt-sub {
			font-size: 0.72em;
			color: var(--ash);
		}

		&:hover {
			background: #f5f5f4;
		}

		&.active {
			background: rgba(59, 166, 241, 0.1);

			.lead,
			.opt-label {
				color: var(--cyan-edge);
			}
		}
	}
}

/* small count badge, shared by the trigger and the menu rows */
.badge {
	margin: 0;
	margin-right: auto;
	min-width: 1.6em;
	padding: 2px 8px;
	text-align: center;
	border-radius: var(--r-pill);
	background: #f5f5f4;
	border: 1px solid var(--border);
	color: var(--ink);
	font-size: 0.78em;
	font-variant-numeric: tabular-nums;
}

.view-option.active .badge {
	background: var(--wash);
	border-color: transparent;
	color: var(--cyan-edge);
}

/* reset → secondary ghost pill (no red; the palette is stone + one cyan) */
.toolbar .reset {
	align-self: flex-end;
	padding: 9px 16px;
	border-radius: var(--r-pill);
	background: transparent;
	border: 1px solid var(--border);
	color: var(--warm);
	font-size: 0.85em;

	&:hover:not(:disabled) {
		background: transparent;
		border-color: var(--cyan-edge);
		color: var(--ink);
	}
}

.panel {
	h4 {
		padding-right: 0.7em;
		border-right: 3px solid var(--cyan);
		margin-bottom: 1.25em;
		font-weight: 500;
		font-size: 1.25em;
		letter-spacing: -0.015em;
		color: var(--ink);
	}

	.section-title {
		font-weight: 500;
		font-size: 1.4em;
		letter-spacing: -0.02em;
		color: var(--ink);
		margin-bottom: 1em;
	}
}

// signature highlight span — cyan text on a soft sky-wash pill, on the keyword
.count {
	color: var(--cyan-edge);
	padding: 0.05em 0.45em;
	font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
	.view-field .view-trigger,
	.view-field .view-trigger .caret,
	.view-field .view-option,
	.field select,
	.toolbar .reset {
		transition: none;
	}
}
</style>
