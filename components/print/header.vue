<template>
  <header>
    <div class="top">
      <div>
        <template v-if="$auth.user.job != 'exclusive'">
          <div v-if="car.payment">
            حالة السداد : {{ car.payment == "أجل" ? "اخرى" : car.payment }}.
          </div>
          <div v-if="car.cost" class="mt-2">
            تكلفة التقرير :
            {{
              new Intl.NumberFormat("ar-SA", {
                style: "currency",
                currency: "SAR",
              }).format(car.cost)
            }}
          </div>
        </template>
        <div v-else>
          <img
            v-if="$auth.user.logo"
            :src="$auth.user.logo"
            class="h-28 mx-auto mb-5 object-contain block"
          />
        </div>
      </div>
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

        <div class="text-center cr" v-if="$shop.cr">
          س . ت:
          {{ $shop.cr }}
        </div>
      </div>
    </div>
    <div class="bottom">
      <div class="item">
        <label>
          نوع السياره
          <font-awesome-icon :icon="['fas', 'car-side']" />
        </label>
        <div class="value">{{ car.type || "-" }}</div>
      </div>
      <div class="item">
        <label>
          رقم اللوحه
          <font-awesome-icon :icon="['fas', 'passport']" />
        </label>
        <div class="value">{{ car.car_id || "-" }}</div>
      </div>
      <div class="item">
        <label>
          رقم الشاصى
          <font-awesome-icon :icon="['fas', 'car']" />
        </label>
        <div class="value">{{ car.vin_no || "-" }}</div>
      </div>
      <div class="item">
        <label>
          قراءة العداد
          <font-awesome-icon :icon="['fas', 'gauge-high']" />
        </label>
        <div class="value">{{ car.odometer || "-" }}</div>
      </div>

      <div class="item">
        <label>
          نوع القير

          <font-awesome-icon :icon="['fas', 'gears']" />
        </label>
        <div class="value">{{ car.gear || "-" }}</div>
      </div>

      <div class="item">
        <label>
          سعة المحرك

          <font-awesome-icon :icon="['fas', 'oil-well']" />
        </label>
        <div class="value">{{ car.engine || "-" }}</div>
      </div>

      <div class="item">
        <label>
          نوع الوقود

          <font-awesome-icon :icon="['fas', 'gas-pump']" />
        </label>
        <div class="value">{{ car.fuel || "-" }}</div>
      </div>

      <div class="item">
        <label>
          الخدمة المقدمه
          <font-awesome-icon :icon="['fas', 'bell-concierge']" />
        </label>
        <div class="value">{{ car.service || "-" }}</div>
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
  @media print {
    display: table-header-group;
    width: 100%;
  }

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
          color: #000;
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
    @apply grid grid-cols-4    gap-1;

    .item {
      gap: 5px;
      @apply flex flex-col items-center gap-1  p-1 rounded border;

      label {
        font-size: 0.8em;
        color: #000;
      }

      .value {
        @apply text-sky-700;
      }
    }
  }

  .cr {
    margin: 2em 0;
    font-size: 0.8em;
  }
}
</style>
