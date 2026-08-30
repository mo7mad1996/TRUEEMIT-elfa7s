<template>
	<div class="container simple_form">
		<div class="d-flex flex-controller">
			<fieldset v-if="car.body">
				<legend>فحص البودي</legend>

				<div class="check-input" v-for="(input, n) in $inputs" :key="n">
					<span>{{ input.ar }}</span>
					<div class="inputs">
						<div class="input" v-for="item in values" :key="item.value">
							<input
								type="radio"
								:value="item.value"
								:name="input.en"
								v-model="car.body[input.en]"
								:id="item.value + input.en"
							/>
							<label :for="item.value + input.en">{{ item.title }}</label>
						</div>
					</div>
				</div>

				<div class="form-input">
					<label>
						<font-awesome-icon :icon="['fas', 'clipboard']" />
						ملاحظات
					</label>
					<textarea v-model="car.body.note" data-max="5"></textarea>
					<!-- @keydown="$check_max_lines" -->
				</div>
			</fieldset>
			<div class="images">
				<Images :car="car" v-if="car.body" />
			</div>
		</div>
		<div class="form-input">
			<label>
				<font-awesome-icon :icon="['fas', 'toolbox']" />
				فحص الشاصى
			</label>
			<textarea v-model="car.chassis" data-max="5"></textarea>
			<!-- @keydown="$check_max_lines" -->
		</div>
	</div>
</template>

<script>
import Images from "@/components/engineer/images.vue";

export default {
	name: "FristPage",
	props: ["car"],
	data() {
		return {
			// value is stored in car.body[...] and must stay stable — it feeds the
			// print page labels and the `-<value>.png` clarification images
			values: [
				{ title: "سليم", value: 0 },
				{ title: "معدل", value: 1 },
				{ title: "مرشوش", value: 2 },
				{ title: "رش ومعجون", value: 3 },
				{ title: "مغير ومرشوش", value: 4 },
			],
		};
	},
	components: {
		Images,
	},
};
</script>

<style lang="scss" scoped>
fieldset {
	margin: 1em 0;
	border-radius: 5px;

	legend {
		padding: 0 1em;
		border-left: 1px solid #c3c3c3;
		border-right: 1px solid #c3c3c3;
	}
}

.flex-controller {
	fieldset {
		flex: 1;
	}

	.images {
		max-width: 50%;

		@media (max-width: 840px) {
			display: none !important;
		}
	}
}
</style>
