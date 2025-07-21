<template>
  <div class="page">
    <PrintHeader :car="car" />
    <h1 class="text-blue-950 text-center">صور الملاحظات</h1>
    <div class="page3">
      <div v-for="image in car?.images" :key="image.image">
        <div class="bg-soft">
          <img :src="image.image" />
          <p v-if="image.description">{{ image.description }}</p>
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
  name: "Page3",
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
.page3 {
  // display: flex;
  flex-wrap: wrap;
  columns: 100px 2;

  > div {
    // width: 50%;
    display: flex;

    break-inside: avoid;
    page-break-inside: avoid;
    padding: 5px;
    flex-direction: column;
    gap: 1.5em;

    .bg-soft {
      padding: 5px;
      height: 100%;

      border-radius: 5px;
      background: #958b8b2e;
    }

    img {
      border-radius: 5px;
      width: 100%;
      display: block;
      object-fit: contain;
    }

    p {
      text-align: center;
      color: var(--color-blue-5);
    }
  }
}
</style>
