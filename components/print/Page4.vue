<template>
  <div class="page">
    <PrintHeader :car="car" />

    <div class="page4">
      <div
        v-for="(section, n) in car?.sections"
        :key="n"
        class="section-to-print"
      >
        <table
          class="section-table bg-neutral-50/40 border border-gray-200 rounded-xl shadow-sm w-full"
        >
          <thead>
            <tr>
              <td colspan="2">
                <h2
                  class="section-title text-xl font-semibold text-blue-700 flex justify-between items-center py-4 px-6"
                >
                  <span>{{ section.title }}</span>
                  <span>{{ section.title_en }}</span>
                </h2>
              </td>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colspan="2">
                <div
                  v-for="(item, i) in section.items"
                  :key="i"
                  class="mb-4 border-t pt-4 first:border-t-0 first:pt-0 px-6"
                >
                  <div
                    class="flex justify-between"
                    :class="{
                      'bg-green-50 items-center p-2 rounded-md':
                        !item.image && !item.description,
                    }"
                  >
                    <h3 class="text-base font-medium text-lime-900 flex-1">
                      {{ item.name }}

                      <br />
                      <span class="opacity-75 text-sm">
                        {{ item.name_en }}</span
                      >
                    </h3>
                    <p
                      class="text-sm text-green-600 font-semibold bg-green-100 rounded-lg px-4 py-2 w-fit"
                      v-if="!item.image && !item.description"
                    >
                      <font-awesome-icon :icon="['fas', 'circle-check']" />
                      سليم OK
                    </p>
                  </div>

                  <div class="flex items-start justify-between gap-4 mt-2">
                    <div class="flex-1">
                      <p
                        v-if="item.description"
                        class="text-sm text-red-600 bg-red-50 mt-1 border-r pr-4 py-4"
                        v-html="$nltobr(item.description, 'br')"
                      ></p>
                    </div>

                    <div v-if="item.image" class="w-32 shrink-0">
                      <img
                        :src="item.image"
                        class="w-full h-auto rounded border"
                      />
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
/* تأكد من أن كل سكشن يبدأ في صفحة جديدة */
.section-to-print {
  // page-break-before: always;
  page-break-inside: avoid;
}

/* اجعل الحاوية للطباعة كاملة بطول الورقة */
.page {
  max-width: 100%;
}

.section-title {
  page-break-after: avoid;
}

/* دعم للطباعة */
@media print {
  body {
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
  }

  .section-to-print {
    page-break-inside: auto;
    // page-break-before:  always;
  }

  .page {
    height: 100%;
    page-break-inside: avoid;
  }

  img {
    max-width: 100%;
    height: auto;
  }
}
</style>
