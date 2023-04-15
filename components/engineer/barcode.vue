<template>
  <svg id="svg_barcode" ref="svg"></svg>
</template>

<script>
export default {
  name: "BarCode",
  props: ["code"],
  mounted() {
    this.$barcode("#svg_barcode", this.code);
  },
  watch: {
    code() {
      this.$barcode("#svg_barcode", this.code);
    },
  },
};
</script>
