<template>
	<section class="container">
		<h1 class="my-4 opacity-60">فيديوهات السيارة</h1>

		<FileDropAble
			:id="car._id"
			accept="video/*"
			loading-text="جاري رفع الفيديوهات..."
			@input="addVideo"
			@delete="removeVideo"
		>
			<template v-slot="{ removeFile, deleting }">
				<ul v-if="videos.length" class="file-list">
					<li v-for="(file, n) in videos" :key="n" class="file-item simple_form">
						<video :src="file.video" controls preload="metadata" class="video-preview"></video>

						<button
							@click="removeFile(file.video)"
							class="remove-btn aspect-square"
							:disabled="deleting.includes(file.video)"
						>
							<font-awesome-icon
								:icon="deleting.includes(file.video) ? ['fas', 'spinner'] : ['fas', 'close']"
								:spin="deleting.includes(file.video)"
								class="text-red-400"
							/>
						</button>

						<div class="description form-input">
							<textarea v-model="file.description" placeholder="الوصف" rows="2"></textarea>
						</div>
					</li>
				</ul>
			</template>
		</FileDropAble>
	</section>
</template>

<script>
export default {
	props: ["car"],
	computed: {
		// older cars have no videos field at all
		videos() {
			return this.car.videos || [];
		},
	},
	methods: {
		addVideo(video) {
			this.$set(this.car, "videos", [...this.videos, { video, description: "" }]);
		},

		removeVideo(fileName) {
			this.$set(
				this.car,
				"videos",
				this.videos.filter(({ video }) => video !== fileName),
			);
		},
	},
};
</script>

<style lang="scss" scoped>
.video-preview {
	width: 160px;
	height: 90px;
	display: block;
	border-radius: 5px;
	background: #000;
	object-fit: cover;
}
</style>
