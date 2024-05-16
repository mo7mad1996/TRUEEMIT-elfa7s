<template>
  <div class="bg" ref="p">
    <nuxt />
    <img class="logo-print" :src="$shop.logo" alt="" />
    <div class="footer text-center" v-if="$shop.address">
      <div class="right">
        <span>
          <font-awesome-icon :icon="['fass', 'map-location-dot']" />
          {{ $shop.address }}
        </span>
        <span v-if="$shop.phone">
          <font-awesome-icon :icon="['fas', 'mobile-screen-button']" />
          {{ $shop.phone }}
        </span>
      </div>

      <div class="left">
        <span>
          <font-awesome-icon :icon="['fab', 'twitter']" />
          tashamlsa
        </span>
        <span>
          <font-awesome-icon :icon="['fab', 'tiktok']" />
          tashamlsa
        </span>
      </div>
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
  margin: 4em auto 0;
  background: white;
  width: 210mm;
  height: 297mm;
  padding: 0.5in;
  // font-size: 18px;
  overflow: hidden;

  box-shadow: 0 0 10px #2a505d;

  @media print {
    width: calc(210mm - 1in);
    height: calc(297mm - 1in);
    overflow: hidden !important;
    padding: 0;
    box-shadow: none;
    margin: 0;
  }
}

.footer {
  font-size: 0.7em;
  color: #000;
  box-sizing: border-box;
  width: 100%;
  border-top: 1px solid #333;
  position: fixed;
  bottom: 0;
  left: 0;
  display: none;

  > div {
    flex: 1;

    span {
      display: flex;
      gap: 1em;
      margin: 0.3em 0;

      svg {
        display: block;
        width: 1em;
      }
    }
  }

  .left {
    text-align: left;
    direction: ltr;
  }
  .right {
    text-align: right;
    direction: rtl;
  }

  @media print {
    display: flex;
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
