<template>
	<li class="bg-white/80 my-3 p-2 simple_form">
		<div class="flex justify-between items-center">
			<h4 class="text-sm text-gray-500">
				{{ item.name }}
				<br />
				({{ item.name_en }})
			</h4>

			<button
				@click="edit = true"
				v-if="!edit"
				class="py-1 px-3 text-xs rounded shadow bg-blue-100 hover:bg-blue-200 text-blue-700"
			>
				أضف ملاحظات
			</button>
		</div>

		<div class="form-input my-4" v-if="edit || item.image || item.description">
			<textarea placeholder="ملاحظات" v-model="item.description" rows="2" class="!h-16"></textarea>

			<label>
				<div class="flex gap-2 my-2">
					<div
						class="flex-1 text-center p-4 bg-slate-100 rounded border hover:bg-slate-200 cursor-pointer"
						:class="{ 'pointer-events-none opacity-60': uploading }"
					>
						<font-awesome-icon :icon="['fas', 'spinner']" spin v-if="uploading" />
						<font-awesome-icon :icon="['fas', 'pencil']" v-else-if="item.image" />
						<font-awesome-icon :icon="['fas', 'camera']" v-else />
					</div>
					<button
						type="button"
						class="flex-1 text-center p-4 bg-red-100 rounded border hover:bg-red-200 cursor-pointer disabled:opacity-60"
						v-if="item.image"
						:disabled="deleting"
						@click.prevent.stop="remove"
					>
						<font-awesome-icon :icon="['fas', 'spinner']" spin v-if="deleting" />
						<font-awesome-icon :icon="['fas', 'close']" v-else />
					</button>
				</div>

				<FileDropAble
					ref="uploader"
					class="!hidden"
					:id="car._id"
					@input="(image) => (item.image = image)"
					@delete="() => (item.image = '')"
					@loading="(v) => (uploading = v)"
				>
					<template> </template>
				</FileDropAble>
			</label>
			<img
				v-if="item.image"
				:src="item.image"
				class="w-full h-24 bg-neutral-100 aspect-square object-contain my-2 block col-1 rounded shadow"
			/>
		</div>
	</li>
</template>

<script>
export default {
	name: "Section",
	props: ["item", "car"],
	data: () => ({ edit: false, uploading: false, deleting: false }),
	methods: {
		async remove() {
			if (this.deleting || !this.item.image) return;
			this.deleting = true;
			try {
				// reuse the same upload system: actually delete the file from the server
				await this.$refs.uploader.removeFile(this.item.image);
			} finally {
				this.deleting = false;
			}
		},
	},
};
</script>
