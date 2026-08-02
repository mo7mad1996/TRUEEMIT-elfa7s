<template>
  <div class="exclusive_stats">
    <section>
      <h4>ملخص كل شركة</h4>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>الشركة</th>
              <th v-for="p in periods" :key="p.days">{{ p.ar }}</th>
              <th>الإجمالي</th>
              <th>إيرادات ({{ periods[periods.length - 1].ar }})</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="owner in owners"
              :key="owner._id"
              @click="selected = owner._id"
              :class="{ active: selected == owner._id }"
              title="عرض تفاصيل هذه الشركة"
            >
              <td>{{ owner.name }}</td>
              <td v-for="p in periods" :key="p.days">
                {{ carsOf(owner._id, p.days).length }}
              </td>
              <td class="total">{{ owner.cars }}</td>
              <td class="cost">
                {{ income(carsOf(owner._id, 365)).toFixed(2) }}
              </td>
            </tr>

            <tr v-if="owners.length > 1" class="sum">
              <td>الكل</td>
              <td v-for="p in periods" :key="p.days">
                {{ carsOf("", p.days).length }}
              </td>
              <td class="total">
                {{ owners.reduce((a, b) => a + b.cars, 0) }}
              </td>
              <td class="cost">{{ income(carsOf("", 365)).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="!owners.length" class="text-center opacity-60 mt-4">
        لا يوجد مستخدمين من نوع شركة خاصه.
      </p>
    </section>

    <section class="picker" v-if="owners.length">
      <div class="form-input">
        <label for="exclusive_user">تفاصيل</label>
        <select v-model="selected" id="exclusive_user">
          <option value="">كل الشركات</option>
          <option v-for="owner in owners" :key="owner._id" :value="owner._id">
            {{ owner.name }}
          </option>
        </select>
      </div>
    </section>

    <section v-for="p in view" :key="p.days">
      <h4>
        {{ p.title }} بعدد
        <span class="tomato">{{ p.cars.length }}</span>
        سياره.
      </h4>

      <Charts :data="p.cars" :x="p.x" :y="p.y" :pays_enabled="false" />
    </section>

    <section>
      <h4>تقرير خاص</h4>

      <Special base="/cars-exclusive" :user="selected" />
    </section>
  </div>
</template>

<script>
import Charts from "@/components/manager/charts";
import Special from "@/components/manager/Special";

const one_hour = 1000 * 60 * 60;
const one_day = one_hour * 24;

export default {
  name: "ExclusiveStats",
  components: { Charts, Special },
  props: {
    owners: { type: Array, default: () => [] },
    // cars of each period, keyed by the period length in days
    cars: { type: Object, default: () => ({}) },
  },
  data: () => ({
    selected: "",
    periods: [
      { days: 1, ar: "اليوم", title: "هذا اليوم" },
      { days: 3, ar: "3 أيام", title: "اخر 3 ايام" },
      { days: 7, ar: "7 أيام", title: "اخر 7 ايام" },
      { days: 30, ar: "30 يوم", title: "اخر 30 يوم" },
      { days: 365, ar: "سنة", title: "اخر 365 يوم" },
    ],
  }),
  computed: {
    // the charts of the currently selected company
    view() {
      return this.periods.map((p) => {
        const cars = this.carsOf(this.selected, p.days);

        return { ...p, cars, ...this.buckets(cars, p.days) };
      });
    },
  },
  methods: {
    /**
     * The cars of one company (or of everybody when `user` is empty) within
     * the given period.
     */
    carsOf(user, days) {
      const cars = this.cars[days] || [];
      if (!user) return cars;

      // the legacy cars saved before cars had an owner
      if (user == "none") return cars.filter((car) => !car.user);

      return cars.filter((car) => String(car.user) == user);
    },

    income(cars) {
      return cars.reduce((a, b) => (b.payment == "أجل" ? a : a + b.cost), 0);
    },

    /**
     * Split the cars over the chart buckets — hours for today, days up to a
     * month, months for the year.
     */
    buckets(cars, days) {
      const x = [];
      const y = [];

      const times = cars.map((el) => Date.parse(el.date));

      const hourly = days == 1;
      const step = days == 365 ? one_day * 30 : hourly ? one_hour : one_day;

      const t = hourly ? new Date() : new Date(new Date().setHours(24, 0, 0, 0));
      const steps = days == 365 ? 12 : hourly ? t.getHours() : days;

      let n = t;

      for (let i = hourly ? 0 : 1; i <= steps; i++) {
        const v = t - i * step;

        x.push(times.filter((el) => el > v && el < n).length);
        y.push(v);
        n = v;
      }

      return { x, y };
    },
  },
};
</script>

<style lang="scss" scoped>
h4 {
  padding: 0 1em;
  border-right: 5px solid #000;
}

.tomato {
  color: tomato;
}

.total {
  font-weight: bold;
}

.cost {
  color: #3a78d7;
}

tbody tr.active,
tbody tr.sum {
  background: #23cb313e;
}

.picker {
  max-width: 320px;
}
</style>
