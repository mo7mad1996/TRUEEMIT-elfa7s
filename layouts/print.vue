<template>
	<div class="bg min-h-screen" ref="p">
		<clientOnly>
			<div class="fixed py-2 top-0 z-50 flex justify-center items-center w-full print:hidden gap-2">
				<button
					class="btn !bg-neutral-800 hover:!bg-neutral-700 !border-neutral-800 !text-neutral-300 font-light disabled:opacity-50"
					:disabled="printing"
					@click="print"
				>
					{{ printing ? "جاري التحضير..." : "طباعة" }}

					<font-awesome-icon icon="fa-solid fa-print" />
				</button>

				<button
					class="btn !bg-neutral-800 hover:!bg-neutral-700 !border-neutral-800 !text-neutral-300 font-light disabled:opacity-50"
					:disabled="pdfLoading"
					@click="downloadPdf"
				>
					{{ pdfLoading ? "جاري التحضير..." : "PDF" }}

					<font-awesome-icon icon="fa-solid fa-file-pdf" />
				</button>

				<button
					v-if="['engineer'].includes($auth.user.job)"
					class="btn !bg-neutral-800 hover:!bg-neutral-800 !border-neutral-800 !text-neutral-300 font-light"
					@click="lang = lang == 'ar' ? 'en' : 'ar'"
				>
					<div class="transition-all" :class="{ 'text-neutral-600': lang == 'en' }">عربي</div>
					<div class="transition-all" :class="{ 'text-neutral-600': lang == 'ar' }">ENGLISH</div>
				</button>

				<ServerActions v-if="car && $auth.user.job == 'exclusive'" :car="car" />
			</div>

			<div ref="target_pdf">
				<NuxtChild :lang="lang" @car="car = $event" />
			</div>

			<img class="logo-print" :src="$shop.logo" v-if="!['exclusive'].includes(viewJob)" />

			<div class="print:hidden">
				<Alert />
			</div>
		</clientOnly>
	</div>
</template>

<script>
import Alert from "@/components/layout/alert";
import ServerActions from "@/components/print/ServerActions";

export default {
	components: { Alert, ServerActions },
	data() {
		return {
			lang: "ar",
			pdfLoading: false,
			printing: false,
			car: null,
		};
	},
	methods: {
		async print() {
			if (this.printing) return;
			this.printing = true;

			try {
				// window.print() is blocking: the preview is built from whatever is
				// in the DOM at that exact moment and never refreshes. The report
				// lives inside <clientOnly>, which only renders its slot on the tick
				// AFTER this layout's mounted() runs — so printing straight away
				// captured an empty page that had to be cancelled first.
				await this.waitForContent();
				window.print();
			} finally {
				this.printing = false;
			}
		},

		// resolves once the report is really in the DOM and its images are loaded
		async waitForContent(timeout = 8000) {
			const deadline = Date.now() + timeout;
			const frame = () => new Promise((r) => requestAnimationFrame(() => r()));

			await this.$nextTick();

			// 1| wait for <clientOnly> + NuxtChild to put the report in the DOM
			//    (the report pages render in the same patch as their wrapper)
			while (Date.now() < deadline) {
				const el = this.$refs.target_pdf;
				if (el && el.firstElementChild) break;
				await frame();
			}

			// 2| wait for images / fonts, but never hang on a broken or slow one.
			//    scan the whole layout: the print-only shop logo sits outside the report
			const root = this.$refs.p;
			const pending = [];

			if (root)
				root.querySelectorAll("img").forEach((img) => {
					if (img.complete && img.naturalWidth) return;

					pending.push(
						new Promise((resolve) => {
							img.addEventListener("load", resolve, { once: true });
							img.addEventListener("error", resolve, { once: true });
						}),
					);
				});

			if (document.fonts && document.fonts.ready) pending.push(document.fonts.ready);

			await Promise.race([
				Promise.all(pending),
				new Promise((resolve) => setTimeout(resolve, Math.max(0, deadline - Date.now()))),
			]);

			// 3| let the browser lay the pages out before the dialog freezes it
			await frame();
			await frame();
		},
		async downloadPdf() {
			if (this.pdfLoading) return;
			this.pdfLoading = true;

			try {
				const id = this.$route.params.id;

				// Send only the report content (the target_pdf wrapper), rebuilt
				// into a full document with the current <head> so styles/fonts load,
				// plus a <base> so relative CSS/image URLs resolve on the server.
				// Scripts are stripped so Puppeteer renders this static snapshot
				// instead of re-booting Nuxt (which would re-run asyncData without
				// auth and blank the page).
				const base = `<base href="${location.origin}/">`;
				const htmlAttrs = [...document.documentElement.attributes]
					.map((a) => `${a.name}="${a.value}"`)
					.join(" ");
				const bodyAttrs = [...document.body.attributes]
					.map((a) => `${a.name}="${a.value}"`)
					.join(" ");

				const stripScripts = (node) => {
					const clone = node.cloneNode(true);
					clone.querySelectorAll("script").forEach((s) => s.remove());
					return clone;
				};

				const head = stripScripts(document.head).innerHTML;

				// Keep the in-flow shop footer (footer.vue) — it renders as a
				// table-footer-group inside each .page, so it shows in the PDF.
				const contentNode = stripScripts(this.$refs.target_pdf);

				// videos are hidden by the print styles anyway (a link button takes
				// their place) — drop them so Puppeteer doesn't wait on media loads
				contentNode.querySelectorAll("video").forEach((v) => v.remove());

				const content = contentNode.outerHTML;

				const html =
					`<!DOCTYPE html><html ${htmlAttrs}>` +
					`<head>${base}${head}</head>` +
					`<body ${bodyAttrs}>${content}</body></html>`;

				// Build small, self-contained header/footer templates. Puppeteer
				// renders these in an isolated context with no page CSS, so they must
				// use inline styles only — no external <link>/<style>, no components.
				const shop = this.$shop || {};
				const esc = (v) =>
					String(v == null ? "" : v)
						.replace(/&/g, "&amp;")
						.replace(/</g, "&lt;")
						.replace(/>/g, "&gt;")
						.replace(/"/g, "&quot;");
				const logo = shop.logo
					? String(shop.logo).startsWith("http")
						? shop.logo
						: location.origin + shop.logo
					: "";

				const header =
					`<div style="font-size:9px;width:100%;box-sizing:border-box;padding:0 12mm;` +
					`display:flex;align-items:center;justify-content:space-between;` +
					`font-family:sans-serif;color:#1e3a5f;-webkit-print-color-adjust:exact;print-color-adjust:exact;">` +
					`<span style="flex:1;text-align:right;">${esc(shop.name)}</span>` +
					(logo
						? `<img src="${esc(logo)}" style="height:34px;object-fit:contain;margin:0 8px;" />`
						: "") +
					`<span style="flex:1;text-align:left;">${shop.cr ? "س.ت: " + esc(shop.cr) : ""}</span>` +
					`</div>`;

				const blob = await this.$axios.$post(
					`/pdf/${id}`,
					{ html, header },
					{ responseType: "blob" },
				);

				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `report-${id}.pdf`;
				document.body.appendChild(a);
				a.click();
				a.remove();
				URL.revokeObjectURL(url);
			} catch (e) {
				console.error(e);
			} finally {
				this.pdfLoading = false;
			}
		},
	},
	mounted() {
		if (!this.$route.query.hasOwnProperty("no_print")) this.print();
	},
};
</script>

<style lang="scss">
.bg {
	background: #706969;
	padding: 2em;

	@media print {
		background: white;
		padding: 0;
	}
}

.page {
	margin: 4em auto 0;
	background: white;
	display: table;
	width: 210mm; // A4 width
	min-height: 297mm; // A4 Height
	padding: 0.3in 0.3in 0in 0.3in;
	object-fit: cover;
	// font-size: 18px;
	overflow: hidden;

	box-shadow: 0 0 10px #2a505d;

	@media print {
		width: calc(210mm - 1in);
		min-height: calc(297mm - 1in);
		overflow: hidden !important;
		padding: 0;
		box-shadow: none;
		margin: 0;
	}
}

// أي محتوى ملاحظات داخل التقرير يكون عليه إطار (بدون الفاضي)
.page p:not(:empty),
.page .lines:not(:empty) {
	border: 1px solid #000;
	font-size: 0.8em;
}

// الفاصل بين كل سطر جوه صندوق الملاحظات
.page .lines hr {
	border: none;
	border-top: 1px solid #000;
	margin: 5px 0;
}

.footer {
	font-size: 0.7em;
	color: #000;
	box-sizing: border-box;
	width: 100%;

	> div {
		flex: 1;

		span {
			display: flex;
			gap: 1em;
			margin: 0.3em 0;

			svg {
				display: block;
				width: 1em;
			}
		}
	}

	.left {
		text-align: left;
		direction: ltr;
	}
	.right {
		text-align: right;
		direction: rtl;
	}

	@media print {
		display: flex;
	}
}

.logo-print {
	display: none;

	@media print {
		position: fixed;
		display: block;
		left: 1em;
		bottom: 3em;
		width: 7em;
		height: 7em;
		object-fit: contain;
	}
}
</style>
