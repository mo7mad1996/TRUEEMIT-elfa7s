<template>
  <header class="EngineerHeader simple_form">
    <div class="container">
      <div>
        <div class="form-input">
          <label>
            <font-awesome-icon :icon="['fas', 'car-side']" />
            نوع السياره
          </label>
          <input v-model="car.type" />
        </div>
        <div class="form-input">
          <label>
            <font-awesome-icon :icon="['fass', 'passport']" />
            رقم اللوحه</label
          >
          <input v-model="car.car_id" />
        </div>
        <div class="form-input">
          <label>
            <font-awesome-icon :icon="['fas', 'gauge-high']" />
            قرأت العداد
          </label>
          <input v-model="car.odometer" />
        </div>
        <div class="form-input">
          <label>
            <font-awesome-icon :icon="['fas', 'bell-concierge']" />
            نوع الخدمة
          </label>
          <select v-model="car.service">
            <option v-for="(s, n) in services" :key="n" :value="s">
              {{ s }}
            </option>
          </select>
        </div>
      </div>
      <div class="logo">
        <div><img :src="$shop.logo" /></div>
        <div class="text-center" v-if="$shop.cr">س.ت: {{ $shop.cr }}</div>
      </div>

      <div class="third">
        <!-- <BarCode :code="car._id" /> -->
        <div class="time">
          <span>
            {{ $moment(new Date(car.date)).locale("En").format("h:mma") }}
          </span>
          <span>
            {{ $moment(new Date(car.date)).locale("En").format("DD/MM/YYYY") }}
          </span>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import BarCode from "@/components/engineer/barcode";

export default {
  props: ["car"],
  name: "EngineerHeader",
  components: { BarCode },
  data: () => ({
    services: ["شامل", "محركات", "بودي", "ماكينه", "قير", "ماكينه وقير", "شاص"],
  }),
};
</script>

<style lang="scss" scoped>
.EngineerHeader {
  .container {
    display: flex;
    border-bottom: 1px solid #555;
    gap: 10px;

    > div {
      width: calc(100% / 3);

      @media (max-width: 840px) {
        flex: 1;
      }

      > * {
        display: block;
      }

      &.logo {
        img {
          max-height: 120px;
          margin: auto;
          max-width: 100%;
          display: block;
        }

        @media (max-width: 840px) {
          display: none;
        }
      }

      &.third {
        display: flex;
        flex-direction: column;
        justify-content: center;

        svg {
          width: 100%;
        }

        .time {
          display: flex;
          flex-direction: column;
          gap: 0.4em;
          align-items: center;

          > span:first-of-type {
            font-size: 20px;
            color: #555;
            text-transform: uppercase;
          }
        }
      }
    }
  }
}
</style>
