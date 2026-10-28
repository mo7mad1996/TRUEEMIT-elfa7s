<template>
	<div class="datepicker" v-click-outside="() => (open = false)">
		<!-- trigger field (drop-in for a native date input) -->
		<button
			:id="id"
			type="button"
			class="dp-trigger"
			:class="{ active: open }"
			aria-haspopup="dialog"
			:aria-expanded="open ? 'true' : 'false'"
			@click="toggle"
		>
			<font-awesome-icon :icon="['far', 'calendar']" class="dp-ico" aria-hidden="true" />
			<span class="dp-text" :class="{ placeholder: !value }">{{ display }}</span>
			<font-awesome-icon :icon="['fas', 'chevron-down']" class="dp-caret" aria-hidden="true" />
		</button>

		<!-- calendar popover -->
		<div v-if="open" class="dp-pop" role="dialog" aria-label="اختيار التاريخ">
			<div class="dp-head">
				<button type="button" class="nav" @click="shiftYear(-1)" aria-label="السنة السابقة">
					<font-awesome-icon :icon="['fas', 'angles-left']" />
				</button>
				<button type="button" class="nav" @click="shiftMonth(-1)" aria-label="الشهر السابق">
					<font-awesome-icon :icon="['fas', 'angle-left']" />
				</button>

				<span class="dp-title">{{ monthLabel }}</span>

				<button type="button" class="nav" @click="shiftMonth(1)" aria-label="الشهر التالي">
					<font-awesome-icon :icon="['fas', 'angle-right']" />
				</button>
				<button type="button" class="nav" @click="shiftYear(1)" aria-label="السنة التالية">
					<font-awesome-icon :icon="['fas', 'angles-right']" />
				</button>
			</div>

			<div class="dp-week">
				<span v-for="(d, i) in weekDays" :key="d" :class="{ we: i >= 5 }">{{ d }}</span>
			</div>

			<div class="dp-grid">
				<button
					v-for="cell in cells"
					:key="cell.iso"
					type="button"
					class="day"
					:class="{ out: !cell.inMonth, today: cell.isToday, selected: cell.isSelected }"
					@click="selectDay(cell)"
				>
					{{ cell.day }}
				</button>
			</div>

			<div class="dp-foot">
				<button type="button" class="cancel" @click="open = false">إلغاء</button>
				<button type="button" class="apply" @click="apply">تطبيق</button>
			</div>
		</div>
	</div>
</template>

<script>
const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];
// Monday-first week, to match the reference design
const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export default {
	name: "DatePicker",
	// v-model over a `YYYY-MM-DD` string — same shape the native inputs used
	props: {
		value: { type: String, default: "" },
		id: { type: String, default: null },
		placeholder: { type: String, default: "اختر التاريخ" },
	},
	data() {
		const now = new Date();
		return {
			open: false,
			// the pending selection, committed only on "تطبيق"
			draft: null,
			viewYear: now.getFullYear(),
			viewMonth: now.getMonth(),
			weekDays: WEEK_DAYS,
		};
	},
	computed: {
		monthLabel() {
			return `${MONTHS[this.viewMonth]} ${this.viewYear}`;
		},
		display() {
			const d = this.parse(this.value);
			if (!d) return this.placeholder;
			return `${this.pad(d.getDate())} / ${this.pad(d.getMonth() + 1)} / ${d.getFullYear()}`;
		},
		// a flat 42-cell (6×7) grid for the shown month
		cells() {
			const first = new Date(this.viewYear, this.viewMonth, 1);
			const offset = (first.getDay() + 6) % 7; // Monday-first leading days
			const start = new Date(this.viewYear, this.viewMonth, 1 - offset);

			const today = this.toISO(new Date());
			const sel = this.draft ? this.toISO(this.draft) : null;

			const out = [];
			for (let i = 0; i < 42; i++) {
				const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
				const iso = this.toISO(d);
				out.push({
					iso,
					date: d,
					day: d.getDate(),
					inMonth: d.getMonth() === this.viewMonth,
					isToday: iso === today,
					isSelected: iso === sel,
				});
			}
			return out;
		},
	},
	methods: {
		pad(n) {
			return String(n).padStart(2, "0");
		},
		// local-date ISO (avoids the UTC day-shift of Date.toISOString)
		toISO(d) {
			return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`;
		},
		parse(str) {
			if (!str) return null;
			const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(str);
			if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
			const d = new Date(str);
			return isNaN(d.getTime()) ? null : d;
		},
		toggle() {
			if (this.open) return (this.open = false);
			// seed the view + draft from the current value (or today)
			const base = this.parse(this.value) || new Date();
			this.draft = this.parse(this.value);
			this.viewYear = base.getFullYear();
			this.viewMonth = base.getMonth();
			this.open = true;
		},
		shiftMonth(delta) {
			const d = new Date(this.viewYear, this.viewMonth + delta, 1);
			this.viewYear = d.getFullYear();
			this.viewMonth = d.getMonth();
		},
		shiftYear(delta) {
			this.viewYear += delta;
		},
		selectDay(cell) {
			this.draft = new Date(cell.date.getFullYear(), cell.date.getMonth(), cell.date.getDate());
			// follow the selection into its month if a trailing/leading day was tapped
			this.viewYear = this.draft.getFullYear();
			this.viewMonth = this.draft.getMonth();
		},
		apply() {
			if (this.draft) this.$emit("input", this.toISO(this.draft));
			this.open = false;
		},
	},
};
</script>

<style lang="scss" scoped>
.datepicker {
	position: relative;
	width: 100%;
}

.dp-trigger {
	display: flex;
	align-items: center;
	gap: 10px;
	width: 100%;
	padding: 9px 12px;
	border: 1px solid #d6d3d1;
	border-radius: 8px;
	background: #ffffff;
	color: #0c0a09;
	font: inherit;
	cursor: pointer;
	transition: border-color 0.2s, box-shadow 0.2s;

	.dp-ico {
		color: #78716c;
	}
	.dp-text {
		flex: 1;
		text-align: start;

		&.placeholder {
			color: #a8a29e;
		}
	}
	.dp-caret {
		color: #a8a29e;
		font-size: 0.8em;
	}

	&:hover {
		border-color: #a8a29e;
	}
	&.active {
		border-color: #0c0a09;
		box-shadow: 0 0 0 2px rgba(12, 10, 9, 0.08);
	}
}

.dp-pop {
	position: absolute;
	top: calc(100% + 8px);
	inset-inline-start: 0;
	z-index: 50;
	width: 350px;
	max-width: 88vw;
	padding: 16px;
	direction: ltr;
	background: #ffffff;
	border: 1px solid #e8e6e5;
	border-radius: 16px;
	box-shadow: rgba(17, 12, 46, 0.4) 0px 12px 45px 0px;
}

.dp-head {
	display: flex;
	align-items: center;
	gap: 3px;
	margin-bottom: 12px;
	padding-bottom: 6px;
	border-bottom: 1px solid #e8e6e5;

	.nav {
		width: 34px;
		height: 34px;
		flex: none;
		display: grid;
		place-items: center;
		border: 1px solid #e8e6e5;
		border-radius: 8px;
		background: #ffffff;
		color: #3b3938;
		cursor: pointer;
		font-size: 0.85em;
		transition: background 0.15s;

		&:hover {
			background: #f5f5f4;
		}
	}

	.dp-title {
		flex: 1;
		text-align: center;
		font-weight: 600;
		color: #0c0a09;
	}
}

.dp-week {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	margin-bottom: 4px;

	span {
		text-align: center;
		padding: 6px 0;
		font-size: 0.72rem;
		color: #9ca3af;

		&.we {
			color: #d6d3d1;
		}
	}
}

.dp-grid {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: 2px;

	.day {
		aspect-ratio: 1 / 1;
		display: grid;
		place-items: center;
		border: none;
		border-radius: 8px;
		background: transparent;
		color: #0c0a09;
		font: inherit;
		font-size: 0.9rem;
		cursor: pointer;
		transition: background 0.15s;

		&:hover {
			background: #f5f5f4;
		}
		&.out {
			color: #d1d5db;
		}
		&.today {
			background: #f3f4f6;
		}

		&::after {
			content: "";
			height: 3px;
			width: 0%;
			margin: 0;
			border-radius: 3px 3px 0 0;
			background: transparent;
			transition: 0.15s;
		}
		// selected wins over today — the dark square from the reference
		&.selected {
			color: #f9287f;

			&::after {
				width: 60%;
				background: #f42a7e;
			}
		}
	}
}

.dp-foot {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 10px;
	margin-top: 14px;

	button {
		padding: 10px;
		border-radius: 10px;
		font: inherit;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.15s;
	}

	.cancel {
		background: #ffffff;
		border: 1px solid #e8e6e5;
		color: #0c0a09;

		&:hover {
			background: #f5f5f4;
		}
	}

	.apply {
		background: #1c1917;
		border: 1px solid #1c1917;
		color: #ffffff;

		&:hover {
			background: #000000;
		}
	}
}

@media (prefers-reduced-motion: reduce) {
	.dp-trigger,
	.dp-head .nav,
	.dp-grid .day,
	.dp-foot button {
		transition: none;
	}
}
</style>
