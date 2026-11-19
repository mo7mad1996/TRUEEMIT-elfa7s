export default function ({ app, redirect, route }) {
	const ready = Boolean(app.$shop && app.$shop.ready);

	if (!ready && route.path !== "/not-ready") return redirect("/not-ready");
	if (ready && route.path === "/not-ready") return redirect("/login");
}
