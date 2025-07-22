<template>
  <div>
    <Page1
      :car="car"
      :lang="lang"
      v-if="!(car.service == 'محركات' || car.service == 'صيانة')"
    />
    <Page2 :car="car" :lang="lang" />
    <car-images
      :lang="lang"
      :car="car"
      v-if="
        car.car_images && car.car_images.length && $auth.user.job == 'exclusive'
      "
    />
    <Page3
      :lang="lang"
      :car="car"
      v-if="car.images && car.images.length && $auth.user.job == 'exclusive'"
    />
    <Page4
      :lang="lang"
      :car="car"
      v-if="
        car.sections && car.sections.length && $auth.user.job == 'exclusive'
      "
    />
  </div>
</template>

<script>
import CarImages from "@/components/print/CarImages";
import Page1 from "@/components/print/page1";
import Page2 from "@/components/print/page2";
import Page3 from "@/components/print/page3";
import Page4 from "@/components/print/Page4";

export default {
  async asyncData({ params, $axios, $auth }) {
    const car =
      $auth.user?.job == "exclusive"
        ? await $axios.$get("/cars-exclusive/" + params.id)
        : await $axios.$get("/cars/" + params.id);

    return { car };
  },
  components: { CarImages, Page1, Page2, Page3, Page4 },
  layout: "print",
  props: ["lang"],
  head() {
    return { title: this.car.car_id };
  },
};
</script>

<style lang="scss" scoped></style>
