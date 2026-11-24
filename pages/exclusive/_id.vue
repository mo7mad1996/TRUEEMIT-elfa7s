<template>
	<div v-if="car">
		<div
			v-if="requiresVideo"
			class="required-video-overlay"
			role="dialog"
			aria-modal="true"
			aria-labelledby="required-video-title"
			@keydown.tab.prevent
		>
			<div class="required-video-dialog">
				<h2 id="required-video-title" class="text-xl font-bold">إضافة فيديو السيارة</h2>
				<p>يجب رفع فيديو للسيارة قبل المتابعة.</p>
				<FileDropAble
					ref="requiredVideoUpload"
					:id="car._id"
					kind="video"
					:single="true"
					:video-only="true"
					accept="video/*"
					loading-text="جاري رفع الفيديو..."
					@input="addRequiredVideo"
				/>
			</div>
		</div>

		<template v-else>
			<EngineerHeader :car="car" />
			<FirstPage :car="car" v-if="car?.service != 'محركات'" />
			<secondPage :car="car" />
			<Files :car="car" />
			<Videos :car="car" />
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
					v-if="car.saved || !car.updated"
					@click="$router.push('/exclusive')"
					class="btn d-block red"
				>
					رجوع
					<font-awesome-icon :icon="['fas', 'arrow-left']" />
				</button>
			</div>
		</template>
	</div>
	<div v-else-if="notFound" class="container text-center pt-12 flex flex-col items-center gap-4">
		<p class="font-bold">لم يتم العثور على السيارة</p>

		<button @click="$router.push('/exclusive/cars')" class="btn d-block red">
			السيارات
			<font-awesome-icon :icon="['fas', 'arrow-left']" />
		</button>
	</div>
	<div v-else class="text-center font-bold pt-12">جاري تحميل بيانات السيارة</div>
</template>

<script>
import EngineerHeader from "@/components/engineer/header";
import SecondPage from "@/components/engineer/SecondPage";
import FirstPage from "@/components/engineer/First_page";
import Files from "@/components/engineer/Files";
import Videos from "@/components/engineer/Videos";
import Sections from "@/components/engineer/Sections";

import { mapActions } from "vuex";
let skipCheck = true;

export default {
	middleware: "exclusive",
	props: ["cars", "socket", "updateCars"],
	head: () => ({ title: " فحص السياره" }),
	data: () => ({
		car: null,
		loading: false,
		notFound: false,
		fetching: false,
		triedDB: false,
	}),
	computed: {
		requiresVideo() {
			return Boolean(
				this.car &&
					!this.car.saved &&
					!(this.car.videos || []).some(
						(item) => item && typeof item.video === "string" && item.video.trim(),
					),
			);
		},
	},
	beforeRouteLeave(to, from, next) {
		this.checkVideoBeforeLeaving(next);
	},
	beforeRouteUpdate(to, from, next) {
		if (to.params.id === from.params.id) return next();
		this.checkVideoBeforeLeaving(next);
	},
	methods: {
		...mapActions({ setAlert: "alert/add" }),

		checkVideoBeforeLeaving(next) {
			if (!this.requiresVideo) return next();
			this.setAlert({ text: "يجب رفع فيديو للسيارة قبل المغادرة", error: true });
			next(false);
		},

		addRequiredVideo(url) {
			if (typeof url !== "string" || !url.trim()) {
				console.error("Video upload returned an invalid URL");
				this.setAlert({ text: "تعذر رفع الفيديو، حاول مرة أخرى", error: true });
				return;
			}
			this.$set(this.car, "videos", [...(this.car.videos || []), { video: url, description: "" }]);
		},

		confirmLeave(event) {
			if (!this.requiresVideo) return;
			event.preventDefault();
			event.returnValue = "";
		},

		update() {
			if (!skipCheck) this.car.updated = true;
			skipCheck = false;
		},

		save() {
			if (this.requiresVideo)
				return this.setAlert({ text: "يجب رفع فيديو للسيارة قبل الحفظ", error: true });
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
				.catch((err) => {
					console.error(err);
					this.setAlert({ text: err.response?.data?.error || "تعذر حفظ السيارة", error: true });
				})
				.finally(() => (this.loading = false));
		},

		async getCar() {
			const id = this.$route.params.id;

			// a car that is still being worked on lives in the realtime list
			const draft = (this.cars || []).find((car) => car._id == id);

			if (draft) {
				this.car = draft;
				this.notFound = false;
			}
			// an already saved car is only in the database — open it for editing
			else if (!this.car && !this.fetching && !this.triedDB) {
				this.fetching = true;
				this.triedDB = true;

				try {
					const saved = await this.$axios.$get("/cars-exclusive/" + id);
					this.car = { ...saved, saved: true, updated: false };
					skipCheck = true;
				} catch (err) {
					// it may still be a draft the socket has not delivered yet,
					// the watcher below picks it up and clears this
					this.notFound = true;
				} finally {
					this.fetching = false;
				}
			}

			if (!this.car) return;

			// if no sections
			const sections = this.$auth.user.sections.map((s) => ({
				...s,
				items: s.items.map((i) => ({ ...i, description: "", image: "" })),
			}));

			if (this.car.sections.length == 0) this.car.sections = sections;

			this.socket.emit("join-room", this.car._id);
		},
	},
	mounted() {
		window.addEventListener("beforeunload", this.confirmLeave);
		this.getCar();

		// socket
		this.socket.on("delete-car", () => this.setAlert({ text: "شخص ما حذف السيارة", error: true }));
	},
	beforeDestroy() {
		window.removeEventListener("beforeunload", this.confirmLeave);
	},

	watch: {
		requiresVideo(required) {
			if (required) {
				this.$nextTick(() => {
					const uploader = this.$refs.requiredVideoUpload;
					const input = uploader && uploader.$el.querySelector('input[type="file"]');
					if (input) input.focus();
				});
			}
		},
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
		Videos,
		Sections,
	},
};
</script>

<style lang="scss" scoped>
.required-video-overlay {
	position: fixed;
	inset: 0;
	z-index: 100;
	display: grid;
	place-items: center;
	overflow-y: auto;
	padding: 1rem;
	background: rgba(0, 0, 0, 0.6);
}

.required-video-dialog {
	width: min(100%, 560px);
	padding: 1.5rem;
	border-radius: 0.75rem;
	background: white;
	text-align: center;
}

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
