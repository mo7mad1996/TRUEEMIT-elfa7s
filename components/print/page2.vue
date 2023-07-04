<template>
  <div class="page">
    <PrintHeader :car="car" />

    <div class="page2">
      <div class="section one">
        <h4>
          فحص الكمبيوتر
          <font-awesome-icon :icon="['fas', 'computer']" />
          <span class="squire"></span>
        </h4>
        <p v-html="$nltobr(car.computer)" v-if="car.computer"></p>
      </div>

      <div class="section five">
        <h4>
          فحص الاكسسورات
          <font-awesome-icon :icon="['fas', 'gears']" />
          <span class="squire"></span>
        </h4>
        <p v-html="$nltobr(car.accessories)" v-if="car.computer"></p>
      </div>

      <div class="section two">
        <h4>
          فحص ميكانيكا
          <font-awesome-icon :icon="['fas', 'wrench']" />
          <span class="squire"></span>
        </h4>
        <p v-html="$nltobr(car.mechanical)" v-if="car.mechanical"></p>
      </div>
      <div class="section three">
        <h4>
          الفحص الميداني
          <font-awesome-icon :icon="['fas', 'car']" />
          <span class="squire"></span>
        </h4>
        <p v-if="car.ground" v-html="$nltobr(car.ground)"></p>
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
  grid-template-rows: 1fr auto 1fr;
  grid-template-columns: repeat(2, 1fr);
  flex: 1;
  display: grid;
  gap: 10px;

  h4 {
    color: rgb(26, 16, 96);
    gap: 0.4em;
    display: flex;
    align-items: center;
    margin: 0.3em 0 0;

    .squire {
      border: 2px solid rgb(26, 16, 96);
      display: inline-block;
      height: 1.5em;
      aspect-ratio: 1 / 1;
      margin-right: auto;
      border-radius: 4px;
    }
  }

  .one {
    grid-column-start: 1;
    grid-column-end: 2;
    grid-row-start: 1;
    grid-row-end: 2;
  }
  .five {
    grid-column-start: 1;
    grid-column-end: 2;
    grid-row-start: 2;
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
      width: 1px;
      background: linear-gradient(to top, transparent, #000, transparent);
      position: absolute;
      height: 70%;
      right: -5px;
      top: 50%;
      transform: translateY(-50%);
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
