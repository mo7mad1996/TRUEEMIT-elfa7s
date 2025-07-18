<template>
  <footer
    class="footer text-center border-t p-2 bg-neutral-50"
    v-if="$shop.address"
  >
    <div class="flex">
      <div class="right">
        <span>
          <font-awesome-icon :icon="['fas', 'map-location-dot']" />
          {{ $shop.address }}
        </span>
        <span v-if="$shop.phone">
          <font-awesome-icon :icon="['fas', 'mobile-screen-button']" />
          {{ $shop.phone }}
        </span>
      </div>

      <div class="left">
        <span v-if="$shop.twitter">
          <font-awesome-icon :icon="['fab', 'twitter']" />
          {{ $shop.twitter }}
        </span>
        <span v-if="$shop.tiktok">
          <font-awesome-icon :icon="['fab', 'tiktok']" />
          {{ $shop.tiktok }}
        </span>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@media print {
  footer.footer {
    display: table-footer-group;
  }
}

.flex {
  display: flex;
  justify-content: space-between;
}
</style>
