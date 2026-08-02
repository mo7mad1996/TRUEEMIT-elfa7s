import Vue from "vue";

/**
 * The car editor and the printed report are shared between the roles, and they
 * branch on the job of the signed in user to decide which fields to show.
 *
 * The manager can now open an exclusive car, so those screens need the job of
 * the car *owner* instead of the job of the viewer — that is `viewJob`.
 * Everything that is really about the viewer (api keys, permissions, ...)
 * keeps using `$auth.user.job`.
 */
Vue.mixin({
	computed: {
		viewJob() {
			const job = this.$auth?.user?.job;
			if (job != "manager") return job;

			// `?as=exclusive` lets the manager open a print page as the owner sees it
			if (this.$route?.query?.as) return this.$route.query.as;
			if (this.$route?.path?.startsWith("/manager/exclusive")) return "exclusive";

			return job;
		},
	},
});
