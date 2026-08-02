<template>
	<div v-if="car">
		<EngineerHeader :car="car" />
		<FirstPage :car="car" v-if="car.service != 'محركات'" />
		<secondPage :car="car" />
		<Files :car="car" />
		<Videos :car="car" />
		<Sections :car="car" />

		<div class="container sticky bottom-4 flex gap-4 justify-center">
			<button :disabled="loading" @click="save" class="btn d-block bg-green-600">
				<Loader v-show="loading" />

				<div v-show="!loading">
					<span v-if="!dirty">
						طباعه
						<font-awesome-icon :icon="['fas', 'print']" />
					</span>

					<span v-else>
						حفظ
						<font-awesome-icon :icon="['fas', 'floppy-disk']" />
					</span>
				</div>
			</button>

			<button @click="$router.push(back)" class="btn d-block red">
				رجوع
				<font-awesome-icon :icon="['fas', 'arrow-left']" />
			</button>
		</div>
	</div>
</template>

<script>
import EngineerHeader from "@/components/engineer/header";
import SecondPage from "@/components/engineer/SecondPage";
import FirstPage from "@/components/engineer/First_page";
import Files from "@/components/engineer/Files";
import Videos from "@/components/engineer/Videos";
import Sections from "@/components/engineer/Sections";

import { mapActions } from "vuex";

export default {
	async asyncData({ params, $axios, error }) {
		try {
			const car = await $axios.$get("/cars-exclusive/" + params.id);
			return { car };
		} catch (err) {
			return error({ statusCode: 404, message: "السياره غير موجوده" });
		}
	},
	middleware: "manager",
	head() {
		return { title: this.car?.car_id || "فحص السياره" };
	},
	data: () => ({ car: null, loading: false, dirty: false }),
	components: {
		EngineerHeader,
		SecondPage,
		FirstPage,
		Files,
		Videos,
		Sections,
	},
	computed: {
		// back to the car list of the company that owns this report
		back() {
			return "/manager/exclusive/" + (this.car?.user?._id || "none");
		},
	},
	methods: {
		...mapActions({ setAlert: "alert/add" }),

		save() {
			// nothing changed — show the report instead
			if (!this.dirty) return open(`/print/${this.$route.params.id}?pdf&as=exclusive`);

			if (!this.car.payment || !this.car.cost) {
				window.scrollTo({ top: 0, behavior: "smooth" });
				return this.setAlert({ text: "تاكد من بيانات الدفع", error: true });
			}

			// remove client
			if (this.car.payment !== "أجل") delete this.car.client;

			// check about the payment and client
			if (this.car.payment == "أجل" && this.car.client == undefined)
				return this.setAlert({ text: "يجب اضافة عميل", error: true });

			this.loading = true;

			this.$axios
				.$post("/cars-exclusive/update", this.car)
				.then(() => {
					this.dirty = false;
					this.setAlert({ text: "تم الحفظ" });
				})
				.catch((err) => {
					console.error(err);
					this.setAlert({ text: "تعذر حفظ السياره", error: true });
				})
				.finally(() => (this.loading = false));
		},
	},
	mounted() {
		// the company sections are the template of the report — fill them in
		// when this car was saved before the company had any
		if (this.car && !this.car.sections?.length)
			this.car.sections = (this.car.user?.sections || []).map((s) => ({
				...s,
				items: s.items.map((i) => ({ ...i, description: "", image: "" })),
			}));

		this.$nextTick(() => (this.dirty = false));
	},
	watch: {
		car: {
			handler(car, old) {
				if (old) this.dirty = true;
			},
			deep: true,
		},
	},
};
</script>

<style lang="scss" scoped>
.red {
	background: rgb(186, 38, 38);

	&:hover,
	&:focus {
		background: rgb(227, 48, 48);
	}
}
</style>
