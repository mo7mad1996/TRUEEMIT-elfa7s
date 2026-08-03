<template>
	<div class="flex gap-2">
		<button
			:disabled="attaching"
			@click="attachToServer"
			class="btn !bg-purple-600 hover:!bg-purple-500 !border-purple-600 font-light"
		>
			<Loader v-show="attaching" />

			<div v-show="!attaching">
				ارفاق الى السيرفر
				<font-awesome-icon :icon="['fas', 'cloud-arrow-up']" />
			</div>
		</button>

		<transition name="fade">
			<button
				v-if="serverId"
				:disabled="detaching"
				@click="deleteFromServer"
				class="btn !bg-red-700 hover:!bg-red-600 !border-red-700 font-light"
			>
				<Loader v-show="detaching" />

				<div v-show="!detaching">
					حذف من السيرفر
					<font-awesome-icon :icon="['fas', 'cloud-arrow-down']" />
				</div>
			</button>
		</transition>
	</div>
</template>

<script>
import { mapActions } from "vuex";

export default {
	props: ["car"],
	data: () => ({ attaching: false, detaching: false, localServerId: null }),
	computed: {
		// local state wins so the delete button appears / disappears
		// immediately after attaching or detaching
		serverId() {
			return this.localServerId !== null ? this.localServerId : this.car?.server_id || "";
		},
	},
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

			if (!this.car?._id) return this.setAlert({ text: "احفظ السيارة أولاً", error: true });

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
				computer_pdf: c.computer_pdf || "",
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
				videos: (c.videos || []).map((v) => ({
					video: v.video || "",
					description: v.description || "",
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
				this.$set(this.car, "server_id", serverId);
				this.localServerId = serverId;
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

			if (!this.serverId) return;

			this.detaching = true;
			try {
				await this.$axios.$delete(`https://trueemit-api.vercel.app/cars/${this.serverId}`, {
					headers: { "x-api-key": apiKey },
				});

				// clear the stored server id locally
				this.$set(this.car, "server_id", "");
				this.localServerId = "";
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
	},
};
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.25s, transform 0.25s;
}

.fade-enter,
.fade-leave-to {
	opacity: 0;
	transform: scale(0.9);
}
</style>
