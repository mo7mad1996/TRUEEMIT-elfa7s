<template>
	<div v-if="car">
		<EngineerHeader :car="car" />
		<FirstPage :car="car" v-if="car?.service != 'محركات'" />
		<secondPage :car="car" />
		<Files :car="car" />
		<Sections :car="car" />

		<div class="container sticky bottom-4 flex gap-4 justify-center">
			<button :disabled="loading" @click="save" class="btn d-block bg-green-600">
				<Loader v-show="loading" />

				<div v-show="!loading">
					<span v-if="!car.updated && car.saved">
						طباعه
						<font-awesome-icon :icon="['fas', 'print']" />
					</span>

					<span v-else>
						حفظ
						<font-awesome-icon :icon="['fas', 'floppy-disk']" />
					</span>
				</div>
			</button>
			<button
				:disabled="attaching"
				@click="attachToServer"
				class="btn d-block !bg-purple-600 !border-purple-600"
			>
				<Loader v-show="attaching" />

				<div v-show="!attaching">
					ارفاق الى السيرفر
					<font-awesome-icon :icon="['fas', 'cloud-arrow-up']" />
				</div>
			</button>

			<button
				v-if="car.server_id"
				:disabled="detaching"
				@click="deleteFromServer"
				class="btn d-block red"
			>
				<Loader v-show="detaching" />

				<div v-show="!detaching">
					حذف من السيرفر
					<font-awesome-icon :icon="['fas', 'cloud-arrow-down']" />
				</div>
			</button>

			<button
				v-if="car.saved || !car.updated"
				@click="$router.push('/exclusive')"
				class="btn d-block red"
			>
				رجوع
				<font-awesome-icon :icon="['fas', 'arrow-left']" />
			</button>
		</div>
	</div>
	<div v-else class="text-center font-bold pt-12">جاري تحميل بيانات السيارة</div>
</template>

<script>
import EngineerHeader from "@/components/engineer/header";
import SecondPage from "@/components/engineer/SecondPage";
import FirstPage from "@/components/engineer/First_page";
import Files from "@/components/engineer/Files";
import Sections from "@/components/engineer/Sections";

import { mapActions } from "vuex";
let skipCheck = true;

export default {
	middleware: "exclusive",
	props: ["cars", "socket", "updateCars"],
	head: () => ({ title: " فحص السياره" }),
	data: () => ({ car: null, loading: false, attaching: false, detaching: false }),
	methods: {
		...mapActions({ setAlert: "alert/add" }),

		async attachToServer() {
			if (this.attaching) return;

			const apiKey = this.$auth.user.api_key;
			if (!apiKey)
				return this.setAlert({
					text: "أضف مفتاح الـ API من الإعدادات أولاً",
					error: true,
				});

			if (!this.car.saved) return this.setAlert({ text: "احفظ السيارة أولاً", error: true });

			const c = this.car;
			const payload = {
				local_Id: this.$route.params.id,
				date: c.date || new Date().toISOString(),
				type: c.type || "",
				car_id: c.car_id || "",
				vin_no: c.vin_no || "",
				engine: c.engine || "",
				gear: c.gear || "",
				fuel: c.fuel || "",
				model: c.model || "",
				service: c.service || "",
				odometer: c.odometer || "",
				mechanical: c.mechanical || "",
				computer: c.computer || "",
				ground: c.ground || "",
				body: {
					hood: c.body?.hood || 0,
					fender_f_r: c.body?.fender_f_r || 0,
					door_f_r: c.body?.door_f_r || 0,
					door_b_r: c.body?.door_b_r || 0,
					fender_b_r: c.body?.fender_b_r || 0,
					fender_f_l: c.body?.fender_f_l || 0,
					door_f_l: c.body?.door_f_l || 0,
					door_b_l: c.body?.door_b_l || 0,
					fender_b_l: c.body?.fender_b_l || 0,
					fish_r: c.body?.fish_r || 0,
					fish_l: c.body?.fish_l || 0,
					stand_r: c.body?.stand_r || 0,
					stand_l: c.body?.stand_l || 0,
					trunk: c.body?.trunk || 0,
					pillar_r: c.body?.pillar_r || 0,
					pillar_l: c.body?.pillar_l || 0,
					truck_door: c.body?.truck_door || 0,
					roof: c.body?.roof || 0,
					note: c.body?.note || "",
				},
				chassis: c.chassis || "",
				accessories: c.accessories || "",
				representative: c.representative || "",
				payment: c.payment || "",
				cost: c.cost || 0,
				cost_disabled: c.cost_disabled || false,
				is_payed: c.is_payed || false,
				images: (c.images || []).map((i) => ({
					image: i.image || "",
					description: i.description || "",
				})),
				car_images: (c.car_images || []).map((i) => ({
					image: i.image || "",
					description: i.description || "",
				})),
				sections: (c.sections || []).map((s) => ({
					title: s.title || "",
					title_en: s.title_en || "",
					items: (s.items || []).map((it) => ({
						name: it.name || "",
						name_en: it.name_en || "",
						image: it.image || "",
						description: it.description || "",
					})),
				})),
			};

			this.attaching = true;
			try {
				const res = await this.$axios.$put("https://trueemit-api.vercel.app/cars", payload, {
					headers: { "x-api-key": apiKey },
				});

				const serverId = res?.id || res?._id || res?.server_id || res?.data?.id;

				if (!serverId) throw new Error("لم يتم استلام معرف من السيرفر");

				// persist the returned server id on the local car
				this.car.server_id = serverId;
				await this.$axios.$post("/cars-exclusive/update", this.car);

				this.setAlert({ text: "تم الإرفاق الى السيرفر" });
			} catch (err) {
				this.setAlert({
					text: err.response?.data?.message || err.message || "فشل الإرفاق الى السيرفر",
					error: true,
				});
				console.error(err);
			} finally {
				this.attaching = false;
			}
		},

		async deleteFromServer() {
			if (this.detaching) return;

			const apiKey = this.$auth.user.api_key;
			if (!apiKey)
				return this.setAlert({
					text: "أضف مفتاح الـ API من الإعدادات أولاً",
					error: true,
				});

			if (!this.car.server_id) return;

			this.detaching = true;
			try {
				await this.$axios.$delete(`https://trueemit-api.vercel.app/cars/${this.car.server_id}`, {
					headers: { "x-api-key": apiKey },
				});

				// clear the stored server id locally
				this.car.server_id = "";
				await this.$axios.$post("/cars-exclusive/update", this.car);

				this.setAlert({ text: "تم الحذف من السيرفر" });
			} catch (err) {
				this.setAlert({
					text: err.response?.data?.message || err.message || "فشل الحذف من السيرفر",
					error: true,
				});
				console.error(err);
			} finally {
				this.detaching = false;
			}
		},

		update() {
			if (!skipCheck) this.car.updated = true;
			skipCheck = false;
		},

		save() {
			if (!this.car.payment || !this.car.cost) {
				window.scrollTo({ top: 0, behavior: "smooth" });
				return this.setAlert({ text: "تاكد من بيانات الدفع", error: true });
			}

			// print
			if (!this.car.updated && this.car.saved)
				return open("/print/" + this.$route.params.id + "?pdf");

			// remove client
			if (this.car.payment !== "أجل") delete this.car.client;

			// check about the payment and client
			if (this.car.payment == "أجل" && this.car.client == undefined)
				return this.setAlert({ text: "يجب اضافة عميل", error: true });

			// update the car with cost_disabled => false
			this.car.cost_disabled = true;

			this.loading = true;
			let url = "/cars-exclusive/update";
			if (!this.car.saved) url = "/cars-exclusive/save";

			this.$axios
				.$post(url, this.car)
				.then((res) => {
					this.car.saved = true;
					this.car.updated = false;
					skipCheck = true;

					this.setAlert({ text: "تم الحفظ" });

					// socket
					// this.socket.emit("save-car");
				})
				.catch((err) => console.error(err))
				.finally(() => (this.loading = false));
		},

		getCar() {
			// wait if no cars
			if (!this.cars) return;
			if (!this.cars.length) return this.$router.push("/");

			this.car = this.cars.filter((car) => car._id == this.$route.params.id)[0];

			// if no car go home
			if (!this.car) this.$router.push("/");

			// if no sections
			const sections = this.$auth.user.sections.map((s) => ({
				...s,
				items: s.items.map((i) => ({ ...i, description: "", image: "" })),
			}));

			if (this.car.sections.length == 0) this.car.sections = sections;
		},
	},
	mounted() {
		this.getCar();

		if (this.car) this.socket.emit("join-room", this.car._id);

		// socket
		this.socket.on("delete-car", () => this.setAlert({ text: "شخص ما حذف السيارة", error: true }));
	},

	watch: {
		cars() {
			this.getCar();
		},
		car: {
			handler(c, l) {
				if (l) this.update();
			},
			deep: true,
		},
	},

	components: {
		EngineerHeader,
		SecondPage,
		FirstPage,
		Files,
		Sections,
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

.fixed {
	position: fixed;
	padding: 2em;
	top: 0;
	backdrop-filter: blur(5px);
}
</style>
