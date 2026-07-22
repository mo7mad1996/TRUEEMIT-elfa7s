<template>
	<footer class="footer text-center bg-neutral-50" v-if="$shop.address">
		<hr class="m-0 border-black" />
		<div class="flex">
			<div class="right">
				<span>
					<font-awesome-icon :icon="['fas', 'map-location-dot']" />
					{{ $shop.address }}
				</span>
				<span v-if="$shop.phone">
					<font-awesome-icon :icon="['fas', 'mobile-screen-button']" />
					{{ $shop.phone }}
				</span>
			</div>

			<div class="left">
				<span v-if="$shop.website_url">
					<font-awesome-icon :icon="['fas', 'globe']" />
					{{ $shop.website_url }}
				</span>
				<span v-if="$shop.twitter">
					<font-awesome-icon :icon="['fab', 'twitter']" />
					{{ $shop.twitter }}
				</span>
				<span v-if="$shop.tiktok">
					<font-awesome-icon :icon="['fab', 'tiktok']" />
					{{ $shop.tiktok }}
				</span>
			</div>
		</div>
	</footer>
</template>

<style lang="scss" scoped>
footer.footer {
	display: table-footer-group;
}

.flex {
	display: flex;
	justify-content: space-between;
}
</style>
