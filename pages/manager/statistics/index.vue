<template>
  <div class="container">
    <h3>الإحصائيات</h3>

    <section>
      <h4>
        هذا اليوم بعدد <span class="tomato">{{ last1.length }}</span> سياره.
      </h4>
      <Charts :data="last1" :x="array_1.x" :y="array_1.y" :time="1" />
    </section>

    <section>
      <h4>
        اخر 3 ايام بعدد <span class="tomato">{{ last3.length }}</span> سياره.
      </h4>
      <Charts :data="last3" :x="array_3.x" :y="array_3.y" :time="3" />
    </section>
    <section>
      <h4>
        اخر 7 ايام بعدد <span class="tomato">{{ last7.length }}</span> سياره.
      </h4>
      <Charts :data="last7" :x="array_7.x" :y="array_7.y" :time="7" />
    </section>
    <section>
      <h4>
        اخر 30 يوم بعدد <span class="tomato">{{ last30.length }} </span>سياره.
      </h4>
      <Charts :data="last30" :x="array_30.x" :y="array_30.y" :time="30" />
    </section>
    <section>
      <h4>
        اخر 365 يوم بعدد
        <span class="tomato">{{ last_year.length }} </span>سياره.
      </h4>
      <Charts :data="last_year" :x="array_365.x" :y="array_365.y" :time="365" />
    </section>
    <section>
      <h4>تقرير خاص</h4>

      <Special />
    </section>
  </div>
</template>

<script>
// components
import Charts from "@/components/manager/charts";
import Special from "@/components/manager/Special";

export default {
  async asyncData({ $axios }) {
    const last1 = await $axios.$get("/cars/last/1");
    const last3 = await $axios.$get("/cars/last/3");
    const last7 = await $axios.$get("/cars/last/7");
    const last30 = await $axios.$get("/cars/last/30");
    const last_year = await $axios.$get("/cars/last/365");

    return { last1, last3, last7, last30, last_year };
  },
  middleware: "manager",
  head() {
    return { title: "الإحصائيات" };
  },
  components: {
    Charts,
    Special,
  },

  // $moment(user.lastLogin).fromNow()
  computed: {
    array_1() {
      const x = [];
      const y = [];
      let times = this.last1.map((el) => Date.parse(el.date));

      let t = new Date();
      let n = t;
      let v = 0;

      const one_Hour = 1000 * 60 * 60;

      for (let i = 0; i <= t.getHours(); i++) {
        v = t - i * one_Hour;
        x.push(times.filter((el) => el > v && el < n).length);
        // y.push(this.$moment(v).format("hh:mm a"));
        y.push(v);
        n = v;
      }

      return { x, y };
    },
    array_3() {
      const x = [];
      const y = [];
      let times = this.last3.map((el) => Date.parse(el.date));

      let t = new Date(new Date().setHours(24, 0, 0, 0));
      let n = t;
      let v = 0;

      const one_day = 1000 * 60 * 60 * 24;

      for (let i = 1; i <= 3; i++) {
        v = t - i * one_day;
        x.push(times.filter((el) => el > v && el < n).length);
        // y.push(this.$moment(v).format("dddd, Do MMMM  YYYY"));
        y.push(v);
        n = v;
      }

      return { x, y };
    },
    array_7() {
      const x = [];
      const y = [];
      let times = this.last7.map((el) => Date.parse(el.date));

      let t = new Date(new Date().setHours(24, 0, 0, 0));
      let n = t;
      let v = 0;

      const one_day = 1000 * 60 * 60 * 24;

      for (let i = 1; i <= 7; i++) {
        v = t - i * one_day;
        x.push(times.filter((el) => el > v && el < n).length);
        // y.push(this.$moment(v).format("dddd, Do MMMM  YYYY"));
        y.push(v);
        n = v;
      }

      return { x, y };
    },
    array_30() {
      const x = [];
      const y = [];
      let times = this.last30.map((el) => Date.parse(el.date));

      let t = new Date(new Date().setHours(24, 0, 0, 0));
      let n = t;
      let v = 0;

      const one_day = 1000 * 60 * 60 * 24;

      for (let i = 1; i <= 30; i++) {
        v = t - i * one_day;
        x.push(times.filter((el) => el > v && el < n).length);
        // y.push(this.$moment(v).format(" DD MMM"));
        y.push(v);
        n = v;
      }

      return { x, y };
    },
    array_365() {
      const x = [];
      const y = [];
      let times = this.last_year.map((el) => Date.parse(el.date));

      let t = new Date(new Date().setHours(24, 0, 0, 0));
      let n = t;
      let v = 0;

      const one_month = 1000 * 60 * 60 * 24 * 30;

      for (let i = 1; i <= 12; i++) {
        v = t - i * one_month;
        x.push(times.filter((el) => el > v && el < n).length);
        // y.push(this.$moment(v).format("MMM"));
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
</style>
