<template>
	<div class="container">
		<section class="filters">
			<input
				v-for="(filter, n) in filters"
				:key="n"
				v-model="filter.value"
				placeholder="بحث..."
				@input="onSearch"
			/>

			<button class="btn" @click="filters.push({ value: '' })" title="أضف بحث جديد">
				<font-awesome-icon icon="fa-solid fa-magnifying-glass-plus" />
			</button>
		</section>

		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th v-for="column in columns" :key="column.en">{{ column.ar }}</th>
					</tr>
				</thead>
				<tbody>
					<client-only>
						<tr
							v-for="car in cars"
							:key="car._id"
							@click="$router.push('/manager/cars/' + car._id)"
						>
							<td v-for="column in columns" :key="column.en" :class="column.en">
								{{ car[column.en] || "-" }}
							</td>
						</tr>
					</client-only>
				</tbody>
			</table>
		</div>

		<nav class="pagination" v-if="pages > 1" aria-label="التنقل بين الصفحات">
			<button class="page-nav" @click="page--" :disabled="page < 2">
				<font-awesome-icon :icon="['fas', 'chevron-right']" />
				السابق
			</button>
			<span class="page-current" title="رقم الصفحه">{{ page }}</span>
			<button class="page-nav" @click="page++" :disabled="page >= pages">
				التالي
				<font-awesome-icon :icon="['fas', 'chevron-left']" />
			</button>
		</nav>

		<div class="per-page" v-if="total" title="عدد السيارات في الصفحة">
			<span>لكل صفحة</span>
			<select v-model.number="limit">
				<option :value="10">10</option>
				<option :value="20">20</option>
				<option :value="50">50</option>
				<option :value="100">100</option>
			</select>
		</div>
	</div>
</template>

<script>
export default {
	async asyncData({ $axios }) {
		// the server does the filtering + paging; the first page is loaded here
		const res = await $axios.$get(`/cars`, { params: { page: 1, limit: 20 } });

		return { cars: res.data, total: res.total, pages: res.pages };
	},
	props: ["socket"],
	middleware: "manager",
	head: () => ({ title: "السيارات" }),
	data() {
		return {
			limit: 20,
			page: 1,
			filters: [{ value: "" }],
			cars: [],
			total: 0,
			pages: 1,
			columns: [
				{ en: "vin_no", ar: "رقم الشاصى" },
				{ en: "car_id", ar: "رقم اللوحه" },
				{ en: "type", ar: "نوع السياره" },
				{ en: "payment", ar: "حالة السداد" },
				{ en: "cost", ar: "سعر التقرير" },
			],
		};
	},

	methods: {
		// pull the current page from the server with the active search terms
		async fetchCars() {
			const res = await this.$axios.$get("/cars", {
				params: {
					page: this.page,
					limit: this.limit,
					search: this.filters.map((f) => f.value).filter((v) => v && v.trim()),
				},
			});

			this.cars = res.data;
			this.total = res.total;
			this.pages = res.pages;
		},
		// debounce typing so we don't query on every keystroke
		onSearch() {
			clearTimeout(this._searchTimer);
			this._searchTimer = setTimeout(() => {
				if (this.page !== 1) this.page = 1; // the watcher refetches
				else this.fetchCars();
			}, 300);
		},
	},
	watch: {
		page() {
			this.fetchCars();
		},
		// a new page size starts from the first page
		limit() {
			if (this.page !== 1) this.page = 1; // the watcher refetches
			else this.fetchCars();
		},
	},
	mounted() {
		this.socket.on("update-database", () => this.fetchCars());
	},
};
</script>

<style lang="scss" scoped>
thead tr th {
	width: calc(100% / 3);
}

.cost {
	color: #3a78d7;
}

.per-page {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	margin-top: 1.5em;
	font-size: 0.9em;
	color: #555;

	select {
		padding: 8px 10px;
		border: 1px solid #e3e3ea;
		border-radius: 8px;
		background: #fff;
		font: inherit;
		cursor: pointer;
	}
}

.pagination {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;
	margin-top: 1.5em;

	.page-nav {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 9px 18px;
		border: 1px solid #e3e3ea;
		border-radius: 9999px;
		background: #fff;
		color: #333;
		font: inherit;
		cursor: pointer;
		transition: 0.15s;

		svg {
			font-size: 0.8em;
			color: #999;
		}

		&:hover:not(:disabled) {
			border-color: #3ba6f1;
			color: #3ba6f1;

			svg {
				color: #3ba6f1;
			}
		}

		&:disabled {
			opacity: 0.45;
			cursor: not-allowed;
		}
	}

	.page-current {
		min-width: 40px;
		height: 40px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0 14px;
		border-radius: 9999px;
		background: #1c1917;
		color: #fff;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}
}
</style>
