<template>
  <section class="simple_form">
    <div class="row">
      <div class="form-input">
        <label for="start">من</label>
        <input type="date" v-model="start" id="start" />
      </div>
      <div class="form-input">
        <label for="end">إلى</label>
        <input type="date" v-model="end" id="end" />
      </div>
    </div>

    <Charts v-if="cars" :data="cars" :x="charts.x" :y="charts.y" />
  </section>
</template>

<script>
//
import Charts from "@/components/manager/charts";

export default {
  data() {
    const date = new Date();

    return {
      start: date.toISOString().slice(0, 10), // today
      end: date.toISOString().slice(0, 10),
      cars: null, // data to show
    };
  },
  watch: {
    start() {
      this.getData(this.start, this.end);
    },
    end() {
      this.getData(this.start, this.end);
    },
  },
  methods: {
    async getData(s, e) {
      // main constanrs
      const one_day = 1000 * 60 * 60 * 24;
      const start = new Date(s).getTime();
      const end = new Date(e).getTime();

      // timestamps
      const start_timestamp = Math.min(start, end);
      const end_timestamp = Math.max(start, end) + one_day;

      // request
      const data = await this.$axios.$get(
        `/cars/special/${start_timestamp}/${end_timestamp}`
      );

      this.cars = data;
    },
  },
  computed: {
    charts() {
      const x = [];
      const y = [];

      const s = this.start;
      const e = this.end;

      const start = new Date(s).getTime();
      const end = new Date(e).getTime();

      // timestamps
      const start_timestamp = Math.min(start, end);
      const end_timestamp = Math.max(start, end);

      // Calculate the difference in milliseconds
      const diffInMillis = end - start;

      // Convert milliseconds to days
      const oneDay = 1000 * 60 * 60 * 24;
      const diffInDays = diffInMillis / oneDay;

      let times = this.cars.map((el) => Date.parse(el.date));

      let t = new Date(e);
      let n = t;
      let v = 0;
      let i = 0;

      do {
        v = t - i * oneDay;
        x.push(times.filter((el) => el > v && el < n).length);
        // y.push(this.$moment(v).format("dddd, Do MMMM  YYYY"));
        y.push(v);
        n = v;
        i++;
      } while (i <= diffInDays);

      return { x, y };
    },
  },
  components: { Charts },
  mounted() {
    this.getData(this.start, this.end);
  },
};
</script>

<style lang="scss" scoped>
.row {
  display: flex;
  gap: 2em;
}
</style>
