<template>
  <div class="page">
    <PrintHeader :car="car" />

    <div class="page4 break grid grid-cols-1 gap-4 py-4">
      <div
        v-for="(section, n) in car?.sections"
        :key="n"
        class="bg-neutral-50/40 border border-gray-200 rounded-xl shadow-sm p-4"
      >
        <h2
          class="text-xl font-semibold text-blue-700 mb-4 flex justify-between items-center py-2 px-4"
        >
          <span> {{ section.title }} </span>
          <span> {{ section.title_en }} </span>
        </h2>

        <div
          v-for="(item, i) in section.items"
          :key="i"
          class="mb-4 border-t pt-2 first:border-t-0 first:pt-0"
        >
          <div
            class="flex justify-between"
            :class="{
              'bg-green-50 items-center p-2 rounded-md':
                !item.image && !item.description,
            }"
          >
            <h3 class="text-base font-medium text-lime-900 table-header-group">
              {{ item.name }}
              <span class="opacity-75"> ({{ item.name_en }}) </span>
            </h3>
            <p
              class="text-sm text-green-600 font-semibold bg-green-100 rounded-lg px-4 py-2"
              v-if="!item.image && !item.description"
            >
              سليم
              <font-awesome-icon :icon="['fas', 'check']" />
            </p>
          </div>

          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <p
                v-if="item.description"
                class="text-sm text-gray-600 bg-red-50 mt-1 border-r pr-4 py-4 flex-1"
              >
                {{ item.description }}
              </p>
            </div>

            <div v-if="item.image" class="w-32 shrink-0">
              <img :src="item.image" class="w-full h-auto rounded border" />
            </div>
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

export default {
  name: "Page4",
  props: ["car"],
  components: { PrintHeader, PrintFooter },
};
</script>

<style lang="scss" scoped>
.page {
  height: auto;
  page-break-inside: avoid;
  break-inside: avoid;
}
.page4 .break-me {
  break-inside: avoid;
  page-break-inside: avoid;
}
</style>
