<template>
	<div class="overlay" @click="$emit('close')">
		<div class="model text-center" @click.stop>
			<div class="title mb-4">
				<h3 class="text-lg font-semibold">رابط البرنامج</h3>
				<p class="text-sm opacity-60">امسح الكود بكاميرا الهاتف للدخول على البرنامج</p>
			</div>

			<div class="qr-box mx-auto">
				<Loader v-if="loading" />
				<p v-else-if="error" class="text-red-500 text-sm py-6">تعذر إنشاء الكود</p>
				<canvas v-else ref="qr" class="block w-full h-full"></canvas>
			</div>

			<div class="url-row mt-4">
				<span class="url" dir="ltr">{{ url }}</span>
				<button type="button" class="copy-btn" @click="copy">
					<font-awesome-icon :icon="copied ? 'fa-solid fa-check' : 'fa-solid fa-copy'" />
				</button>
			</div>
		</div>

		<p class="simple_text text-left mt-4">إضغط <span class="key">esc</span> للإلغاء.</p>
	</div>
</template>

<script>
export default {
	name: "QrPopup",

	data: () => ({
		url: "",
		loading: true,
		error: false,
		copied: false,
	}),

	methods: {
		// the address another device on the same network uses to open the app.
		// normally that is the origin the browser is served from, but if the PC
		// opened the app on a non-reachable host (localhost / 127.* / 169.254.*
		// APIPA) we fall back to the LAN host baked into the axios base url.
		lanBase() {
			const host = window.location.hostname;
			const unreachable =
				host === "localhost" || host === "127.0.0.1" || host.startsWith("169.254.");

			if (!unreachable) return window.location.origin;

			const api = this.$axios?.defaults?.baseURL || "";
			const base = api.replace(/\/api\/?$/, "");
			return /^https?:\/\//.test(base) ? base : window.location.origin;
		},

		async generate() {
			this.loading = true;
			this.error = false;

			this.url = this.lanBase();

			try {
				// browser build, loaded lazily so it never runs during SSR
				const mod = await import("qrcode");
				const QRCode = mod.default || mod;

				// fixed QR version 3 (29×29 modules). if the url is too long to
				// fit v3 we fall back to the smallest version that holds it so we
				// never hard-fail. level Q (25% recovery) keeps it scannable with
				// the centre logo on top.
				let qr;
				try {
					qr = QRCode.create(this.url, { version: 3, errorCorrectionLevel: "Q" });
				} catch (e) {
					qr = QRCode.create(this.url, { errorCorrectionLevel: "Q" });
				}

				// reveal the <canvas> (hidden behind the loader) before drawing on it
				this.loading = false;
				await this.$nextTick();
				await this.draw(qr);
			} catch (err) {
				console.error("qr generation failed:", err);
				this.error = true;
				this.loading = false;
			}
		},

		loadImage(src) {
			return new Promise((resolve, reject) => {
				if (!src) return reject(new Error("no src"));
				const img = new Image();
				// no crossOrigin: the canvas is only shown, never exported, so a
				// cross-origin logo (e.g. the server) can be drawn without CORS.
				img.onload = () => resolve(img);
				img.onerror = reject;
				img.src = src;
			});
		},

		// rounded-rectangle path (ctx.roundRect isn't in older canvas engines)
		roundRect(ctx, x, y, w, h, r) {
			r = Math.min(r, w / 2, h / 2);
			ctx.beginPath();
			ctx.moveTo(x + r, y);
			ctx.arcTo(x + w, y, x + w, y + h, r);
			ctx.arcTo(x + w, y + h, x, y + h, r);
			ctx.arcTo(x, y + h, x, y, r);
			ctx.arcTo(x, y, x + w, y, r);
			ctx.closePath();
		},

		// telegram-style render: round dots for the body, rounded frames for the
		// three finder patterns, and the logo in the middle.
		async draw(qr) {
			const canvas = this.$refs.qr;
			if (!canvas) return;

			const DARK = "#1e293b";
			const LIGHT = "#ffffff";
			const count = qr.modules.size; // 29 for v3
			const data = qr.modules.data; // 1 = dark module
			const quiet = 4; // quiet zone in modules (spec minimum, helps scanners)
			const SIZE = 256; // css pixels
			const total = count + quiet * 2;
			const cell = SIZE / total;

			const dpr = window.devicePixelRatio || 1;
			canvas.width = SIZE * dpr;
			canvas.height = SIZE * dpr;
			canvas.style.width = SIZE + "px";
			canvas.style.height = SIZE + "px";
			const ctx = canvas.getContext("2d");
			ctx.scale(dpr, dpr);

			ctx.fillStyle = LIGHT;
			ctx.fillRect(0, 0, SIZE, SIZE);

			// top-left pixel of a module, and whether a module is dark
			const px = (m) => quiet * cell + m * cell;
			const isDark = (r, c) => r >= 0 && c >= 0 && r < count && c < count && !!data[r * count + c];

			// the three finder patterns (7×7, at the corners) are drawn specially
			const finders = [
				[0, 0],
				[0, count - 7],
				[count - 7, 0],
			];
			const inFinder = (r, c) =>
				finders.some(([fr, fc]) => r >= fr && r < fr + 7 && c >= fc && c < fc + 7);

			// body modules as round dots
			ctx.fillStyle = DARK;
			const radius = cell * 0.5;
			for (let r = 0; r < count; r++) {
				for (let c = 0; c < count; c++) {
					if (!isDark(r, c) || inFinder(r, c)) continue;
					ctx.beginPath();
					ctx.arc(px(c) + cell / 2, px(r) + cell / 2, radius, 0, Math.PI * 2);
					ctx.fill();
				}
			}

			// finder patterns: rounded outer frame + rounded eye
			for (const [fr, fc] of finders) {
				const x = px(fc);
				const y = px(fr);
				const s = 7 * cell;

				ctx.fillStyle = DARK;
				this.roundRect(ctx, x, y, s, s, s * 0.28);
				ctx.fill();

				ctx.fillStyle = LIGHT;
				this.roundRect(ctx, x + cell, y + cell, s - 2 * cell, s - 2 * cell, (s - 2 * cell) * 0.26);
				ctx.fill();

				ctx.fillStyle = DARK;
				this.roundRect(
					ctx,
					x + 2 * cell,
					y + 2 * cell,
					s - 4 * cell,
					s - 4 * cell,
					(s - 4 * cell) * 0.35,
				);
				ctx.fill();
			}

			await this.drawLogo(ctx, SIZE);
		},

		async drawLogo(ctx, SIZE) {
			// prefer the user's / shop's logo; if it can't load, fall back to the app logo
			const img = await this.loadImage("/logo/trueemit.png").catch(() => null);
			if (!img) return; // no logo available → plain telegram-style code

			// 0.20 is the largest logo that still scans at version 3 / level Q
			// (verified by decoding the render); bigger wipes out too much data.
			const box = SIZE * 0.2; // logo fits inside this square
			const pad = box * 0.06;
			const bg = box + pad * 2;
			const cx = SIZE / 2;
			const cy = SIZE / 2;

			// white rounded plate so the logo sits clear of the dots
			ctx.fillStyle = "#ffffff";
			this.roundRect(ctx, cx - bg / 2, cy - bg / 2, bg, bg, bg * 0.05);
			ctx.fill();

			// contain the logo within the box, keeping its aspect ratio
			const scale = Math.min(box / img.width, box / img.height);
			const w = img.width * scale;
			const h = img.height * scale;
			ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
		},

		async copy() {
			try {
				await navigator.clipboard.writeText(this.url);
			} catch (err) {
				// clipboard API may be unavailable over plain http; fall back
				const input = document.createElement("input");
				input.value = this.url;
				document.body.appendChild(input);
				input.select();
				document.execCommand("copy");
				document.body.removeChild(input);
			}

			this.copied = true;
			setTimeout(() => (this.copied = false), 1500);
		},

		keyDown(e) {
			if (e.key == "Escape") this.$emit("close");
		},
	},

	mounted() {
		this.generate();
		addEventListener("keydown", this.keyDown);
	},

	beforeDestroy() {
		removeEventListener("keydown", this.keyDown);
	},
};
</script>

<style lang="scss" scoped>
.overlay {
	position: fixed;
	inset: 0;
	z-index: 60;
	background: rgba(241, 241, 241, 0.467);
	display: grid;
	place-items: center;
	min-height: 100vh;
	backdrop-filter: blur(5px);
}

.model {
	background: white;
	border-radius: 12px;
	color: #333;
	padding: 1.5rem;
	box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.qr-box {
	width: 256px;
	height: 256px;
	display: grid;
	place-items: center;
	border-radius: 10px;
	background: white;
}

.url-row {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	justify-content: center;

	.url {
		font-size: 0.85rem;
		background: #f1f5f9;
		padding: 0.35rem 0.6rem;
		border-radius: 6px;
		word-break: break-all;
	}

	.copy-btn {
		background: #e2e8f0;
		padding: 0.4rem 0.6rem;
		border-radius: 6px;

		&:hover {
			background: #cbd5e1;
		}
	}
}

.simple_text {
	position: absolute;
	bottom: 1em;
	left: 1em;
}
</style>
