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
            <font-awesome-icon :icon="['fass', 'car']" />
            رقم الشاصى</label
          >
          <input v-model="car.vin_no" />
        </div>
        <div class="form-input">
          <label>
            <font-awesome-icon :icon="['fas', 'gauge-high']" />
            قراءة العداد
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
            <option value="">اخرى</option>
          </select>
          <input
            class="mt-2"
            v-model="car.service"
            v-if="services.indexOf(car.service) == -1"
          />
        </div>

        <div class="form-input">
          <label>
            <font-awesome-icon :icon="['fas', 'oil-well']" />
            سعة المحرك
          </label>
          <input v-model="car.engine" />
        </div>

        <div class="form-input">
          <label>
            <font-awesome-icon :icon="['fas', 'gears']" />
            نوع القير
          </label>
          <select v-model="car.gear">
            <option
              v-for="(s, n) in ['يدوي (عادي)', 'اتوماتيك']"
              :key="n"
              :value="s"
            >
              {{ s }}
            </option>
          </select>
        </div>
        <div class="form-input">
          <label>
            <font-awesome-icon :icon="['fas', 'gas-pump']" />
            نوع الوقود
          </label>
          <select v-model="car.fuel">
            <option
              v-for="(s, n) in ['بنزين', 'ديزيل', 'كهرباء']"
              :key="n"
              :value="s"
            >
              {{ s }}
            </option>
          </select>
        </div>

        <template v-if="!car.cost_disabled || $auth.user.job == 'manager'">
          <div class="form-input">
            <label>
              <font-awesome-icon :icon="['fas', 'cash-register']" />
              حالة السداد
            </label>
            <select v-model="car.payment">
              <option v-for="(s, n) in payment" :key="n" :value="s">
                {{ s }}
              </option>
            </select>
          </div>

          <div v-if="car.payment == 'أجل'">
            <div class="form-input">
              <label>
                <font-awesome-icon :icon="['fas', 'handshake']" />
                العميل
              </label>
              <select v-model="car.client">
                <option v-for="(s, n) in clients" :key="n" :value="s._id">
                  {{ s.name }}
                </option>
              </select>
            </div>

            <div class="form-input">
              <label>
                <font-awesome-icon :icon="['fas', 'truck']" />
                اسم المندوب
              </label>
              <input v-model="car.representative" />
            </div>
          </div>

          <div class="form-input">
            <label>
              <font-awesome-icon :icon="['fas', 'dollar-sign']" />
              تكلفة الفحص
            </label>
            <input v-model="car.cost" @input="(e) => validate(e)" />
          </div>
        </template>
      </div>
      <div class="logo">
        <div><img :src="$shop.logo" /></div>
        <div class="text-center" v-if="$shop.cr">س.ت: {{ $shop.cr }}</div>
      </div>

      <div class="third">
        <!-- uncomment this -->
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
    services: [
      "VIP",
      "شامل",
      "محركات",
      "بودي",
      "ماكينه",
      "قير",
      "ماكينه وقير",
      "شاص",
      "ارباج",
      "ماكينة قير شاص ارباج",
      "صيانة",
      "كمبيوتر",
    ],
    payment: ["كاش", "شبكة", "أجل"],
    clients: [],
  }),
  mounted() {
    this.$axios.$get("/clients").then((d) => (this.clients = d));
  },
  methods: {
    validate(e) {
      this.car.cost = e.target.value
        .replace(/[^0-9.]/g, "")
        .replace(/(\..*?)\..*/g, "$1");
    },
  },
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
