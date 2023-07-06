<template>
  <header>
    <div class="top">
      <div></div>
      <div>
        <img :src="$shop.logo" class="logo" />
      </div>
      <div class="date_time">
        <span class="time">
          {{ $moment(new Date(car.date)).locale("En").format("h:mma") }}
        </span>
        <span class="date">
          {{ $moment(new Date(car.date)).locale("En").format("DD/MM/YYYY") }}
        </span>
      </div>
    </div>
    <div class="bottom">
      <div class="item">
        <label>
          نوع السياره
          <font-awesome-icon :icon="['fas', 'car-side']" />
        </label>
        <div class="value">{{ car.type }}</div>
      </div>
      <div class="item">
        <label>
          رقم اللوحه
          <font-awesome-icon :icon="['fas', 'passport']" />
        </label>
        <div class="value">{{ car.car_id }}</div>
      </div>
      <div class="item">
        <label>
          رقم الشاصى
          <font-awesome-icon :icon="['fas', 'car']" />
        </label>
        <div class="value">{{ car.vin_no }}</div>
      </div>
      <div class="item">
        <label>
          قراءة العداد
          <font-awesome-icon :icon="['fas', 'gauge-high']" />
        </label>
        <div class="value">{{ car.odometer }}</div>
      </div>
      <div class="item">
        <label>
          الخدمة المقدمه
          <font-awesome-icon :icon="['fas', 'bell-concierge']" />
        </label>
        <div class="value">{{ car.service }}</div>
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
  .top {
    display: flex;

    > div {
      flex: 1;

      &.date_time {
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

      .logo {
        height: 120px;
        margin: 0 auto 20px;
        display: block;
      }
    }
  }

  .bottom {
    display: flex;
    border: 1px solid #000;

    .item {
      flex: 1;
      display: flex;
      text-align: center;
      flex-direction: column;
      border: 1px solid var(--color-blue-5);
      padding: 5px;
      gap: 5px;

      label {
        font-size: 0.8em;
        color: var(--color-blue-5);
      }
    }
  }
}
</style>
