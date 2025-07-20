<template>
  <section>
    <div class="d-grid">
      <div :class="`img-${n} img-container`" v-for="n in 5" :key="n">
        <img class="main-car" :src="require(`~/assets/cars/${n}.png`)" />

        <div class="problem" v-for="input in $inputs" :key="`${n}_${input.en}`">
          <img
            v-if="car.body[input.en]"
            :src="
              require(`~/assets/cars/${n}-${input.en}-${
                car.body[input.en]
              }.png`)
            "
          />
        </div>
      </div>
    </div>

    <div class="text-center">
      ملاحظة : علامة M تعني مرشوش و T تعني تعديل وعلامة MM تعني مرشوش و معجون
      وعلامة MB تعني مغير ومرشوش
    </div>
  </section>
</template>

<script>
export default {
  name: "Images",
  props: ["car"],
};
</script>

<style lang="scss" scoped>
section {
  display: flex;
  flex-direction: column;

  .d-grid {
    display: grid;
    flex: 1;
    grid-template-rows: repeat(4, 1fr);
    grid-template-columns: repeat(2, 1fr);
    width: 90%;
    margin: auto;

    .img-container {
      position: relative;
      filter: grayscale(1);

      &.img-1 {
        grid-row: 1/2;
        grid-column: 1/3;
      }
      &.img-2 {
        grid-row: 2/3;
        grid-column: 1/3;
      }
      &.img-3 {
        grid-row: 3/4;
        grid-column: 1/2;
      }
      &.img-4 {
        grid-row: 3/4;
        grid-column: 2/3;
      }
      &.img-5 {
        grid-row: 4/5;
        grid-column: 1/3;
      }

      .main-car {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
  }
  .problem {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;

    > img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .text-center {
    color: #000000;
    font-size: 0.6em;
  }
}
</style>
