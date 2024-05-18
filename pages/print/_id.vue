<template>
  <div>
    <Page1
      :car="car"
      v-if="!(car.service == 'محركات' || car.service == 'صيانة')"
    />
    <Page2 :car="car" />
  </div>
</template>

<script>
import Page1 from "@/components/print/page1";
import Page2 from "@/components/print/page2";

export default {
  async asyncData({ params, $axios }) {
    const car = await $axios.$get("/cars/" + params.id);

    return { car };
  },
  components: { Page1, Page2 },
  layout: "print",
  head: () => ({ title: "طباعه" }),
};
</script>

<style lang="scss" scoped></style>
