<template>
	<div class="page">
		<PrintHeader :car="car" :lang="lang" />
		<div>
			<div class="page1">
				<div class="flex gap-0.5">
					<main class="flex-1 max-w-1/2">
						<h4 class="text-center">
							<template v-if="['exclusive'].includes(viewJob)"> </template>
							<template v-else>
								<font-awesome-icon :icon="['fas', 'car-on']" />
								<span v-if="lang == 'en'">Body </span>
								<span v-else> فحص البودي </span>
							</template>
						</h4>
						<table class="w-full">
							<thead>
								<th>
									<h4 v-if="['exclusive'].includes(viewJob)" class="text-zinc-700 flex gap-3">
										<font-awesome-icon :icon="['fas', 'car-on']" />

										<div>فحص البودي</div>

										<div>Body</div>
									</h4>
								</th>
								<th class="text-zinc-700 flex gap-3">
									<template v-if="['exclusive'].includes(viewJob)">
										<div>الحالة</div>

										<div>Condition</div>
									</template>
									<template v-else>
										<span v-if="lang == 'ar'">الحالة</span>
										<span v-else>Condition</span>
									</template>
								</th>
							</thead>

							<tbody>
								<tr
									v-for="(input, v) in $inputs"
									:key="v"
									class="row text-gray-700 odd:bg-neutral-200 odd:!text-neutral-900"
									:class="
										valueOf(input.en) ? (isGood(input.en) ? '!bg-green-50' : '!bg-red-50') : ''
									"
								>
									<td
										v-if="['exclusive'].includes(viewJob)"
										class="text-gray-400 odd:!text-neutral-900"
									>
										<div
											:class="isGood(input.en) ? 'text-green-600' : 'text-red-600'"
											class="flex justify-between"
										>
											<span> {{ input.ar }} </span>

											<span> {{ input.lang_en }} </span>
										</div>
									</td>

									<td
										class="pr-1"
										:class="isGood(input.en) ? 'text-green-600' : 'text-red-600'"
										v-else
									>
										<div v-if="lang == 'ar'">{{ input.ar }}</div>
										<div v-else>{{ input.lang_en }}</div>
									</td>

									<td
										class="text-center p-0.5 my-1 text-sm"
										:class="
											valueOf(input.en)
												? isGood(input.en)
													? 'text-green-600'
													: 'text-red-600'
												: ''
										"
									>
										<template v-if="valueOf(input.en)">
											<template v-if="['exclusive'].includes(viewJob)">
												{{ valueOf(input.en).ar }}
											</template>
											<template v-else>
												{{ valueOf(input.en)[lang] }}
											</template>
										</template>
									</td>
								</tr>
							</tbody>
						</table>

						<!-- <h6 class="text-xs opacity-60 p-1">
							<template v-if="['exclusive'].includes(viewJob)">
								<div>الفايبر + الصدامات خارج الفحص</div>
								<span class="dir-ltr"> Fiber and bumpers are excluded from inspection </span>
							</template>
							<template v-else>
								<span v-if="lang == 'en'"> Fiber and bumpers are excluded from inspection. </span>
								<span v-else> الفايبر + الصدامات خارج الفحص </span>
							</template>
						</h6> -->

						<fieldset v-if="car.body.note">
							<legend v-if="['exclusive'].includes(viewJob)">
								<h4 class="flex justify-between items-center px-1 text-zinc-700 text-sm">
									<span> ملاحظه</span>
									<font-awesome-icon :icon="['fas', 'clipboard']" />

									<span>Notes</span>
								</h4>
							</legend>
							<legend v-else>
								<font-awesome-icon :icon="['fas', 'clipboard']" />

								<span v-if="lang == 'ar'"> ملاحظه </span>
								<span v-else>Notes</span>
							</legend>

							<div class="lines" v-html="$nltobr(car.body.note)"></div>
						</fieldset>
					</main>

					<div class="line"></div>

					<aside class="flex-1">
						<template v-if="['exclusive'].includes(viewJob)">
							<h4 class="flex justify-between items-center px-1 text-zinc-700 text-sm">
								<span> الرسم التوضيحي </span>
								<font-awesome-icon :icon="['fas', 'compass-drafting']" />
								<span>Clarification</span>
							</h4>
						</template>
						<template v-else>
							<h4 class="text-center text-zinc-700 text-sm">
								<font-awesome-icon :icon="['fas', 'compass-drafting']" />
								<span v-if="lang == 'ar'"> الرسم التوضيحي </span>
								<span v-else>Clarification</span>
							</h4>
						</template>
						<Images :car="car" :lang="lang" />
					</aside>
				</div>

				<footer>
					<h4 v-if="['exclusive'].includes(viewJob)">
						<font-awesome-icon :icon="['fas', 'toolbox']" />
						<span> فحص الشاصى </span>
						<span>(Chassis)</span>
					</h4>
					<h4 v-else>
						<font-awesome-icon :icon="['fas', 'toolbox']" />
						<span v-if="lang == 'ar'"> فحص الشاصى </span>
						<span v-else>Chassis</span>
					</h4>

					<div class="lines" v-html="$nltobr(car.chassis)" v-if="car.chassis"></div>
				</footer>
			</div>
		</div>

		<PrintFooter />
	</div>
</template>

<script>
import Images from "@/components/engineer/images.vue";
import PrintHeader from "@/components/print/header";
import PrintFooter from "@/components/print/footer";

export default {
	name: "Page1",
	props: ["car", "lang"],
	data() {
		return {
			values: [
				{ ar: "سليم", en: "In Good Condition" },
				{ ar: "معدل", en: "Repaired" },
				{ ar: "مرشوش", en: "Repainted" },
				{ ar: "مغير ومرشوش", en: "Replaced  Repainted" },
				{ ar: "رش ومعجون", en: "Repainted  Filled" },
			],
		};
	},
	methods: {
		valueOf(key) {
			const v = this.car.body[key];
			if (v === null || v === undefined || v === "") return null;
			return this.values[Number(v)] || null;
		},
		// "سليم" is the first entry in values, anything else means the part is not intact
		isGood(key) {
			const v = this.car.body[key];
			if (v === null || v === undefined || v === "") return false;
			return Number(v) === 0;
		},
	},
	components: { PrintHeader, PrintFooter, Images },
};
</script>

<style lang="scss" scoped>
main {
	display: flex;
	flex-direction: column;

	table {
		width: 100%;
		font-size: 16px;

		// keep the row background (سليم / غير سليم) when the report is printed
		tr.row {
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}

		td {
			position: relative;

			&.blue {
				color: #000;
			}

			&:first-of-type {
				white-space: nowrap;
				font-size: 0.7em;
			}
		}
	}
	h6 {
		margin: 0;
		text-align: center;
		color: #000;
	}
	fieldset {
		border-radius: 5px;
		font-size: 0.7em;
		margin: 0.6em 0;
		padding: 0 1em;
		flex: 1;

		legend {
			padding: 0 0.5em;
			font-size: 1.3em;
			color: #000;
		}

		p {
			margin: 0;
		}
	}
}

aside {
	position: relative;
	box-sizing: border-box;
}

.line {
	border-left: 1px solid #000;
}

footer {
	grid-row-start: 2;
	grid-row-end: 3;
	grid-column-start: 1;
	grid-column-end: 3;
	border-top: 1px solid #000;
}

.page1 {
	display: flex;
	flex-direction: column;
	height: 100%;
	gap: 0;
	margin: 0;

	.flex {
		display: flex;
	}

	.text-bt {
		writing-mode: sideways-lr;
	}
}
</style>
