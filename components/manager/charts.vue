<template>
	<client-only>
		<div id="charts">
			<div class="intro">
				<div class="cash">
					<div class="table-container">
						<table>
							<thead>
								<td></td>
								<td v-for="(a, n) in labels.map((e) => e || 'غير معروف')" :key="n">
									{{ a }}
								</td>

								<td>سداد أجل</td>
							</thead>
							<tbody>
								<tr>
									<td>عدد المعاملات</td>
									<td v-for="(a, n) in labels" :key="n">
										{{ cars(a).length }}
									</td>
									<td>{{ pays.length }}</td>
								</tr>

								<tr>
									<td>اجمالي</td>
									<td v-for="(a, n) in labels" :key="n">
										{{
											cars(a)
												.reduce((a, b) => a + b.cost, 0)
												.toFixed(2)
										}}
									</td>
									<td>
										{{ pays.reduce((a, b) => a - b.value, 0).toFixed(2) }}
									</td>
								</tr>
								<tr border="1">
									<td>اجمالي إيرادات</td>
									<td colspan="5">
										{{
											(
												data.reduce((a, b) => (b.payment == "أجل" ? a : a + b.cost), 0) +
												pays.reduce((a, b) => a - b.value, 0)
											).toFixed(2)
										}}
										<sub>ج.م</sub>
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<h4 class="text-center gray">متابعة عمليات الحسابات والحركه الماليه للمعاملات</h4>
				</div>

				<div class="donut">
					<ApexCharts type="donut" height="300" :options="clirleOptions" :series="circleSeries" />
					<h4 class="text-center text-xs gray">متابعة طرق الدفع للمعاملات</h4>
				</div>
			</div>
			<div class="lines">
				<ApexCharts :options="options" :series="series" :height="320" />
			</div>
		</div>
	</client-only>
</template>

<script>
export default {
	props: {
		x: { default: () => [] },
		y: { default: () => [] },
		data: { default: () => [] },
		time: { default: null },
		// client payments belong to the shop, not to a single exclusive company —
		// the exclusive report turns them off so revenue is not counted twice
		pays_enabled: { type: Boolean, default: true },
	},
	name: "Charts",
	data: () => ({
		labels: ["أجل", "كاش", "شبكة", ""],
		// Seline palette — one cyan accent on warm neutrals (see DESIGN.md)
		palette: ["#3ba6f1", "#1c1917", "#a8a29e", "#d6d3d1"],
		pays: [],
	}),
	computed: {
		options() {
			return {
				dir: "rtl",
				defaultLocale: "ar",
				colors: ["#3ba6f1"],
				chart: {
					toolbar: { show: true },
					type: "area",
					fontFamily: "Alexandria",
					foreColor: "#78716c",
				},
				dataLabels: {
					enabled: true,
					// hide the noisy zero labels — keep only the real peaks
					formatter: (val) => (val ? val : ""),
					offsetY: -6,
					style: {
						fontSize: "11px",
						fontWeight: 400,
						fontFamily: "Alexandria",
						colors: ["#1c1917"],
					},
					background: { enabled: false },
				},
				stroke: { curve: "smooth", width: 2 },
				fill: {
					type: "gradient",
					gradient: {
						shadeIntensity: 0.2,
						opacityFrom: 0.35,
						opacityTo: 0.03,
						stops: [0, 100],
					},
				},
				markers: {
					size: 0,
					colors: ["#3ba6f1"],
					strokeColors: "#ffffff",
					hover: { size: 5 },
				},
				xaxis: {
					type: "datetime",
					categories: this.y,
					axisBorder: { show: false },
					axisTicks: { color: "#e8e6e5" },
					labels: {
						datetimeUTC: false,
						style: {
							colors: "#78716c",
							fontSize: "12px",
							fontFamily: "Alexandria",
						},
					},
				},
				yaxis: {
					labels: {
						style: {
							colors: "#a8a29e",
							fontSize: "12px",
							fontFamily: "Alexandria",
						},
					},
				},
				legend: { show: false },
				tooltip: { theme: "light" },
				grid: {
					borderColor: "#e8e6e5",
					strokeDashArray: 4,
					xaxis: { lines: { show: false } },
				},
			};
		},
		series() {
			return [
				{
					name: ".   سياره  .",
					data: this.x,
				},
			];
		},

		// circle
		circleSeries() {
			return this.labels.map((e) => this.data.filter((el) => el.payment == e).length);
		},
		clirleOptions() {
			return {
				labels: this.labels.map((el) => el || "غير معروف"),
				colors: this.palette,
				stroke: { colors: ["#ffffff"], width: 2 },
				dataLabels: { style: { fontFamily: "Alexandria" } },
				plotOptions: {
					pie: {
						offsetX: -30,
						customScale: 1,
						donut: {
							size: "60%",
							labels: {
								show: true,
								total: {
									show: true,
									label: "الإجمالي",
								},
							},
						},
					},
				},
				legend: {
					fontSize: "14px", // حجم الخط
					fontFamily: "Alexandria",
					labels: { colors: "#78716c" },
					itemMargin: { horizontal: 6 },
				},
			};
		},
	},
	methods: {
		cars(payment) {
			return this.data.filter((e) => e.payment == payment);
		},
		generate_a_new_pay() {
			const length = this.y.length;

			if (length) {
				const one_day = 1000 * 60 * 60 * 24;
				const [start, end] = [this.y[length - 1], this.y[0] + one_day];

				this.$axios.$get(`/clients/custom_pays/${start}/${end}`).then((r) => (this.pays = r));
			}
		},
		init() {
			if (!this.pays_enabled) return (this.pays = []);

			if (this.time) this.$axios.$get("/clients/pays/" + this.time).then((r) => (this.pays = r));
			else this.generate_a_new_pay();
		},
	},
	watch: {
		data() {
			this.init();
		},
	},
	mounted() {
		this.init();
	},
};
</script>

<style lang="scss" scoped>
#charts {
	display: flex;
	flex-direction: column;
	gap: 1em;
	margin-block-end: 10vh;

	.intro {
		display: flex;
		gap: 1em;

		.cash {
			flex: 1;
		}
	}
	.lines {
		direction: ltr;
	}

	.cash,
	.lines,
	.donut {
		padding: 1em;
		border-radius: 10px;
		background: #ffffff;
		border: 1px solid #e8e6e5;
		box-shadow: rgba(0, 0, 0, 0.05) 0px 4px 16px 0px;
	}

	.donut {
		direction: ltr;
		width: 100%;
		max-width: 520px;
		align-self: flex-end;
	}

	.gray {
		color: #78716c;
	}
}
</style>
