<template>
  <div class="bg">
    <nuxt />
    <img class="logo-print" :src="$shop.logo" alt="" />
    <div class="address text-center" v-if="$shop.address">
      <span>
        <font-awesome-icon :icon="['fass', 'map-location-dot']" />
        {{ $shop.address }}
      </span>
      <span v-if="$shop.phone">
        <font-awesome-icon :icon="['fas', 'mobile-screen-button']" />
        {{ $shop.phone }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    window.print();
  },
};
</script>

<style lang="scss">
.bg {
  background: #706969;
  padding: 2em;

  @media print {
    background: white;
    padding: 0;
  }
}

.page {
  margin: 4em auto;
  background: white;
  width: 210mm;
  height: 297mm;
  padding: 0.5in;
  font-size: 16px;

  box-shadow: 0 0 10px #2a505d;

  @media print {
    width: calc(210mm - 1in);
    height: calc(297mm - 1in);
    padding: 0;
    box-shadow: none;
    margin: 0;
  }
}

.address {
  font-size: 0.7em;
  color: #777;
  box-sizing: border-box;
  width: 100%;
  border-top: 1px solid #333;
  display: none;

  span {
    padding-top: 0.2em;
    margin: 0.1em 0;
    display: block;
  }

  @media print {
    display: block;
    position: fixed;
    bottom: 0;
    left: 0;
  }
}

.logo-print {
  display: none;

  @media print {
    position: fixed;
    display: block;
    left: 1em;
    bottom: 3em;
    width: 7em;
    height: 7em;
    object-fit: contain;
  }
}
</style>
