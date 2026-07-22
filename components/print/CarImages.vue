<template>
	<div class="page">
		<PrintHeader :car="car" :lang="lang" />

		<div style="display: table-row-group">
			<h1 class="text-blue-950 text-center">صور السيارة</h1>
			<div class="page3 break">
				<div v-for="image in car?.car_images" :key="image.image">
					<div class="bg-soft">
						<div class="img-wrap">
							<img :src="image.image" class="" />
							<a
								:href="image.image"
								target="_blank"
								rel="noopener"
								class="zoom-btn"
								title="فتح الصورة"
							>
								<ZoomIcon />
							</a>
						</div>
						<p v-if="image.description">{{ image.description }}</p>
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
	name: "Page3",
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
.page3 {
	// display: flex;
	flex-wrap: wrap;
	columns: 100px 2;

	> div {
		// width: 50%;
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

		.img-wrap {
			position: relative;
			display: block;
		}

		img {
			border-radius: 5px;
			width: 100%;
			display: block;
			height: 200px;
			object-fit: cover;
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

			// keep the badge colors when the PDF is printed with printBackground:false
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
</style>
