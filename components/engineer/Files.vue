<template>
	<section class="container grid grid-cols-2 gap-4">
		<div class="col-span-1">
			<h1 class="my-4 opacity-60">صور السيارة</h1>

			<FileDropAble
				:id="car._id"
				@input="(image) => (car.car_images = [...car?.car_images, { image, description: '' }])"
				@delete="
					(fileName) => (car.car_images = car.car_images.filter(({ image }) => image !== fileName))
				"
			>
				<template v-slot="{ removeFile }">
					<ul v-if="car.images.length" class="file-list">
						<li v-for="(file, n) in car.car_images" :key="n" class="file-item simple_form">
							<img :src="file.image" class="object-contain" />

							<button @click="removeFile(file.image)" class="remove-btn aspect-square">
								<font-awesome-icon icon="fa-solid fa-close" class="text-red-400" />
							</button>

							<div class="description form-input">
								<textarea v-model="file.description" placeholder="الوصف" rows="2"></textarea>
							</div>
						</li>
					</ul>
				</template>
			</FileDropAble>
		</div>
		<div class="col-span-1">
			<h1 class="my-4 opacity-60">صور الملاحظات</h1>

			<FileDropAble
				class="col-span-1"
				:id="car._id"
				@input="(image) => (car.images = [...car?.images, { image, description: '' }])"
				@delete="(fileName) => (car.images = car.images.filter(({ image }) => image !== fileName))"
			>
				<template v-slot="{ removeFile }">
					<ul v-if="car.images.length" class="file-list">
						<li v-for="(file, n) in car.images" :key="(file, n)" class="file-item simple_form">
							<img :src="file.image" />

							<button @click="removeFile(file.image)" class="remove-btn">
								<font-awesome-icon icon="fa-solid fa-close" />
							</button>

							<div class="description form-input">
								<textarea v-model="file.description" placeholder="الوصف" rows="2"></textarea>
							</div>
						</li>
					</ul>
				</template>
			</FileDropAble>
		</div>
	</section>
</template>

<script>
export default {
	props: ["car"],
};
</script>
