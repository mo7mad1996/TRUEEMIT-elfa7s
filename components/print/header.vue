<template>
	<header>
		<div class="top">
			<div>
				<template v-if="$auth.user.job != 'exclusive'">
					<div v-if="car.payment">
						حالة السداد : {{ car.payment == "أجل" ? "اخرى" : car.payment }}.
					</div>
					<div v-if="car.cost" class="mt-2">
						تكلفة التقرير :
						{{
							new Intl.NumberFormat("ar-SA", {
								style: "currency",
								currency: "SAR",
							}).format(car.cost)
						}}
					</div>
				</template>
				<div v-else>
					<img
						v-if="$auth.user.logo"
						:src="$auth.user.logo"
						class="h-28 mx-auto mb-5 object-contain block"
					/>
				</div>
			</div>
			<div>
				<img :src="$shop.logo" class="logo" />
			</div>
			<div class="date_time">
				<span class="time">
					{{ $moment(new Date(car.date)).locale("En").format("h:mma") }}
				</span>
				<span class="date">
					{{ $moment(new Date(car.date)).locale("En").format("DD/MM/YYYY") }}
				</span>

				<div class="text-center cr" v-if="$shop.cr">
					س . ت:
					{{ $shop.cr }}
				</div>
			</div>
		</div>
		<div class="bottom">
			<div class="item">
				<label>
					<template v-if="['exclusive'].includes($auth.user.job)">
						<div>نوع السياره</div>
						<div>Type of car</div>
					</template>
					<template v-else>
						<span v-if="lang == 'ar'"> نوع السياره </span>
						<span v-else> Type of car</span>
						<font-awesome-icon :icon="['fas', 'car-side']" />
					</template>
				</label>

				<div class="value">{{ car.type || "-" }}</div>
			</div>

			<div class="item">
				<label>
					<template v-if="['exclusive'].includes($auth.user.job)">
						<div>رقم اللوحه</div>
						<div>Plate number</div>
					</template>
					<template v-else>
						<span v-if="lang == 'ar'"> رقم اللوحه</span>
						<span v-else> Plate number</span>

						<font-awesome-icon :icon="['fas', 'passport']" />
					</template>
				</label>

				<div class="value">{{ car.car_id || "-" }}</div>
			</div>
			<div class="item" v-if="['exclusive'].includes($auth.user.job)">
				<label>
					<template>
						<div>السلندرات</div>
						<div>Engine capacity</div>
					</template>
				</label>

				<div class="value">{{ car.engine || "-" }}</div>
			</div>

			<div class="item" v-if="['exclusive'].includes($auth.user.job)">
				<label>
					<template>
						<div>تاريخ الصنع</div>
						<div>Model</div>
					</template>
				</label>

				<div class="value">{{ car.model || "-" }}</div>
			</div>

			<div class="item" v-if="['exclusive'].includes($auth.user.job)">
				<label>
					<template>
						<div>نوع القير</div>
						<div>Gear Type</div>
					</template>
				</label>

				<div class="value">{{ car.gear || "-" }}</div>
			</div>

			<div class="item">
				<label>
					<template v-if="['exclusive'].includes($auth.user.job)">
						<div>رقم الشاصى</div>
						<div>Chassis number</div>
					</template>
					<template v-else>
						<span v-if="lang == 'ar'"> رقم الشاصى </span>
						<span v-else> Chassis number </span>

						<font-awesome-icon :icon="['fas', 'car']" />
					</template>
				</label>

				<div class="value">{{ car.vin_no || "-" }}</div>
			</div>

			<div class="item">
				<label>
					<template v-if="['exclusive'].includes($auth.user.job)">
						<div>قراءة العداد</div>
						<div>Meter reading</div>
					</template>
					<template v-else>
						<span v-if="lang == 'ar'"> قراءة العداد</span>
						<span v-else> Meter reading </span>

						<font-awesome-icon :icon="['fas', 'gauge-high']" />
					</template>
				</label>

				<div class="value">{{ car.odometer || "-" }}</div>
			</div>

			<div class="item">
				<label>
					<template v-if="['exclusive'].includes($auth.user.job)">
						<div>الخدمة المقدمه</div>
						<div>Service provided</div>
					</template>
					<template v-else>
						<span v-if="lang == 'ar'"> الخدمة المقدمه </span>
						<span v-else> Service provided </span>

						<font-awesome-icon :icon="['fas', 'bell-concierge']" />
					</template>
				</label>

				<div class="value">{{ car.service || "-" }}</div>
			</div>
		</div>
	</header>
</template>

<script>
import BarCode from "@/components/engineer/barcode";

export default {
	name: "PrintHeader",
	props: ["car", "lang"],
	components: { BarCode },
};
</script>

<style lang="scss" scoped>
header {
	@media print {
		display: table-header-group;
		width: 100%;
	}

	.top {
		display: flex;

		> div {
			flex: 1;

			&.date_time {
				display: flex;
				gap: 0.1em;
				flex-direction: column;
				text-align: center;

				.time {
					font-size: 1.2em;
					text-transform: uppercase;
					color: #000;
				}
				.date {
					font-size: 0.86em;
				}
			}

			.logo {
				height: 120px;
				margin: 0 auto 20px;
				display: block;
			}
		}
	}

	.bottom {
		display: flex;
		border: 1px solid #000;

		.item {
			flex: 1;
			display: flex;
			text-align: center;
			flex-direction: column;
			justify-content: space-between;
			border: 1px solid #000;
			padding: 5px 0;
			gap: 5px;

			label {
				font-size: 0.7em;

				color: #000;
			}

			.value {
				color: var(--color-blue-3);
			}
		}
	}

	.cr {
		margin: 2em 0;
		font-size: 0.8em;
	}
}
</style>
