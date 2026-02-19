<template>
	<div>
		<section class="container" v-if="car?.sections?.length">
			<h1 class="text-lg opacity-60 my-4">الاقسام</h1>

			<div class="grid grid-cols-3 gap-4">
				<main
					v-for="(section, n) in car.sections"
					:key="n"
					class="col-span-1 rounded-md shadow bg-neutral-50 p-2"
				>
					<h1 class="text-center text-blue-700 text-lg my-2 font-bold">
						{{ section.title }}
						({{ section.title_en }})
					</h1>

					<ul>
						<Section
							v-for="(item, i) in section.items"
							:key="car._id + n + i"
							:item="item"
							:car="car"
						/>
					</ul>
				</main>
			</div>
		</section>
	</div>
</template>

<script>
import Section from "./Section.vue";

export default {
	name: "Sections",
	props: ["car"],
	components: { Section },
};
</script>
