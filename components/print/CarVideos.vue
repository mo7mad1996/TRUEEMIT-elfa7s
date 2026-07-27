<template>
	<div class="page">
		<PrintHeader :car="car" :lang="lang" />

		<div style="display: table-row-group">
			<h1 class="text-blue-950 text-center">فيديوهات السيارة</h1>

			<div class="videos break">
				<div v-for="(item, n) in car?.videos" :key="n">
					<div class="bg-soft">
						<div class="video-wrap">
							<!-- على الشاشة: مشغل الفيديو -->
							<video
								:src="item.video"
								controls
								preload="metadata"
								playsinline
								class="screen-only"
							></video>

							<!-- عند الطباعة / PDF: صندوق ثابت بدل المشغل -->
							<div class="print-only placeholder">
								<font-awesome-icon :icon="['fas', 'circle-play']" />
								<span>فيديو</span>
							</div>

							<a
								:href="item.video"
								target="_blank"
								rel="noopener"
								class="zoom-btn"
								title="فتح الفيديو"
							>
								<ZoomIcon />
							</a>
						</div>

						<!-- زر خارجي لمشاهدة الفيديو (يعمل كرابط داخل الـ PDF) -->
						<a :href="item.video" target="_blank" rel="noopener" class="watch-btn">
							<font-awesome-icon :icon="['fas', 'play']" />
							مشاهدة الفيديو
						</a>

						<p v-if="item.description">{{ item.description }}</p>
					</div>
				</div>
			</div>
		</div>

		<PrintFooter />
	</div>
</template>

<script>
import PrintHeader from "@/components/print/header";
import PrintFooter from "@/components/print/footer";
import ZoomIcon from "@/components/print/ZoomIcon";

export default {
	name: "CarVideos",
	props: ["car", "lang"],
	components: { PrintHeader, PrintFooter, ZoomIcon },
};
</script>

<style lang="scss" scoped>
.page {
	height: auto;
	page-break-inside: avoid;
	break-inside: avoid;
}

.print-only {
	display: none;
}

.videos {
	flex-wrap: wrap;
	columns: 100px 2;

	> div {
		display: flex;

		break-inside: avoid;
		page-break-inside: avoid;
		padding: 5px;
		flex-direction: column;
		gap: 1.5em;

		.bg-soft {
			padding: 5px;
			height: 100%;

			border-radius: 5px;
			background: #958b8b2e;
		}

		.video-wrap {
			position: relative;
			display: block;
		}

		video {
			border-radius: 5px;
			width: 100%;
			display: block;
			height: 200px;
			object-fit: cover;
			background: #000;
		}

		// لون النص والإطار وحدهما يكفيان لو لم تُطبع الخلفيات
		.placeholder {
			border-radius: 5px;
			border: 1px dashed #1e3a5f;
			width: 100%;
			height: 200px;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 0.4em;
			color: #1e3a5f;
			font-size: 2em;

			span {
				font-size: 0.45em;
			}

			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}

		.watch-btn {
			margin: 5px 0 0;
			padding: 6px 10px;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.5em;
			border-radius: 5px;
			border: 1px solid #1e3a5f;
			background: #e8eef5;
			color: #1e3a5f;
			font-size: 0.8em;
			font-weight: 600;
			text-decoration: none;

			// keep the button colors in the PDF (printBackground:false)
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;

			svg {
				display: block;
				width: 1em;
			}
		}

		.zoom-btn {
			position: absolute;
			top: 8px;
			right: 8px;
			width: 26px;
			height: 26px;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 50%;
			background: rgba(0, 0, 0, 0.55);
			color: #fff;
			font-size: 12px;
			text-decoration: none;
			transition: background 0.2s;

			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;

			&:hover {
				background: rgba(0, 0, 0, 0.8);
			}
		}

		p {
			text-align: center;
			color: var(--color-blue-5);
		}
	}
}

@media print {
	.screen-only {
		display: none !important;
	}

	.print-only {
		display: flex;
	}
}
</style>
