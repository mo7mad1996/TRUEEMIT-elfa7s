<template>
  <header>
    <div class="right">
      <div class="item">
        <label>
          <font-awesome-icon :icon="['fas', 'car-side']" />
          نوع السياره
        </label>
        <div class="value">{{ car.type }}</div>
      </div>
      <div class="item">
        <label>
          <font-awesome-icon :icon="['fas', 'passport']" />
          رقم اللوحه
        </label>
        <div class="value">{{ car.car_id }}</div>
      </div>
      <div class="item">
        <label>
          <font-awesome-icon :icon="['fas', 'gauge-high']" />
          قرأت العداد
        </label>
        <div class="value">{{ car.odometer }}</div>
      </div>
      <div class="item">
        <label>
          <font-awesome-icon :icon="['fas', 'bell-concierge']" />
          الخدمة المقدمه
        </label>
        <div class="value">{{ car.service }}</div>
      </div>
    </div>

    <div class="center">
      <img :src="$shop.logo" class="logo" />
      <span>س.ت: 1010785764</span>
    </div>

    <div class="left">
      <!-- <BarCode :code="car._id" /> -->
      <div class="date_time">
        <span class="time">
          {{ $moment(new Date(car.date)).locale("En").format("h:mma") }}
        </span>
        <span class="date">
          {{ $moment(new Date(car.date)).locale("En").format("DD/MM/YYYY") }}
        </span>
      </div>
    </div>
  </header>
</template>

<script>
import BarCode from "@/components/engineer/barcode";

export default {
  name: "PrintHeader",
  props: ["car"],
  components: { BarCode },
};
</script>

<style lang="scss" scoped>
header {
  display: flex;
  border-bottom: 1px solid #777;

  > div {
    width: calc(100% / 3);
    display: flex;
    flex-direction: column;
  }

  .right {
    justify-content: space-around;

    .item {
      label {
        font-size: 0.6em;
        color: #25143d;
      }
      .value {
        font-size: 0.8em;
        padding: 0.2em;
      }
    }
  }
  .center {
    padding: 1em 0;
    gap: 1em;
    align-items: center;

    .logo {
      max-height: 50%;
      max-width: 50%;
    }

    span {
      color: #777;
      font-size: 0.7em;
    }
  }
  .left {
    gap: 0.3em;
    justify-content: center;

    svg {
      width: 100%;
      height: 40%;
    }

    .date_time {
      display: flex;
      gap: 0.1em;
      flex-direction: column;
      text-align: center;

      .time {
        font-size: 1.2em;
        text-transform: uppercase;
        color: #555;
      }
      .date {
        font-size: 0.86em;
      }
    }
  }
}
</style>
