<template>
  <client-only>
    <div id="charts">
      <div class="intro">
        <div class="cash">
          <div class="table-container">
            <table>
              <thead>
                <td></td>
                <td
                  v-for="(a, n) in labels.map((e) => e || 'غير معروف')"
                  :key="n"
                >
                  {{ a }}
                </td>

                <td>سداد أجل</td>
              </thead>
              <tbody>
                <tr>
                  <td>عدد المعاملات</td>
                  <td v-for="(a, n) in labels" :key="n">
                    {{ cars(a).length }}
                  </td>
                  <td>{{ pays.length }}</td>
                </tr>

                <tr>
                  <td>اجمالي</td>
                  <td v-for="(a, n) in labels" :key="n">
                    {{
                      cars(a)
                        .reduce((a, b) => a + b.cost, 0)
                        .toFixed(2)
                    }}
                  </td>
                  <td>
                    {{ pays.reduce((a, b) => a - b.value, 0).toFixed(2) }}
                  </td>
                </tr>
                <tr border="1">
                  <td>اجمالي إيرادات</td>
                  <td colspan="5">
                    {{
                      (
                        data.reduce(
                          (a, b) => (b.payment == "أجل" ? a : a + b.cost),
                          0
                        ) + pays.reduce((a, b) => a - b.value, 0)
                      ).toFixed(2)
                    }}
                    <sub>ر.س</sub>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4 class="text-center gray">
            متابعة عمليات الحسابات والحركه الماليه للمعاملات
          </h4>
        </div>

        <div class="donut">
          <ApexCharts
            type="donut"
            height="300"
            :options="clirleOptions"
            :series="circleSeries"
          />
          <h4 class="text-center gray">متابعة طرق الدفع للمعاملات</h4>
        </div>
      </div>
      <div class="lines">
        <ApexCharts :options="options" :series="series" :height="320" />
      </div>
    </div>
  </client-only>
</template>

<script>
export default {
  props: ["x", "y", "data", "time"],
  name: "Charts",
  data: () => ({
    labels: ["أجل", "كاش", "شبكة", ""],
    colors: new Array(255)
      .fill(null)
      .map((e) => `hsl(${Math.random() * 255} 40% 60%)`),
    pays: [],
  }),
  computed: {
    options() {
      return {
        dir: "rtl",
        defaultLocale: "ar",
        plotOptions: {
          bar: {
            columnWidth: "20",
          },
        },
        colors: this.colors,
        chart: {
          toolbar: { show: true },
          type: "area",
        },
        xaxis: {
          type: "datetime",
          categories: this.y,
          labels: {
            datetimeUTC: false,
            style: {
              colors: this.colors,
              fontSize: "12px",
              fontFamily: "Alexandria",
            },
          },
        },
        legend: {
          show: false,
        },
        grid: { strokeDashArray: 2 },
      };
    },
    series() {
      return [
        {
          name: ".   سياره  .",
          data: this.x,
        },
      ];
    },

    // circle
    circleSeries() {
      return this.labels.map(
        (e) => this.data.filter((el) => el.payment == e).length
      );
    },
    clirleOptions() {
      return {
        labels: this.labels.map((el) => el || "غير معروف"),
        plotOptions: {
          pie: {
            offsetX: -30,
            customScale: 1,
            donut: {
              size: "60%",
              labels: {
                show: true,
                total: {
                  show: true,
                  label: "الإجمالي",
                },
              },
            },
          },
        },
        legend: {
          fontSize: "14px", // حجم الخط
          fontFamily: "Alexandria",
          labels: {
            itemMargin: {
              horizontal: 6,
            },
          },
        },
      };
    },
  },
  methods: {
    cars(payment) {
      return this.data.filter((e) => e.payment == payment);
    },
    generate_a_new_pay() {
      const length = this.y.length;

      if (length) {
        const one_day = 1000 * 60 * 60 * 24;
        const [start, end] = [this.y[length - 1], this.y[0] + one_day];

        this.$axios
          .$get(`/clients/custom_pays/${start}/${end}`)
          .then((r) => (this.pays = r));
      }
    },
    init() {
      if (this.time)
        this.$axios
          .$get("/clients/pays/" + this.time)
          .then((r) => (this.pays = r));
      else this.generate_a_new_pay();
    },
  },
  watch: {
    data() {
      this.init();
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style lang="scss" scoped>
#charts {
  display: flex;
  flex-direction: column;
  gap: 1em;
  margin-block-end: 10vh;

  .intro {
    display: flex;
    gap: 1em;

    .cash {
      flex: 1;
    }
  }
  .lines {
    direction: ltr;
  }

  .cash,
  .lines,
  .donut {
    padding: 1em;
    border-radius: 10px;
    background: white;
    border: 1px solid #adadad;
  }

  .donut {
    direction: ltr;
    width: 100%;
    max-width: 520px;
    align-self: flex-end;
  }

  .gray {
    color: #6a6a6a;
  }
}
</style>
