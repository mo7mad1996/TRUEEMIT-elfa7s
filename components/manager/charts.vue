<template>
  <client-only>
    <ApexCharts :options="options" :series="series" :height="260" />
  </client-only>
</template>

<script>
export default {
  props: ["x", "y"],
  name: "Charts",
  computed: {
    options() {
      return {
        chart: {
          toolbar: { show: true },
          type: "bar",
        },
        xaxis: {
          categories: this.y,
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
  },
};
</script>

<style lang="scss" scoped></style>
