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
        <span class="count">{{ p.cars.length }}</span>
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
    // optional report-wide filters from the statistics page
    service: { type: String, default: "" },
    payment: { type: String, default: "" },
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
      let cars = this.cars[days] || [];

      // report-wide service / payment filters
      if (this.service) cars = cars.filter((car) => car.service === this.service);
      if (this.payment) cars = cars.filter((car) => car.payment === this.payment);

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
.exclusive_stats {
  // design tokens (Seline — see DESIGN.md)
  --card: #ffffff;
  --border: #e8e6e5;
  --muted: #d6d3d1;
  --ash: #a8a29e;
  --warm: #78716c;
  --ink: #0c0a09;
  --wash: #c1e1f7;
  --cyan: #3ba6f1;
  --cyan-edge: #3398e1;

  // breathing room between the stacked report sections (was cramped)
  display: flex;
  flex-direction: column;
  gap: 2.5em;
}

h4 {
  margin: 0 0 1.25em;
  padding-inline-start: 0.7em;
  border-right: 3px solid var(--cyan);
  font-weight: 500;
  font-size: 1.25em;
  letter-spacing: -0.015em;
  color: var(--ink);
}

// signature highlight span — cyan text on a soft sky-wash pill
.count {
  color: var(--cyan-edge);
  background: var(--wash);
  padding: 0.05em 0.45em;
  border-radius: 4px;
  font-variant-numeric: tabular-nums;
}

.total {
  font-weight: 700;
}

.cost {
  color: var(--cyan-edge);
}

tbody tr.active,
tbody tr.sum {
  background: rgba(59, 166, 241, 0.1);
}

.picker {
  max-width: 320px;

  .form-input {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  label {
    font-size: 0.72em;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ash);
  }

  select {
    padding: 9px 12px;
    border: 1px solid var(--muted);
    border-radius: 6px;
    background: var(--card);
    color: var(--ink);
    font: inherit;

    &:focus {
      outline: none;
      border-color: var(--cyan);
      box-shadow: 0 0 0 2px rgba(59, 166, 241, 0.35);
    }
  }
}
</style>
