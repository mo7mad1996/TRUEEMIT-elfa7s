<template>
	<div class="container">
		<ul class="cars">
			<!-- loop for cars -->
			<li v-for="car in cars" :key="car._id">
				<nuxt-link :to="'/exclusive/' + car._id">
					<span class="car_type">
						{{ car.type || "لم يتم تحديد نوع السياره بعد" }}
					</span>
					<span class="car_id">
						{{ car.car_id || "لم يتم تحديد رقم اللوحه بعد" }}
					</span>
				</nuxt-link>

				<!-- uncomment this -->
				<button @click="remove(car._id)" class="remove" v-if="!car.updated">
					<font-awesome-icon :icon="['fas', 'xmark']" />
				</button>
			</li>

			<li>
				<button class="btn d-block" title="أضف سياره جديده" @click="add" :disabled="loading">
					<Loader v-if="loading" />
					<span v-else>
						سيارة جديده
						<font-awesome-icon icon="fa-solid fa-plus" />
					</span>
				</button>
			</li>
		</ul>
	</div>
</template>

<script>
export default {
	props: ["cars", "socket"],
	middleware: "exclusive",
	head: () => ({ title: "الرئيسيه" }),
	data: () => ({ loading: false }),
	mounted() {
		this.socket.emit("leave-rooms");
	},
	methods: {
		remove(id) {
			this.socket.emit("delete-car", id);
			this.$emit("remove", id);
		},
		add() {
			this.loading = true;
			this.$axios.$get("/cars-exclusive/add_new_one").then((car) => {
				this.$emit("add_car", car);
				this.$router.push("/exclusive/" + car._id);
			});
		},
	},
};
</script>

<style lang="scss" scoped>
.cars {
	padding: 0;
	margin: 0;
	list-style: none;

	li:not(:last-of-type) {
		position: relative;
		overflow: hidden;
		display: flex;
		align-items: center;

		padding: 1.2em 2em;
		border-radius: 10px;
		gap: 1em;
		background: linear-gradient(
			30deg,
			#7f7fd5,
			#86a8e7,
			#91eae4
		); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

		margin-bottom: 1em;

		.remove {
			font-size: 1.7em;
			color: white;
			background: rgb(205, 56, 56);
			padding: 0.25em 1em;
			border: 1px solid red;
			border-radius: 6px;
			cursor: pointer;

			&:focus,
			&:hover {
				filter: brightness(120%);
			}
		}

		&::after {
			content: "";
			height: 100%;
			width: 100%;
			position: absolute;
			background-image: linear-gradient(30deg, transparent, rgba(255, 255, 255, 0.3), transparent);
			pointer-events: none;
			z-index: 4;
			left: -100%;
			top: 0;
		}

		&:hover::after,
		&:focus::after {
			transition: 0.4s;
			left: 100%;
		}

		a {
			display: flex;
			flex-direction: column;

			gap: 0.7em;
			flex: 1;
			text-decoration: none;

			color: #333;
			position: relative;
			box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;

			&::after,
			&::before {
				background: rgba(255, 255, 255, 0.74);
				padding: 4px;
				border-radius: 4px;
				display: block;
				position: absolute;
				top: 4px;
				content: "";
			}
			&::after {
				width: 40%;
				left: 8px;
			}
			&::before {
				left: calc(40% + 20px);
			}

			.car_type {
				color: #981722;
			}

			.car_id {
				padding: 5px 10px;
				border: 2px solid #ba2988;
				background: linear-gradient(
					to top,
					#24c6dc,
					#93edc7
				); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

				border-radius: 8px;
			}
		}
	}
}
</style>
