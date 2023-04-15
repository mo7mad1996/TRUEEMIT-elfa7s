<template>
  <div class="page">
    <PrintHeader :car="car" />

    <div class="page2">
      <div class="section one">
        <h4>
          فحص الكمبيوتر
          <font-awesome-icon :icon="['fas', 'computer']" />
        </h4>
        <p v-html="$nltobr(car.computer)"></p>
      </div>
      <div class="section two">
        <h4>
          فحص ميكانيكا
          <font-awesome-icon :icon="['fas', 'wrench']" />
        </h4>
        <p v-html="$nltobr(car.mechanical)"></p>
      </div>
      <div class="section three">
        <h4>
          الفحص الميداني
          <font-awesome-icon :icon="['fas', 'gears']" />
        </h4>
        <p v-html="$nltobr(car.ground)"></p>
      </div>
    </div>
  </div>
</template>

<script>
import PrintHeader from "@/components/print/header";

export default {
  name: "Page2",
  props: ["car"],
  components: { PrintHeader },
};
</script>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
}
.page2 {
  display: grid;
  grid-template-rows: repeat(3, 1fr) 2em;
  grid-template-columns: repeat(2, 1fr);
  flex: 1;
  display: grid;
  gap: 10px;

  h4 {
    color: rgb(26, 16, 96);
    margin: 0 0 1em;
  }

  p {
    width: 100%;
  }

  .one {
    grid-column-start: 1;
    grid-column-end: 2;
    grid-row-start: 1;
    grid-row-end: 3;
  }
  .two {
    grid-column-start: 2;
    grid-column-end: 3;
    grid-row-start: 1;
    grid-row-end: 4;

    position: relative;

    &::after {
      content: "";
      border-left: 1px solid #000;
      position: absolute;
      height: 100%;
      right: -5px;
      top: 0;
    }
  }
  .three {
    grid-column-start: 1;
    grid-column-end: 2;
    grid-row-start: 3;
    grid-row-end: 4;

    position: relative;

    &::after {
      content: "";
      border-top: 1px solid #000;
      position: absolute;
      width: 100%;
      top: -5px;

      left: 0;
    }
  }
}
</style>
