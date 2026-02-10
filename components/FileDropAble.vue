<template>
	<label class="">
		<div class="file-drop-container m-auto">
			<div
				:class="['file-drop-zone', { 'drag-over': isDragOver }]"
				@dragenter="handleDragEnter"
				@dragover="handleDragOver"
				@dragleave="handleDragLeave"
				@drop="handleDrop"
			>
				<div class="drop-content">
					<div class="drop-icon">
						<svg
							class="mx-auto"
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="7,10 12,15 17,10" />
							<line x1="12" y1="15" x2="12" y2="3" />
						</svg>
					</div>
					<h3 class="drop-title">أسقِط الملفات هنا</h3>
					<p class="drop-subtitle underline">"أو انقر للتصفح"</p>
					<input type="file" @change="handleFileSelect" multiple class="file-input" />
				</div>
			</div>
		</div>

		<slot v-bind="{ files, removeFile }" />

		<div
			v-if="isDragOver"
			class="drag-overlay"
			@dragenter="handleDragEnter"
			@dragover="handleDragOver"
			@dragleave="handleDragLeave"
			@drop="handleDrop"
		>
			<div class="drag-overlay-content">
				<div class="drag-overlay-icon">
					<svg
						class="mx-auto"
						width="64"
						height="64"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
						<polyline points="7,10 12,15 17,10" />
						<line x1="12" y1="15" x2="12" y2="3" />
					</svg>
				</div>
				<h2>أسقِط الملفات في أي مكان</h2>
			</div>
		</div>
	</label>
</template>

<script>
export default {
	name: "FileDropAble",
	props: ["id"],
	data() {
		return {
			isDragOver: false,
			files: [],
			dragCounter: 0,
			loading: false,
		};
	},
	methods: {
		handleDragEnter(e) {
			e.preventDefault();
			this.dragCounter++;
			this.isDragOver = true;
		},

		handleDragOver(e) {
			e.preventDefault();
		},

		handleDragLeave(e) {
			e.preventDefault();
			this.dragCounter--;
			if (this.dragCounter === 0) {
				this.isDragOver = false;
			}
		},

		handleDrop(e) {
			e.preventDefault();
			this.dragCounter = 0;
			this.isDragOver = false;

			const droppedFiles = Array.from(e.dataTransfer?.files || []);
			this.appendFiles(droppedFiles);
		},

		handleFileSelect(e) {
			const target = e.target;
			if (target.files) {
				const selectedFiles = Array.from(target.files);
				this.appendFiles(selectedFiles);
			}
		},

		appendFiles(files) {
			Array.from(files).forEach(async (file) => {
				// create formData
				let formData = new FormData();
				formData.append("file", file, file.filename);
				formData.append("path", "cars/" + this.id);

				// send request
				const res = await this.appendFile(formData);

				// update dom
				this.$emit("input", res.file);
				this.files.push(res.file);
			});
		},

		async appendFile(formData = new FormData()) {
			return this.$axios.$post(`/cars-exclusive/append_image`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
		},

		async removeFile(fileName) {
			await this.$axios.$post("/cars-exclusive/remove_image", { fileName });
			this.$emit("delete", fileName);
			this.files = this.file.filter((i) => i != fileName);
		},

		// Window-level drag and drop handlers
		handleWindowDragEnter(e) {
			e.preventDefault();
			this.dragCounter++;
			this.isDragOver = true;
		},

		handleWindowDragOver(e) {
			e.preventDefault();
		},

		handleWindowDragLeave(e) {
			e.preventDefault();
			this.dragCounter--;
			if (this.dragCounter === 0) this.isDragOver = false;
		},

		handleWindowDrop(e) {
			e.preventDefault();
			this.dragCounter = 0;
			this.isDragOver = false;

			const droppedFiles = Array.from(e.dataTransfer?.files || []);
			this.appendFiles(droppedFiles);
		},
	},

	mounted() {
		window.addEventListener("dragenter", this.handleWindowDragEnter);
		window.addEventListener("dragover", this.handleWindowDragOver);
		window.addEventListener("dragleave", this.handleWindowDragLeave);
		window.addEventListener("drop", this.handleWindowDrop);
	},

	beforeUnmount() {
		window.removeEventListener("dragenter", this.handleWindowDragEnter);
		window.removeEventListener("dragover", this.handleWindowDragOver);
		window.removeEventListener("dragleave", this.handleWindowDragLeave);
		window.removeEventListener("drop", this.handleWindowDrop);
	},
};
</script>

<style lang="scss" scoped>
.file-drop-container {
	max-width: 500px;
	padding: 20px;
}

.file-drop-zone {
	border: 2px dashed #ddd;
	border-radius: 12px;
	padding: 40px 20px;
	text-align: center;
	background-color: #fafafa;
	transition: all 0.3s ease;
	cursor: pointer;
	position: relative;
	overflow: hidden;

	&:hover {
		border-color: #007bff;
		background-color: #f0f8ff;
	}

	&.drag-over {
		border-color: #007bff;
		background-color: #e8f4ff;
		transform: scale(1.02);
		box-shadow: 0 8px 25px rgba(0, 123, 255, 0.15);
	}
}

.drop-content {
	pointer-events: none;
}

.drop-icon {
	color: #666;
	margin-bottom: 16px;
	transition: color 0.3s ease;

	.drag-over & {
		color: #007bff;
	}
}

.drop-title {
	margin: 0 0 8px 0;
	color: #333;
	font-size: 18px;
	font-weight: 600;
}

.drop-subtitle {
	margin: 0;
	color: #666;
	font-size: 14px;
}

.file-input {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	opacity: 0;
	cursor: pointer;
	pointer-events: all;
}

.file-list {
	margin-top: 24px;
	padding: 20px;
	background-color: #f8f9fa;
	border-radius: 8px;

	h4 {
		margin: 0 0 16px 0;
		color: #333;
		font-size: 16px;
		font-weight: 600;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
}

.file-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
	margin-bottom: 8px;
	background-color: white;
	border-radius: 6px;
	border: 1px solid #e9ecef;
	transition: all 0.2s ease;
	flex-wrap: wrap;

	img {
		width: 45px;
		height: 45px;
		display: block;
		object-fit: cover;
		border-radius: 5px;
	}

	.description {
		width: 100%;
		margin: 1em 0 0;

		textarea {
			height: 5em;
		}
	}

	&:hover {
		border-color: #007bff;
		box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
	}

	&:last-child {
		margin-bottom: 0;
	}
}

.file-name {
	flex: 1;
	text-align: left;
	color: #333;
	font-weight: 500;
}

.file-size {
	color: #666;
	font-size: 14px;
	margin-right: 12px;
}

.remove-btn {
	background: none;
	border: none;
	color: #dc3545;
	font-size: 18px;
	cursor: pointer;
	padding: 4px 8px;
	border-radius: 4px;
	transition: background-color 0.2s ease;

	&:hover {
		background-color: #f8d7da;
	}
}

.drag-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 123, 255, 0.9);
	z-index: 1000;
	display: flex;
	align-items: center;
	justify-content: center;
	backdrop-filter: blur(5px);
	animation: fadeIn 0.2s ease;
}

.drag-overlay-content {
	text-align: center;
	color: white;
	padding: 40px;
	border-radius: 16px;
	background-color: rgba(255, 255, 255, 0.1);
	border: 2px solid rgba(255, 255, 255, 0.3);
	backdrop-filter: blur(10px);
	transform: scale(0.9);
	animation: scaleIn 0.3s ease forwards;
}

.drag-overlay-icon {
	margin-bottom: 20px;
	animation: bounce 1s infinite;
}

.drag-overlay-content h2 {
	margin: 0;
	font-size: 28px;
	font-weight: 600;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

@keyframes scaleIn {
	from {
		transform: scale(0.9);
	}
	to {
		transform: scale(1);
	}
}

@keyframes bounce {
	0%,
	20%,
	50%,
	80%,
	100% {
		transform: translateY(0);
	}
	40% {
		transform: translateY(-10px);
	}
	60% {
		transform: translateY(-5px);
	}
}

@media (prefers-color-scheme: dark) {
	.file-drop-zone {
		background-color: #2d3748;
		border-color: #4a5568;

		&:hover {
			background-color: #1a202c;
			border-color: #3182ce;
		}

		&.drag-over {
			background-color: #2c5aa0;
		}
	}

	.drop-title {
		color: #e2e8f0;
	}

	.drop-subtitle {
		color: #a0aec0;
	}

	.file-list {
		background-color: #2d3748;

		h4 {
			color: #e2e8f0;
		}
	}

	.file-item {
		background-color: #1a202c;
		border-color: #4a5568;

		&:hover {
			border-color: #3182ce;
		}
	}

	.file-name {
		color: #e2e8f0;
	}

	.file-size {
		color: #a0aec0;
	}
}
</style>
